import { useState, useEffect } from "react";
import "./recommendations.css";

function Recommendations({ schemeType, level, navigateTo }) {
  const [schemes, setSchemes]               = useState([]);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [user, setUser]                     = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/user/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setUser(await res.json());
      } catch (err) { console.log(err); }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!schemeType) return;
    fetch(`http://localhost:5000/api/schemes?type=${schemeType}&level=${level || ""}`)
      .then(res => res.json())
      .then(data => {
        setSchemes(data);
        localStorage.setItem("eligibleCount", data.length);
      })
      .catch(err => console.log(err));
  }, [schemeType, level]);

  const handleInterested = async (schemeId) => {
    try {
      await fetch("http://localhost:5000/api/apply/interested", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ schemeId })
      });
      setUser((prev) => ({
        ...prev,
        interestedSchemes: [...(prev?.interestedSchemes || []), schemeId]
      }));
      alert("Marked as Interested ⭐");
    } catch (err) { console.log(err); }
  };

  const handleApply = async (schemeId) => {
    try {
      await fetch("http://localhost:5000/api/apply/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ schemeId })
      });
      setUser((prev) => ({
        ...prev,
        appliedSchemes: [...(prev?.appliedSchemes || []), schemeId],
        interestedSchemes: prev?.interestedSchemes?.filter(id => id !== schemeId)
      }));
      alert("Application Submitted ✅");
    } catch (err) { console.log(err); }
  };

  return (
    <div className="rec-root">

      {/* Page heading */}
      <div className="rec-heading">
        <h2 className="rec-title">Recommended Schemes</h2>
        <p className="rec-sub">
          {schemes.length > 0
            ? `${schemes.length} scheme${schemes.length > 1 ? "s" : ""} matched your profile`
            : "Looking for matching schemes…"}
        </p>
      </div>

      {schemes.length === 0 ? (
        <div className="rec-empty">
          <div className="rec-empty-icon">🔍</div>
          <p>No schemes found for your selection.</p>
        </div>
      ) : (
        <div className="rec-layout">

          {/* ── Scheme Grid ── */}
          <div className="rec-grid">
            {schemes.map((scheme) => (
              <div
                key={scheme._id}
                className={`rec-card ${selectedScheme?._id === scheme._id ? "rec-card-active" : ""}`}
                onClick={() => setSelectedScheme(scheme)}
              >
                <h3 className="rec-card-name">{scheme.scheme_name}</h3>
                <p className="rec-card-snippet">
                  {scheme.details?.substring(0, 90)}…
                </p>
                <div className="rec-card-cta">View details →</div>
              </div>
            ))}
          </div>

          {/* ── Detail Panel ── */}
          {selectedScheme && (
            <div className="rec-detail">
              <div className="rec-detail-header">
                <h3 className="rec-detail-title">{selectedScheme.scheme_name}</h3>
              </div>

              <div className="rec-detail-body">
                <div className="rec-section">
                  <div className="rec-section-label">Description</div>
                  <p className="rec-section-text">{selectedScheme.details}</p>
                </div>
                <div className="rec-section">
                  <div className="rec-section-label">Benefits</div>
                  <p className="rec-section-text">{selectedScheme.benefits}</p>
                </div>
                <div className="rec-section">
                  <div className="rec-section-label">Eligibility</div>
                  <p className="rec-section-text">{selectedScheme.eligibility}</p>
                </div>
                <div className="rec-section">
                  <div className="rec-section-label">Documents Required</div>
                  <p className="rec-section-text">{selectedScheme.documents}</p>
                </div>
              </div>

              <div className="rec-detail-actions">
                <button
                  className="rec-btn-outline"
                  onClick={() => handleInterested(selectedScheme._id)}
                  disabled={user?.interestedSchemes?.includes(selectedScheme._id)}
                >
                  {user?.interestedSchemes?.includes(selectedScheme._id)
                    ? "⭐ Already Interested"
                    : "⭐ Interested"}
                </button>
                <button
                  className="rec-btn-primary"
                  onClick={() => handleApply(selectedScheme._id)}
                  disabled={user?.appliedSchemes?.includes(selectedScheme._id)}
                >
                  {user?.appliedSchemes?.includes(selectedScheme._id)
                    ? "✅ Already Applied"
                    : "Apply Now →"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Recommendations;