const fs = require("fs");
const csv = require("csv-parser");

const results = [];

fs.createReadStream("schemes.csv")
  .pipe(csv())
  .on("data", (data) => {
    try {
      results.push({
        name: data.scheme_name || "Not available",
        description: data.details || "Not available",
        benefits: data.benefits || "Not specified",
        eligibility: data.eligibility || "Not specified",
        category: data.schemeCategory || "General",
        state: data.level || "Central",
        application: data.application || "Not specified",
        documents: data.documents || "Not specified",
        tags: data.tags || ""
      });
    } catch (err) {
      console.log("Error processing row:", err);
    }
  })
  .on("end", () => {
    fs.writeFileSync(
      "schemes.json",
      JSON.stringify(results, null, 2)
    );
    console.log("✅ JSON file created successfully!");
  })
  .on("error", (err) => {
    console.error("❌ Error reading CSV:", err);
  });