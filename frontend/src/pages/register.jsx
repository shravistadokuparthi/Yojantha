import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";

/* Password and Email Regex */
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;
const emailRegex    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Password strength */
const getPasswordStrength = (password) => {
  if (!password) return "";
  if (passwordRegex.test(password)) return "Strong";
  if (/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password)) return "Medium";
  return "Weak";
};

/* Strength Bar Component */
const StrengthBar = ({ password }) => {
  const s = getPasswordStrength(password);
  const colors = { Weak: "#ff4d6d", Medium: "#ffa94d", Strong: "#69db7c" };
  const filled = s === "Strong" ? 3 : s === "Medium" ? 2 : s === "Weak" ? 1 : 0;
  return (
    <div className="yj-strength-wrap">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="yj-strength-bar"
          style={{ background: i < filled ? colors[s] : undefined }}
        />
      ))}
      <span className="yj-strength-label" style={{ color: colors[s] || "transparent" }}>
        {s}
      </span>
    </div>
  );
};

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmPassword: ""
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleRegister = async () => {
    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required"); return;
    }
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address"); return;
    }
    if (password.toLowerCase() === name.toLowerCase()) {
      setError("Password cannot be the same as your name"); return;
    }
    if (!passwordRegex.test(password)) {
      setError("Password must contain at least 8 chars, letters, numbers & symbols"); return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match"); return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, confirmPassword })
      });
      const data = await response.json();
      if (response.ok) {
        alert("Registration successful 🎉");
        navigate("/");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch {
      setError("Server error. Try again later.");
    }
  };

  return (
    <div className="yj-root">
      {/* Animated Background Blobs */}
      <div className="yj-blob yj-blob-1" />
      <div className="yj-blob yj-blob-2" />
      <div className="yj-blob yj-blob-3" />

      {/* ── Left Panel ── */}
      <div className="yj-left">
        <div className="yj-brand">
          <div className="yj-brand-icon">🪷</div>
          <span className="yj-brand-name">Yojantha</span>
        </div>

        <h1 className="yj-tagline">
          Your rights.<br />
          <span>Your schemes.</span><br />
          Simplified.
        </h1>

        <p className="yj-sub">
          Join thousands of citizens already using Yojantha to discover
          and apply for 3,400+ government welfare schemes — for free.
        </p>

        <div className="yj-stats">
          <div>
            <div className="yj-stat-num">3,400+</div>
            <div className="yj-stat-label">Schemes</div>
          </div>
          <div>
            <div className="yj-stat-num">19</div>
            <div className="yj-stat-label">Categories</div>
          </div>
          <div>
            <div className="yj-stat-num">100%</div>
            <div className="yj-stat-label">Free</div>
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="yj-right">
        <div className="yj-card">
          <div className="yj-card-title">Create Account</div>
          <div className="yj-card-sub">Join Yojantha — it only takes a minute.</div>

          {error && <div className="yj-error">⚠ {error}</div>}

          <div className="yj-field">
            <label className="yj-label">Full Name</label>
            <input
              className="yj-input" name="name" type="text"
              placeholder="Your full name"
              value={formData.name} onChange={handleChange}
            />
          </div>

          <div className="yj-field">
            <label className="yj-label">Email Address</label>
            <input
              className="yj-input" name="email" type="email"
              placeholder="you@example.com"
              value={formData.email} onChange={handleChange}
            />
          </div>

          <div className="yj-field">
            <label className="yj-label">Password</label>
            <input
              className="yj-input" name="password" type="password"
              placeholder="••••••••"
              value={formData.password} onChange={handleChange}
            />
            {formData.password && <StrengthBar password={formData.password} />}
          </div>

          <div className="yj-field">
            <label className="yj-label">Confirm Password</label>
            <input
              className="yj-input" name="confirmPassword" type="password"
              placeholder="••••••••"
              value={formData.confirmPassword} onChange={handleChange}
              onPaste={(e) => e.preventDefault()}
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
            />
          </div>

          <button className="yj-btn" onClick={handleRegister}>
            Create Account →
          </button>

          <div className="yj-divider">or</div>

          <Link to="/" style={{ textDecoration: "none" }}>
            <button className="yj-btn-ghost">
              Already have an account? Sign in
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;