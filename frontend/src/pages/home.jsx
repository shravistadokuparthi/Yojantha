import { useState, useEffect } from "react";
import "./home.css";

function Home({ navigateTo }) {

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
}, []);
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

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const handleProfileUpdate = () => {
      fetchStats();
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  const updates = [
    "New Women Welfare Scheme launched",
    "Scholarship deadline extended to Dec 31",
    "Health scheme enrollment now open",
  ];

  return (
    <div className="home-root">

      {/* ── Hero ── */}
      <div className="home-hero heritage-jaali">
        <div className="home-hero-text">
          <div className="home-official-badge">
            <span className="home-badge-icon">🏛️</span>
            <span className="home-badge-text">Government of India ● Citizen Support Portal</span>
          </div>
          <h1 className="home-headline">
            Find Help.<br />
            <span className="home-grad">Made Simple for You.</span>
          </h1>
          <p className="home-sub">
            The Government of India provides thousands of benefits for citizens like you. 
            We make it easy to find precisely which ones can help you and your family 
            today — with no complicated paperwork.
          </p>


          <div className="home-hero-footer">
            <button className="home-btn-primary" onClick={() => navigateTo("schemes")}>
              Find My Benefits →
            </button>
          </div>
        </div>
        <div className="home-hero-stat">
          <div className="home-visitor-card majestic-card">
            <div className="home-visitor-header">
              <span className="home-vis-dot" />
              National Support
            </div>
            <div className="home-vis-count">{visitors.toLocaleString()}</div>
            <div className="home-vis-label">People Helping Each Other Today</div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="home-stats-grid">
        <div
          className="home-stat-card home-stat-blue"
          onClick={() => navigateTo("myschemes", { type: "interested" })}
        >
          <div className="home-stat-top">
            <div className="home-stat-icon">⭐</div>
            <div className="home-stat-pill">Saved</div>
          </div>
          <div className="home-stat-main">
            <div className="home-stat-num">{stats.eligible}</div>
            <div className="home-stat-label">Benefits I Liked</div>
          </div>
          <div className="home-stat-footer">See your saved list →</div>
        </div>

        <div
          className="home-stat-card home-stat-saffron"
          onClick={() => navigateTo("myschemes", { type: "applied" })}
        >
          <div className="home-stat-top">
            <div className="home-stat-icon">✅</div>
            <div className="home-stat-pill">Ready</div>
          </div>
          <div className="home-stat-main">
            <div className="home-stat-num">{stats.applied}</div>
            <div className="home-stat-label">Benefits I Applied For</div>
          </div>
          <div className="home-stat-footer">Check your progress →</div>
        </div>
      </div>

      {/* ── How It Works ── */}
      <div className="home-section-header">
        <div className="home-section-title">How Yojanta Helps You</div>
        <p className="home-section-sub">A simple way to get the support you deserve</p>
      </div>
      <div className="home-steps">
        {[
          { num: "01", title: "Tell Us About Yourself",      desc: "Answer a few simple questions about your life." },
          { num: "02", title: "We Find Your Matches", desc: "We check which government schemes fit you best." },
          { num: "03", title: "Easy Application",       desc: "Follow our simple steps to apply for your support." },
          { num: "04", title: "Get Your Benefits",      desc: "Track everything right here within the portal." },
        ].map((s) => (
          <div className="home-step" key={s.num}>
            <div className="home-step-num">{s.num}</div>
            <div className="home-step-title">{s.title}</div>
            <div className="home-step-desc">{s.desc}</div>
          </div>
        ))}
      </div>

      {/* ── Latest Updates ── */}
      <div className="home-section-header">
        <div className="home-section-title">National Updates</div>
        <p className="home-section-sub">Stay informed about new government initiatives</p>
      </div>
      <div className="home-updates">
        {updates.map((u, i) => (
          <div className="home-update-item" key={i}>
            <span className="home-update-dot" />
            <div className="home-update-content">
              <span className="home-update-text">{u}</span>
              <span className="home-update-time">Just now</span>
            </div>
            <span className="home-update-arrow">→</span>
          </div>
        ))}
      </div>

    </div>
  );
}

export default Home;