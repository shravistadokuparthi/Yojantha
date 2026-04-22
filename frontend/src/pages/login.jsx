import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import ThematicBackground from "../components/ThematicBackground";

/* ── PASSWORD REGEX ── */
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;

/* ── PASSWORD STRENGTH ── */
const getPasswordStrength = (password) => {
  if (!password) return "";
  if (passwordRegex.test(password)) return "Strong";
  if (/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password)) return "Medium";
  return "Weak";
};

/* ── STRENGTH BAR COMPONENT ── */
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

/* ══════════════════════════════════════════
   LOGIN COMPONENT
══════════════════════════════════════════ */
function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailExists, setEmailExists] = useState(null); // null, true, or false


  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStage, setResetStage] = useState(1);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  /* CHECK EMAIL */
  const checkEmailExists = async (val) => {
    if (!val || !val.includes("@")) return;
    try {
      const res = await fetch("http://localhost:5000/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: val }),
      });
      const data = await res.json();
      setEmailExists(data.exists);
      if (!data.exists) {
        setError("This email is not registered yet.");
      } else {
        setError("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async () => {

    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);

    try {

      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        setError(data.message);
      }

    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }

  };

  /* FORGOT PASSWORD EMAIL */
  const handleForgotPassword = async () => {

    setLoading(true);

    try {

      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await res.json();
      alert(data.message);

      if (res.ok) setResetStage(2);

    } catch {
      console.log("error");
    } finally {
      setLoading(false);
    }

  };

  /* RESET PASSWORD */
  const handleResetPassword = async () => {

    if (!newPassword || !confirmPassword) {
      alert("All password fields required");
      return;
    }

    /* Password cannot contain username */
    const username = resetEmail.split("@")[0].toLowerCase();
    if (newPassword.toLowerCase().includes(username)) {
      alert("Password cannot contain your username");
      return;
    }

    /* Regex validation */
    if (!passwordRegex.test(newPassword)) {
      alert("Password must be 8+ characters with letters, numbers & symbols");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {

      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, newPassword, confirmPassword }),
      });

      const data = await res.json();
      alert(data.message);

      if (res.ok) {
        setShowForgot(false);
        setResetStage(1);
        setNewPassword("");
        setConfirmPassword("");
        setResetEmail("");
      }

    } catch {
      console.log("error");
    } finally {
      setLoading(false);
    }

  };

  return (
    <ThematicBackground opacity={0.4} animate={true} mode="light">
      <div className="yj-root">
        {/* Animated Background Blobs */}
        <div className="yj-blob yj-blob-1" />
        <div className="yj-blob yj-blob-2" />
        <div className="yj-blob yj-blob-3" />

        {/* ── LEFT PANEL ── */}
        <div className="yj-left">
          <div className="yj-brand">
            <div className="yj-brand-icon">🏛️</div>
            <div className="yj-brand-text">
              <span className="yj-brand-name">योजनांता</span>
              <span className="yj-brand-sub" style={{ display: 'block', marginTop: '4px', color: '#64748b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                सत्यमेव जयते ● Government of India
              </span>
            </div>
          </div>

          <div className="yj-tagline">
            Your schemes.<br />
            <span>Your rights.</span><br />
            Simplified.
          </div>

          <p className="yj-sub">
            AI-powered access to 3,400+ government welfare schemes —
            matched to your profile in seconds.
          </p>

          <div className="yj-stats">
            <div className="yj-stat-capsule">
              <div className="yj-stat-num">3,400+</div>
              <div className="yj-stat-label">Schemes</div>
            </div>
            <div className="yj-stat-capsule">
              <div className="yj-stat-num">19</div>
              <div className="yj-stat-label">Categories</div>
            </div>
            <div className="yj-stat-capsule">
              <div className="yj-stat-num">100%</div>
              <div className="yj-stat-label">Free</div>
            </div>
          </div>

        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="yj-right">
          <div className="yj-card">
            <div className="yj-card-header">
              <div className="yj-card-title">Welcome back</div>
              <div className="yj-card-sub">Sign in to your Yojanta account</div>
            </div>
            {!showForgot ? (
              <>
                <div className="yj-field">
                  <label className="yj-label">Email</label>
                  <input
                    className="yj-input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { 
                      setEmail(e.target.value); 
                      setError(""); 
                      setEmailExists(null); 
                    }}
                    onBlur={(e) => checkEmailExists(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                  {emailExists === true && <div className="yj-success-hint">✓ Account found</div>}
                </div>


                <div className="yj-field">
                  <label className="yj-label">Password</label>
                  <input
                    className="yj-input"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                </div>

                <div className="yj-row">
                  <span className="yj-link" onClick={() => setShowForgot(true)}>
                    Forgot password?
                  </span>
                </div>

                {error && <div className="yj-error">⚠ {error}</div>}

                <button className="yj-btn" onClick={handleLogin} disabled={loading}>
                  {loading ? "Signing in…" : "Sign in →"}
                </button>

                <div className="yj-divider">or</div>

                <Link to="/register" style={{ textDecoration: "none" }}>
                  <button className="yj-btn-ghost">
                    Create a new account
                  </button>
                </Link>
              </>

            ) : (

            /* ── FORGOT / RESET FORM ── */
            <>
              <div className="yj-card-title">
                {resetStage === 1 ? "Forgot password" : "Set new password"}
              </div>
              <div className="yj-card-sub">
                {resetStage === 1
                  ? "Enter your email and we'll send a reset link"
                  : "Choose a strong password for your account"}
              </div>

              {resetStage === 1 && (
                <>
                  <div className="yj-field">
                    <label className="yj-label">Registered Email</label>
                    <input
                      className="yj-input"
                      type="email"
                      placeholder="you@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                    />
                  </div>
                  <button className="yj-btn" onClick={handleForgotPassword} disabled={loading}>
                    {loading ? "Sending…" : "Send reset request →"}
                  </button>
                </>
              )}

              {resetStage === 2 && (
                <>
                  <div className="yj-field">
                    <label className="yj-label">New Password</label>
                    <input
                      className="yj-input"
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    {newPassword && <StrengthBar password={newPassword} />}
                  </div>

                  <div className="yj-field">
                    <label className="yj-label">Confirm Password</label>
                    <input
                      className="yj-input"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onPaste={(e) => e.preventDefault()}
                      onCopy={(e) => e.preventDefault()}
                      onCut={(e) => e.preventDefault()}
                    />
                  </div>

                  <button className="yj-btn" onClick={handleResetPassword} disabled={loading}>
                    {loading ? "Updating…" : "Update password →"}
                  </button>
                </>
              )}

              <button
                className="yj-btn-ghost"
                onClick={() => { setShowForgot(false); setResetStage(1); }}
              >
                ← Back to sign in
              </button>
            </>

          )}

          </div>
        </div>
      </div>
    </ThematicBackground>
  );
}

export default Login;