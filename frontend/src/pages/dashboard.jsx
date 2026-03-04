import { useState } from "react";
import Home from "./home";
import Profile from "./profile";
import Schemes from "./schemes";
import "./dashboard.css";

function Dashboard() {
  const [active, setActive] = useState("home");

  const renderContent = () => {
    if (active === "home") return <Home />;
    if (active === "profile") return <Profile />;
    if (active === "schemes") return <Schemes />;
  };

  return (
    <div className="dashboard">

      {/* Header Banner */}
      <div className="header">
        <h1>YOJANTA PORTAL</h1>
        <p>Government Scheme Management System</p>
      </div>

      {/* Navigation Menu */}
      <div className="navbar">
        <button onClick={() => setActive("home")}>Home</button>
        <button onClick={() => setActive("profile")}>Profile</button>
        <button onClick={() => setActive("schemes")}>Schemes</button>
      </div>

      {/* Content */}
      <div className="main-content">
        {renderContent()}
      </div>

    </div>
  );
}

export default Dashboard;