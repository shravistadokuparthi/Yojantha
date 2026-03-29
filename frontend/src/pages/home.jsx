import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";

function Home() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({ eligible: 0, applied: 0 });
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

<<<<<<< HEAD

  window.addEventListener("focus", fetchVisitors);

  return () => {
    window.removeEventListener("focus", fetchVisitors);
  };
}, []);
  
=======
>>>>>>> ebcf4e5430538a4a3048badd4614cd3afdf9f3dd
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/user/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const user = await res.json();
        setStats({
          applied:  user.appliedSchemes?.length  || 0,
          eligible: user.interestedSchemes?.length || 0
        });
      } catch (err) { console.log(err); }
    };
    fetchStats();
  }, []);

  const updates = [
    "New Women Welfare Scheme launched",
    "Scholarship deadline extended to Dec 31",
    "Health scheme enrollment now open",
  ];

  return (
    <div className="home-root">

      {/* ── Hero ── */}
      <div className="home-hero">
        <div className="home-hero-text">
          <p className="home-eyebrow">🏛️ Government of India</p>
          <h1 className="home-headline">
            Welcome to<br />
            <span className="home-grad">Yojanta Portal</span>
          </h1>
          <p className="home-sub">
            Discover schemes tailored to your profile. Check eligibility,
            apply easily, and track your applications — all in one place.
          </p>
        </div>
        <div className="home-hero-stat">
          <div className="home-visitor-pill">
            <span className="home-vis-dot" />
            <span>{visitors.toLocaleString()} visitors today</span>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="home-stats-grid">
        <div
          className="home-stat-card home-stat-purple"
          onClick={() => navigate("/myschemes?type=interested")}
        >
          <div className="home-stat-icon">⭐</div>
          <div className="home-stat-num">{stats.eligible}</div>
          <div className="home-stat-label">Interested Schemes</div>
          <div className="home-stat-action">View all →</div>
        </div>

        <div
          className="home-stat-card home-stat-green"
          onClick={() => navigate("/myschemes?type=applied")}
        >
          <div className="home-stat-icon">✅</div>
          <div className="home-stat-num">{stats.applied}</div>
          <div className="home-stat-label">Applied Schemes</div>
          <div className="home-stat-action">View all →</div>
        </div>
      </div>

      {/* ── How It Works ── */}
      <div className="home-section-title">How It Works</div>
      <div className="home-steps">
        {[
          { num: "01", title: "Enter Details",      desc: "Fill in your personal & financial info." },
          { num: "02", title: "Get Recommendations", desc: "We match you with eligible schemes." },
          { num: "03", title: "Apply",              desc: "Submit your application in one click." },
          { num: "04", title: "Track Status",       desc: "Monitor progress on your dashboard." },
        ].map((s) => (
          <div className="home-step" key={s.num}>
            <div className="home-step-num">{s.num}</div>
            <div className="home-step-title">{s.title}</div>
            <div className="home-step-desc">{s.desc}</div>
          </div>
        ))}
      </div>

      {/* ── Latest Updates ── */}
      <div className="home-section-title">Latest Updates</div>
      <div className="home-updates">
        {updates.map((u, i) => (
          <div className="home-update-item" key={i}>
            <span className="home-update-dot" />
            <span>{u}</span>
          </div>
        ))}
      </div>

    </div>
  );
}

export default Home;