import { useState } from "react";
import "./recommendations.css";
import { useLocation } from "react-router-dom";

function Recommendations() {

  const location = useLocation();
  const selectedType = location.state?.schemeType;

  const [selectedScheme, setSelectedScheme] = useState(null);

  const schemes = [
    {
      name: "Education Scholarship",
      type: "Education",
      description: "Financial support for students.",
      documents: ["Aadhaar Card", "Income Certificate", "Student ID"]
    },
    {
      name: "Women Welfare Scheme",
      type: "Women Welfare",
      description: "Support for women entrepreneurs.",
      documents: ["Aadhaar Card", "Address Proof", "Bank Passbook"]
    },
    {
      name: "Health Support Scheme",
      type: "Health",
      description: "Medical financial assistance.",
      documents: ["Aadhaar Card", "Medical Certificate"]
    },
    {
      name: "Startup India Scheme",
      type: "Startup",
      description: "Funding and support for startups.",
      documents: ["Aadhaar Card", "Business Plan", "Bank Details"]
    },
    {
      name: "Agriculture Subsidy",
      type: "Agriculture",
      description: "Financial help for farmers.",
      documents: ["Aadhaar Card", "Land Certificate", "Bank Passbook"]
    }
  ];

  // Filter schemes
  const filteredSchemes = schemes.filter(
    (scheme) => scheme.type === selectedType
  );

  return (
    <div className="recommend-container">

      <h2 className="page-title">Recommended Schemes</h2>

      <div className="scheme-grid">
        {filteredSchemes.map((scheme, index) => (
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