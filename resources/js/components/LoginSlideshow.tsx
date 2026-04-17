// LoginSlideshow.tsx
import { useState, useEffect } from "react";
import axios from "axios";

export default function LoginSlideshow() {
  const [slides, setSlides] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);

      useEffect(() => {
      const fetchSlides = async () => {
        try {
          const { data } = await axios.get("/company/logos");
          // shuffle images randomly
          const shuffled = data.sort(() => Math.random() - 0.5);
          setSlides(shuffled);
        } catch (err) {
          console.error("Failed to fetch company logos:", err);
        }
      };
      fetchSlides();
    }, []);


  useEffect(() => {
    
    if (slides.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => {const next = (prev + 1) % slides.length;

      // sync gradient each time slide changes
      document.documentElement.style.setProperty(
        "--gradient-pos",
        next % 2 === 0 ? "0%" : "100%"
      );
      return next;
    })
    }, 2500);

    return () => clearInterval(interval);
  }, [slides]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 h-full w-full bg-cover bg-center transition-opacity duration-1000 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url('${slide}')` }}
        />
      ))}
    </div>
  );
}
