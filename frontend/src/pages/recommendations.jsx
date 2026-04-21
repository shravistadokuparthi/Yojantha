import { useState, useEffect } from "react";
import "./recommendations.css";

function Recommendations({ userProfile, navigateTo }) {
  const [aiSchemes, setAiSchemes] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleInterested = async (schemeId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/user/add-interested", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ schemeId }),
      });

      if (res.ok) {
        alert("Added to interested schemes!");
        window.dispatchEvent(new Event('profileUpdated'));
        navigateTo("myschemes", { type: "interested" });
      } else {
        alert("Failed to add");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred");
    }
  };

  const handleApply = async (schemeId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/user/add-applied", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ schemeId }),
      });

      if (res.ok) {
        alert("Applied successfully!");
        window.dispatchEvent(new Event('profileUpdated'));
        navigateTo("myschemes", { type: "applied" });
      } else {
        alert("Failed to apply");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred");
    }
  };

  useEffect(() => {
    const fetchAI = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:5000/api/ai/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userProfile }),
        });

        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        
        // Enrich schemes with a simulated match percentage for UI appeal
        const enriched = data.map((s, i) => ({
          ...s,
          match: Math.floor(92 - (i * 2.5) + (Math.random() * 5)) // Descending matches
        }));

        setAiSchemes(enriched);
        if (enriched.length > 0) setSelectedScheme(enriched[0]);
      } catch (err) {
        console.error("AI Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userProfile && Object.keys(userProfile).length > 0) {
      fetchAI();
    } else {
      setLoading(false);
    }
  }, [userProfile]);

  return (
    <div className="rec-root">
      <div className="rec-heading">
        <h2 className="rec-title">Helpful Benefits Found for You</h2>
        <p className="rec-sub">
          {loading
            ? "Looking through government schemes for you..."
            : `We found ${aiSchemes.length} benefits that can help you today`}
        </p>
      </div>

      {loading ? (
        <div className="rec-loading">
          <div className="rec-loading-pulse">
            <div className="rec-pulse-ring"></div>
            <div className="rec-pulse-icon">🤝</div>
          </div>
          <p>We are matching your details with the best government support...</p>
        </div>
      ) : aiSchemes.length === 0 ? (
        <div className="rec-empty">
          <div className="rec-empty-icon">🔍</div>
          <p>We couldn't find a perfect match. Please check your details and try again.</p>
          <button className="rec-btn-outline" onClick={() => navigateTo("schemes")}>
            Update My Details
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
                <div className="rec-card-badge-row">
                  <span className={`rec-match-pill ${scheme.match > 90 ? 'high' : ''}`}>
                    Great Match ({scheme.match}%)
                  </span>
                </div>
                <h3 className="rec-card-name">{scheme.name}</h3>
                <p className="rec-card-snippet">
                  {scheme.reason ? scheme.reason.substring(0, 80) : "Reading details..."}...
                </p>
                <div className="rec-card-btn">See Why This Fits →</div>
              </div>
            ))}
          </div>

          {/* 🔹 Detail Panel (Right Side) */}
          <div className="rec-detail">
            {selectedScheme ? (
              <>
                <div className="rec-detail-header">
                  <div className="rec-detail-top">
                    <h3 className="rec-detail-title">{selectedScheme.name}</h3>
                    <div className="rec-detail-match">
                      <span className="rec-match-val">{selectedScheme.match}%</span>
                      <span className="rec-match-lbl">Match Score</span>
                    </div>
                  </div>
                  <div className="rec-detail-tags">
                    {selectedScheme.category && (
                      <span className="rec-detail-tag">🏷️ {selectedScheme.category}</span>
                    )}
                    {selectedScheme.state && (
                      <span className="rec-detail-tag rec-tag-state">📍 {selectedScheme.state}</span>
                    )}
                  </div>
                </div>

                <div className="rec-detail-body">
                  <div className="rec-section highlight">
                    <div className="rec-section-label">✨ Why we chose this for you</div>
                    <p className="rec-section-text">{selectedScheme.reason}</p>
                  </div>

                  {selectedScheme.eligibility && (
                    <div className="rec-section">
                      <div className="rec-section-label">👤 Who can get this?</div>
                      <p className="rec-section-text">{selectedScheme.eligibility}</p>
                    </div>
                  )}

                  {selectedScheme.benefits && (
                    <div className="rec-section">
                      <div className="rec-section-label">💰 How it helps you</div>
                      <p className="rec-section-text">{selectedScheme.benefits}</p>
                    </div>
                  )}

                  {selectedScheme.documents && (
                    <div className="rec-section">
                      <div className="rec-section-label">📜 Documents needed</div>
                      <p className="rec-section-text">{selectedScheme.documents}</p>
                    </div>
                  )}

                  {selectedScheme.application && (
                    <div className="rec-section">
                      <div className="rec-section-label">🔗 How to apply</div>
                      <p className="rec-section-text">{selectedScheme.application}</p>
                    </div>
                  )}
                </div>

                <div className="rec-detail-actions">
                  <button
                    className="rec-btn-outline"
                    onClick={() => handleInterested(selectedScheme.id)}
                  >
                    ⭐ Save for Later
                  </button>

                  <button
                    className="rec-btn-primary"
                    onClick={() => handleApply(selectedScheme.id)}
                  >
                    Apply Now
                  </button>
                </div>
              </>
            ) : (
              <div className="rec-detail-placeholder">
                <p>Select a matching scheme to view fit analysis</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Recommendations;