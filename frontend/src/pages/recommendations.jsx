import { useState } from "react";
import "./recommendations.css";

function Recommendations() {
  const [selectedScheme, setSelectedScheme] = useState(null);

  const schemes = [
    {
      name: "Education Scholarship",
      description: "Financial support for students.",
      documents: ["Aadhaar Card", "Income Certificate", "Student ID"]
    },
    {
      name: "Women Welfare Scheme",
      description: "Support for women entrepreneurs.",
      documents: ["Aadhaar Card", "Address Proof", "Bank Passbook"]
    },
    {
      name: "Health Support Scheme",
      description: "Medical financial assistance.",
      documents: ["Aadhaar Card", "Medical Certificate"]
    }
  ];

  return (
    <div className="recommend-container">

      <h2 className="page-title">Recommended Schemes</h2>

      {/* Wide Grid */}
      <div className="scheme-grid">
        {schemes.map((scheme, index) => (
          <div
            key={index}
            className="scheme-card"
            onClick={() => setSelectedScheme(scheme)}
          >
            <h3>{scheme.name}</h3>
            <p>{scheme.description}</p>
          </div>
        ))}
      </div>

      {/* Wide Details Section */}
      {selectedScheme && (
        <div className="details-section">
          <h3>{selectedScheme.name}</h3>
          <p>{selectedScheme.description}</p>

          <h4>Required Documents</h4>
          <ul>
            {selectedScheme.documents.map((doc, i) => (
              <li key={i}>{doc}</li>
            ))}
          </ul>

          <input type="file" />
          <button>Submit Application</button>
        </div>
      )}

    </div>
  );
}

export default Recommendations;