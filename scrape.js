const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto("https://www.myscheme.gov.in/schemes", {
    waitUntil: "networkidle2"
  });

  await page.waitForTimeout(3000); // wait for full load

  const schemes = await page.evaluate(() => {
    const data = [];

    // 🔍 Try grabbing headings
    const titles = document.querySelectorAll("h3");

    titles.forEach(title => {
      const name = title.innerText;

      if (name) {
        data.push({ name });
      }
    });

    return data;
  });

  console.log("Scraped Data:", schemes);

  // ✅ Save to file
  fs.writeFileSync("schemes.json", JSON.stringify(schemes, null, 2));

  await browser.close();
})();