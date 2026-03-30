import { useState, useEffect } from "react";
import "./recommendations.css";

function Recommendations({ userProfile, navigateTo }) {
  const [aiSchemes, setAiSchemes] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAI = async () => {
      try {
        setLoading(true);
        console.log("Starting AI fetch with profile:", userProfile);

        const res = await fetch("http://localhost:5000/api/ai/recommend", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userProfile }),
        });

        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json();
        console.log("AI RESPONSE RECEIVED:", data);
        
        setAiSchemes(data);
        
        // Automatically select the first scheme so the detail panel isn't empty
        if (data.length > 0) {
          setSelectedScheme(data[0]);
        }
      } catch (err) {
        console.error("AI Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userProfile && Object.keys(userProfile).length > 0) {
      fetchAI();
    } else {
      console.warn("No userProfile provided to Recommendations component.");
      setLoading(false);
    }
  }, [userProfile]);

  return (
    <div className="rec-root">
      {/* Heading */}
      <div className="rec-heading">
        <h2 className="rec-title">Recommended Schemes</h2>
        <p className="rec-sub">
          {loading
            ? "Finding best schemes for you..."
            : `${aiSchemes.length} scheme${aiSchemes.length !== 1 ? "s" : ""} matched your profile`}
        </p>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="rec-empty">
          <div className="rec-empty-icon">⏳</div>
          <p>Analyzing your profile using AI...</p>
        </div>
      ) : aiSchemes.length === 0 ? (
        <div className="rec-empty">
          <div className="rec-empty-icon">🔍</div>
          <p>No matching schemes found. Try adjusting your profile details.</p>
          <button className="rec-btn-outline" onClick={() => navigateTo("schemes")}>
            Go Back
          </button>
        </div>
      ) : (
        <div className="rec-layout">
          {/* 🔹 Scheme Grid (Left Side) */}
          <div className="rec-grid">
            {aiSchemes.map((scheme, index) => (
              <div
                key={index}
                className={`rec-card ${
                  selectedScheme?.name === scheme.name ? "rec-card-active" : ""
                }`}
                onClick={() => setSelectedScheme(scheme)}
              >
                <h3 className="rec-card-name">{scheme.name}</h3>
                <p className="rec-card-snippet">
                  {scheme.reason ? scheme.reason.substring(0, 90) : "Loading details..."}...
                </p>
                <div className="rec-card-cta">View details →</div>
              </div>
            ))}
          </div>

          {/* 🔹 Detail Panel (Right Side) */}
          <div className="rec-detail">
            {selectedScheme ? (
              <>
                <div className="rec-detail-header">
                  <h3 className="rec-detail-title">{selectedScheme.name}</h3>
                </div>

                <div className="rec-detail-body">
                  <div className="rec-section">
                    <div className="rec-section-label">Why this scheme suits you</div>
                    <p className="rec-section-text">{selectedScheme.reason}</p>
                  </div>
                </div>

                <div className="rec-detail-actions">
                  <button
                    className="rec-btn-outline"
                    onClick={() => alert("Interest recorded!")}
                  >
                    ⭐ Interested
                  </button>

                  <button
                    className="rec-btn-primary"
                    onClick={() => alert("Redirecting to application...")}
                  >
                    Apply Now →
                  </button>
                </div>
              </>
            ) : (
              <div className="rec-detail-placeholder">
                <p>Select a scheme to view more details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Recommendations;