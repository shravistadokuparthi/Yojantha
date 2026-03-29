import { useEffect, useState } from "react";
import "./MySchemes.css";

function MySchemes({ type = "interested", navigateTo }) {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("Please login first");
          return;
        }

        const userRes = await fetch("http://localhost:5000/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const user = await userRes.json();

        if (!user) { setSchemes([]); setLoading(false); return; }

        const ids = type === "applied"
          ? user.appliedSchemes || []
          : user.interestedSchemes || [];

        if (!ids.length) { setSchemes([]); setLoading(false); return; }

        const res = await fetch("http://localhost:5000/api/schemes/byIds", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids })
        });
        setSchemes((await res.json()) || []);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };
    fetchData();
  }, [type]);

  const isApplied = type === "applied";

  return (
    <div className="ms-root">

      {/* Header */}
      <div className="ms-header">
        <div className="ms-title-row">
          <span className="ms-icon">{isApplied ? "✅" : "⭐"}</span>
          <h2 className="ms-title">
            {isApplied ? "Applied Schemes" : "Interested Schemes"}
          </h2>
        </div>
        <p className="ms-sub">
          {loading
            ? "Fetching your schemes…"
            : schemes.length === 0
              ? "Nothing here yet."
              : `${schemes.length} scheme${schemes.length > 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="ms-skeletons">
          {[1, 2, 3].map(i => <div className="ms-skeleton" key={i} />)}
        </div>
      )}

      {/* Empty */}
      {!loading && schemes.length === 0 && (
        <div className="ms-empty">
          <div className="ms-empty-icon">{isApplied ? "📭" : "🔖"}</div>
          <p>
            {isApplied
              ? "You haven't applied to any schemes yet."
              : "You haven't marked any schemes as interested yet."}
          </p>
        </div>
      )}

      {/* List */}
      {!loading && schemes.length > 0 && (
        <div className="ms-list">
          {schemes.map((scheme, i) => (
            <div
              className="ms-card"
              key={scheme._id}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="ms-card-left">
                <div className="ms-card-badge">{isApplied ? "Applied" : "Interested"}</div>
                <h3 className="ms-card-name">{scheme.scheme_name}</h3>
                <p className="ms-card-desc">
                  {scheme.details
                    ? scheme.details.substring(0, 110) + "…"
                    : "No description available."}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default MySchemes;