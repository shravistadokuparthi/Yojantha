import { useState } from "react";
import Home from "./home";
import Profile from "./profile";
import Schemes from "./schemes";
import Recommendations from "./recommendations";
import MySchemes from "./MySchemes";
import Chatbot from "./Chatbot";
import "./dashboard.css";
import ThematicBackground from "../components/ThematicBackground";

const NAV_ITEMS = [
  { id: "home",    label: "Home",    icon: "🏠" },
  { id: "schemes", label: "Schemes", icon: "📋" },
  { id: "profile", label: "Profile", icon: "👤" },
];

function Dashboard() {
  const [active, setActive] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // State passed from Schemes → Recommendations
  const [recParams, setRecParams] = useState({});
  // State passed from Home → MySchemes
  const [mySchemesType, setMySchemesType] = useState("interested");

  const navigateTo = (page, params = {}) => {
    if (page === "recommendations") {
      setRecParams(params);
    } else if (page === "myschemes") {
      setMySchemesType(params.type || "interested");
    }
    setActive(page);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    if (active === "home")            return <Home navigateTo={navigateTo} />;
    if (active === "profile")         return <Profile />;
    if (active === "schemes")         return <Schemes navigateTo={navigateTo} />;
    if (active === "recommendations") return <Recommendations userProfile={recParams.userProfile} navigateTo={navigateTo} />;
    if (active === "myschemes")       return <MySchemes type={mySchemesType} navigateTo={navigateTo} />;
  };

  // Label shown in topbar — covers internal panels too
  const PAGE_LABELS = {
    home:            { icon: "🏠", label: "Home" },
    schemes:         { icon: "📋", label: "Schemes" },
    profile:         { icon: "👤", label: "Profile" },
    recommendations: { icon: "✨", label: "Recommended Schemes" },
    myschemes:       { icon: mySchemesType === "applied" ? "✅" : "⭐", label: mySchemesType === "applied" ? "Applied Schemes" : "Interested Schemes" },
  };

  const currentPage = PAGE_LABELS[active] || PAGE_LABELS.home;

  return (
    <ThematicBackground opacity={0.05} animate={false}>
      <div className="dash-root">
        {/* Animated Background Blobs (The 'Nice Thing') */}
        <div className="yj-blob yj-blob-1" style={{ zIndex: 0 }} />
        <div className="yj-blob yj-blob-2" style={{ zIndex: 0 }} />
        <div className="yj-blob yj-blob-3" style={{ zIndex: 0 }} />

        {/* ── Sidebar ── */}
        <aside className={`dash-sidebar heritage-jaali ${sidebarOpen ? "open" : ""}`}>
          {/* Brand */}
          <div className="dash-brand">
            <div className="dash-brand-icon">
              {/* National Emblem (Lion Capital) */}
              🏛️
            </div>
            <div className="dash-brand-text">
              <span className="dash-brand-name">योजनांता</span>
              <span className="dash-brand-name" style={{ fontSize: '18px' }}>Yojanta</span>
              <span className="dash-brand-sub">सत्यमेव जयते ● Government of India</span>
            </div>
          </div>

        {/* Nav */}
        <nav className="dash-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`dash-nav-btn ${active === item.id ? "active" : ""}`}
              onClick={() => { setActive(item.id); setSidebarOpen(false); }}
            >
              <span className="dash-nav-icon">{item.icon}</span>
              <span className="dash-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer tag */}
        <div className="dash-sidebar-footer">
          <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>Digital India</div>
          <span>A Digital Excellence Initiative<br/>by MeitY, Govt. of India</span>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="dash-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main area ── */}
      <div className="dash-main">
        {/* Top bar */}
        <header className="dash-topbar">
          <button
            className="dash-hamburger"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>

          <div className="dash-topbar-title">
            {currentPage.icon}{" "}{currentPage.label}
          </div>

          <div className="dash-topbar-badge majestic-badge">
            <span className="dash-dot" />
            Viksit Bharat @ 2047
          </div>
        </header>

        {/* Page content */}
        <main className="dash-content" key={active}>
          {renderContent()}
        </main>
      </div>

      {/* Floating Chatbot */}
      <Chatbot />
    </div>
    </ThematicBackground>
  );
}

export default Dashboard;