const puppeteer = require("puppeteer");

async function fetchSchemes() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"]
  });

  const page = await browser.newPage();

  let apiData = [];

  // 🎯 Intercept API response
  page.on("response", async (response) => {
    try {
      const url = response.url();

      if (url.includes("api.myscheme.gov.in/search")) {
        const json = await response.json();
        apiData = json.data || [];
        console.log("✅ Captured:", apiData.length);
      }
    } catch (e) {}
  });

  await page.goto("https://www.myscheme.gov.in/search", {
    waitUntil: "networkidle2"
  });

  // wait for API call to happen
  await new Promise(resolve => setTimeout(resolve, 5000));

  await browser.close();

  let schemesArray = [];

// handle different structures
if (Array.isArray(apiData)) {
  schemesArray = apiData;
} else if (Array.isArray(apiData?.items)) {
  schemesArray = apiData.items;
} else if (Array.isArray(apiData?.results)) {
  schemesArray = apiData.results;
} else {
  console.log("⚠️ Unknown structure:", apiData);
  schemesArray = [];
}

return schemesArray.map(s => ({
  scheme_name: s.schemeName || "",
  details: s.shortDescription || "",
  benefits: s.benefits || "",
  eligibility: s.eligibility || "",
  schemeCategory: s.category || "",
  state: s.state || "",
  level: s.level || "",
  tags: (s.tags || []).join(", ")
}));
}

module.exports = fetchSchemes;