import { useState, useEffect } from "react";
import "./recommendations.css";
import { useLocation } from "react-router-dom";

function Recommendations() {

  const location = useLocation();

  const selectedType =
    location.state?.schemeType || localStorage.getItem("schemeType");

  const level = localStorage.getItem("level");

  const [schemes, setSchemes] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [user, setUser] = useState(null);

  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/user/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        const data = await res.json();
        setUser(data);

      } catch (err) {
        console.log(err);
      }
    };

    fetchUser();
  }, []);

  
  useEffect(() => {
    fetch(`http://localhost:5000/api/schemes?type=${selectedType}&level=${level}`)
      .then(res => res.json())
      .then(data => {
        setSchemes(data);

        localStorage.setItem("eligibleCount", data.length);
      })
      .catch(err => console.log(err));
  }, [selectedType, level]);

 
  const handleInterested = async (schemeId) => {
  try {
    const res = await fetch("http://localhost:5000/api/apply/interested", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ schemeId })
    });

    await res.json();

    
    setUser((prev) => ({
      ...prev,
      interestedSchemes: [...(prev?.interestedSchemes || []), schemeId]
    }));

    alert("Marked as Interested ⭐");

  } catch (err) {
    console.log(err);
  }
};


  const handleApply = async (schemeId) => {
  try {
    const res = await fetch("http://localhost:5000/api/apply/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ schemeId })
    });

    await res.json();

    setUser((prev) => ({
      ...prev,
      appliedSchemes: [...(prev?.appliedSchemes || []), schemeId],
      interestedSchemes: prev?.interestedSchemes?.filter(id => id !== schemeId)
    }));

    alert("Application Submitted ✅");

  } catch (err) {
    console.log(err);
  }
};

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

          {/* INTERESTED BUTTON */}
          <button
            onClick={() => handleInterested(selectedScheme._id)}
            disabled={user?.interestedSchemes?.includes(selectedScheme._id)}
          >
            {user?.interestedSchemes?.includes(selectedScheme._id)
              ? "Already Interested"
              : " Interested"}
          </button>

          {/*  APPLY BUTTON */}
          <button
            onClick={() => handleApply(selectedScheme._id)}
            disabled={user?.appliedSchemes?.includes(selectedScheme._id)}
          >
            {user?.appliedSchemes?.includes(selectedScheme._id)
              ? " Already Applied"
              : " Apply"}
          </button>

        </div>
      )}

    </div>
  );
}

export default Recommendations;
