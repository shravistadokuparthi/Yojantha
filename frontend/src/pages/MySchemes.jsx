import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function MySchemes() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  
  const type = searchParams.get("type") || "interested";

  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          alert("Please login first");
          navigate("/login");
          return;
        }

        console.log("TYPE:", type);

   
        const userRes = await fetch("http://localhost:5000/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const user = await userRes.json();
        console.log("USER:", user);

        if (!user) {
          setSchemes([]);
          setLoading(false);
          return;
        }

   
        const ids =
          type === "applied"
            ? user.appliedSchemes || []
            : user.interestedSchemes || [];

        console.log("IDS:", ids);

        if (!ids.length) {
          setSchemes([]);
          setLoading(false);
          return;
        }

  
        const res = await fetch("http://localhost:5000/api/schemes/byIds", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ ids })
        });

        const data = await res.json();
        console.log("SCHEMES:", data);

        setSchemes(data || []);
        setLoading(false);

      } catch (err) {
        console.log("ERROR:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [type, navigate]);

  return (
    <div style={{ padding: "20px" }}>

      <h2>
        {type === "applied"
          ? "Applied Schemes ✅"
          : "Interested Schemes ⭐"}
      </h2>

      {/* ✅ LOADING */}
      {loading && <p>Loading...</p>}

      {/* ✅ NO DATA */}
      {!loading && schemes.length === 0 && (
        <p>No schemes found</p>
      )}

      {/* ✅ DISPLAY DATA */}
      {!loading &&
        schemes.map((scheme) => (
          <div
            key={scheme._id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              margin: "10px 0",
              padding: "15px",
              background: "#fff"
            }}
          >
            <h3>{scheme.scheme_name}</h3>
            <p>
  {scheme.details
    ? scheme.details.substring(0, 100) + "..."
    : "No description available"}
</p>
          </div>
        ))}

    </div>
  );
}

export default MySchemes;
