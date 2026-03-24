import { useState, useEffect } from "react";
import "./recommendations.css";
import { useLocation } from "react-router-dom";

function Recommendations() {

  const location = useLocation();

  // ✅ FIX 1: get from localStorage if state is lost (refresh case)
  const selectedType =
    location.state?.schemeType || localStorage.getItem("schemeType");

  const [schemes, setSchemes] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState(null);

  useEffect(() => {

    if (!selectedType) {
      console.log("No selectedType found");
      return;
    }

    fetch(`http://localhost:5000/api/schemes?type=${selectedType}`)
      .then(res => res.json())
      .then(data => {
        console.log("Selected Type:", selectedType);
        console.log("All Data:", data);
        setSchemes(data);
      })
      .catch(err => console.log(err));

  }, [selectedType]);

  return (
    <div className="recommend-container">

      <h2 className="page-title">Recommended Schemes</h2>

      {schemes.length === 0 ? (
        <p>No schemes found</p>
      ) : (
        <div className="scheme-grid">
          {schemes.map((scheme) => (
            <div
              key={scheme._id}
              className="scheme-card"
              onClick={() => setSelectedScheme(scheme)}
            >
              <h3>{scheme.scheme_name}</h3>
              <p>{scheme.details?.substring(0, 100)}...</p>
            </div>
          ))}
        </div>
      )}

      {selectedScheme && (
        <div className="details-section">

          <h3>{selectedScheme.scheme_name}</h3>
          <p>{selectedScheme.details}</p>

          <h4>Benefits</h4>
          <p>{selectedScheme.benefits}</p>

          <h4>Eligibility</h4>
          <p>{selectedScheme.eligibility}</p>

          <h4>Documents</h4>
          <p>{selectedScheme.documents}</p>

          <input type="file" />
          <button>Submit Application</button>

        </div>
      )}

    </div>
  );
}

export default Recommendations;