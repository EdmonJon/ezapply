import puppeteer from "puppeteer";
import fs from "fs/promises";

(async () => {
  console.log("🌐 Launching browser...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("https://www.pfa.org.ph/members", { waitUntil: "networkidle2" });
  await page.waitForSelector('li[data-hook="product-list-grid-item"]');

  // Scrape all product cards first
  const members = await page.$$eval('li[data-hook="product-list-grid-item"]', (cards) =>
    cards.map((card) => {
      const name = card.querySelector('[data-hook="product-item-name"]')?.textContent?.trim() || "";
      const price = card.querySelector('[data-hook="product-item-price-to-pay"]')?.textContent?.trim() || "";
      const img = card.querySelector("img")?.src || "";
      const link = card.querySelector("a[data-hook='product-item-container']")?.href || "";
      return { name, price, img, link };
    })
  );

  console.log(`🔗 Found ${members.length} franchise listings`);
  let detailed = [];

  // Now visit each company page to scrape details
  for (let i = 0; i < members.length; i++) {
    const m = members[i];
    console.log(`➡️ Scraping details for: ${m.name}`);
    try {
      await page.goto(m.link, { waitUntil: "networkidle2" });
      await page.waitForSelector("ul[data-hook='stacked-info-section']", { timeout: 8000 });

      const info = await page.$$eval("li[data-hook='stacked-info-item']", (items) => {
        let data = {};
        items.forEach((li) => {
          const title = li.querySelector("h2")?.textContent?.trim().toUpperCase();
          const value = li.querySelector("div p")?.textContent?.trim();
          if (title && value) data[title] = value;
        });
        return data;
      });

      detailed.push({ ...m, ...info });
    } catch (err) {
      console.log(`⚠️ Failed to scrape ${m.name}: ${err.message}`);
      detailed.push(m);
    }
  }

  await fs.writeFile("pfa_members.json", JSON.stringify(detailed, null, 2));
  console.log(`✅ Saved ${detailed.length} companies to pfa_members.json`);

  await browser.close();
})();