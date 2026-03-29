import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";

function Home() {
  const navigate = useNavigate();

  // ✅ Stats state
  const [stats, setStats] = useState({
    eligible: 0,
    applied: 0
  });

  const [visitors, setVisitors] = useState(0);


  useEffect(() => {
  const fetchVisitors = () => {
    fetch("http://localhost:5000/api/visit?type=get")
      .then(res => res.json())
      .then(data => {
        console.log("Visitors:", data);
        setVisitors(data?.count || 0);
      })
      .catch(err => console.log(err));
  };


  fetchVisitors();


  if (!sessionStorage.getItem("visited")) {
    sessionStorage.setItem("visited", "true");

    fetch("http://localhost:5000/api/visit")
      .then(res => res.json())
      .then(data => setVisitors(data?.count || 0))
      .catch(err => console.log(err));
  }


  window.addEventListener("focus", fetchVisitors);

  return () => {
    window.removeEventListener("focus", fetchVisitors);
  };
}, []);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/user/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        const user = await res.json();

        setStats({
          applied: user.appliedSchemes?.length || 0,
          eligible: user.interestedSchemes?.length || 0
        });

      } catch (err) {
        console.log(err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="home-container">

      {/* Hero Section */}
      <div className="card">
        <h1>Welcome to Yojanta Portal</h1>
        <p>
          Discover government schemes tailored to your needs.
          Check eligibility, apply easily, and track your applications.
        </p>
      </div>

      {/* Stats Section */}
      <div className="stats">

        <div
          className="stat-card"
          onClick={() => navigate("/myschemes?type=interested")}
        >
          <h4>Eligible Schemes</h4>
          <p>{stats.eligible}</p>
        </div>

        <div
          className="stat-card"
          onClick={() => navigate("/myschemes?type=applied")}
        >
          <h4>Applied</h4>
          <p>{stats.applied}</p>
        </div>

      </div>

      {/* Visitor Count */}
      <div className="card">
        <h3>Total Visitors</h3>
        <p>{visitors}</p>
      </div>

      {/* Updates */}
      <div className="card">
        <h3>Latest Updates</h3>
        <ul>
          <li>New Women Welfare Scheme launched</li>
          <li>Scholarship deadline extended</li>
          <li>Health scheme enrollment open</li>
        </ul>
      </div>

      {/* How It Works */}
      <div className="card">
        <h3>How It Works</h3>
        <p>
          1️⃣ Enter your details → 2️⃣ Get recommended schemes → 
          3️⃣ Apply → 4️⃣ Track status
        </p>
      </div>

    </div>
  );
}

export default Home;