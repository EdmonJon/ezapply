import puppeteer from "puppeteer";
import fs from "fs";

const BASE_URL = "https://www.pfa.org.ph/members";

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 500;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 300);
    });
  });
}

(async () => {
  console.log("🌐 Launching browser...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  console.log(`🔗 Visiting ${BASE_URL}...`);
  await page.goto(BASE_URL, { waitUntil: "networkidle2", timeout: 0 });

  console.log("⏳ Scrolling to load all members...");
  await autoScroll(page);
  await new Promise((r) => setTimeout(r, 3000));

  console.log("📦 Extracting company data...");
  const companies = await page.evaluate(() => {
    const items = [];
    const elements = document.querySelectorAll('[data-hook="product-list-grid-item"]');
    elements.forEach((el) => {
      const name = el.querySelector('[data-hook="product-item-name"]')?.innerText?.trim() || "";
      const price = el.querySelector('[data-hook="product-item-price-to-pay"]')?.innerText?.trim() || "";
      const img = el.querySelector("img")?.src || "";
      const link = el.querySelector("a")?.href || "";
      items.push({ name, price, img, link });
    });
    return items;
  });

  console.log(`✅ Found ${companies.length} companies`);
  console.log("🔍 Visiting each company page for more info...");

  for (let i = 0; i < companies.length; i++) {
    const company = companies[i];
    try {
      console.log(`➡️ [${i + 1}/${companies.length}] Scraping ${company.name}`);
      await page.goto(company.link, { waitUntil: "networkidle2", timeout: 0 });

      const details = await page.evaluate(() => {
        const description =
          document.querySelector('[data-hook="description"]')?.innerText?.trim() ||
          document.querySelector('[data-hook="product-description"]')?.innerText?.trim() ||
          "";
        const contact = Array.from(document.querySelectorAll("p"))
          .map((p) => p.innerText)
          .find((t) => t.match(/@|contact|tel|email|www|address|facebook/i)) || "";
        return { description, contact };
      });

      Object.assign(company, details);
    } catch (err) {
      console.warn(`⚠️ Error scraping ${company.name}:`, err.message);
    }
  }

  fs.writeFileSync("./pfa_companies_detailed.json", JSON.stringify(companies, null, 2));
  console.log("💾 Saved detailed data to pfa_companies_detailed.json");

  await browser.close();
})();