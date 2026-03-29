import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./profile.css";

/* PASSWORD REGEX */
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;

const getPasswordStrength = (password) => {
  if (!password) return "";
  if (passwordRegex.test(password)) return "Strong";
  if (/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password)) return "Medium";
  return "Weak";
};

const getStrengthColors = (strength) => {
  if (strength === "Weak")   return { color: "#ff6b8a", filled: 1 };
  if (strength === "Medium") return { color: "#fbbf24", filled: 2 };
  if (strength === "Strong") return { color: "#34d399", filled: 3 };
  return { color: "rgba(255,255,255,0.08)", filled: 0 };
};

function Profile() {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState({
    name: "", email: "", mobile: "", place: "", dob: "", gender: ""
  });

  const [oldPassword, setOldPassword]       = useState("");
  const [newPassword, setNewPassword]       = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const currentStrength = getPasswordStrength(newPassword);
  const { color: strengthColor, filled } = getStrengthColors(currentStrength);

  /* FETCH PROFILE */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/user/profile", {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") }
        });
        const data = await res.json();
        setUser({
          name:   data.name   || "",
          email:  data.email  || "",
          mobile: data.mobile || "",
          place:  data.city   || "",
          dob:    data.dob    || "",
          gender: data.gender || ""
        });
      } catch {
        console.log("Error fetching profile");
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });

  /* SAVE PROFILE */
  const handleSave = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({
          mobile: user.mobile, city: user.place,
          dob: user.dob, gender: user.gender
        })
      });
      if (res.ok) alert("Profile updated successfully ✨");
    } catch {
      console.log("Error updating profile");
    }
    setEditing(false);
  };

  /* UPDATE PASSWORD */
  const handlePasswordUpdate = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("All password fields required"); return;
    }
    if (newPassword.toLowerCase() === user.name.toLowerCase()) {
      alert("Password cannot be same as name"); return;
    }
    if (!passwordRegex.test(newPassword)) {
      alert("Password must contain 8 characters with letters, numbers and special symbols"); return;
    }
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match"); return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/user/update-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({ oldPassword, newPassword, confirmPassword })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Password updated successfully 🔒");
        setOldPassword(""); setNewPassword(""); setConfirmPassword("");
      } else {
        alert(data.message);
      }
    } catch {
      console.log("Error updating password");
    }
  };

  /* LOGOUT */
  const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="yj-profile-content">

      {/* Header */}
      <div className="yj-profile-header">
        <div>
          <h2 className="yj-title">My Profile</h2>
          <div className="yj-status-badge">🟢 Account Verified</div>
        </div>
        <button className="yj-btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* PERSONAL INFO CARD */}
      <div className="yj-card">
        <div className="yj-card-top">
          <h3 className="yj-card-title">Personal Information</h3>
          <button
            className="yj-btn-ghost yj-btn-small"
            onClick={editing ? handleSave : () => setEditing(true)}
          >
            {editing ? "Save Changes" : "Edit Profile"}
          </button>
        </div>

        <div className="yj-grid">
          <div className="yj-field">
            <label className="yj-label">Full Name</label>
            <input className="yj-input" name="name" value={user.name} onChange={handleChange} disabled={!editing} />
          </div>
          <div className="yj-field">
            <label className="yj-label">Email Address</label>
            <input className="yj-input" name="email" value={user.email} onChange={handleChange} disabled={!editing} />
          </div>
          <div className="yj-field">
            <label className="yj-label">Mobile Number</label>
            <input className="yj-input" name="mobile" value={user.mobile} onChange={handleChange} disabled={!editing} />
          </div>
          <div className="yj-field">
            <label className="yj-label">City</label>
            <input className="yj-input" name="place" value={user.place} onChange={handleChange} disabled={!editing} />
          </div>
          <div className="yj-field">
            <label className="yj-label">Date of Birth</label>
            <input className="yj-input" name="dob" type="date" value={user.dob} onChange={handleChange} disabled={!editing} />
          </div>
          <div className="yj-field">
            <label className="yj-label">Gender</label>
            <input className="yj-input" name="gender" value={user.gender} onChange={handleChange} disabled={!editing} />
          </div>
        </div>
      </div>

      {/* PASSWORD CHANGE CARD */}
      <div className="yj-card">
        <h3 className="yj-card-title">Security & Password</h3>
        <p className="yj-card-sub">Update your password to keep your account secure.</p>

        <div className="yj-grid">
          <div className="yj-field">
            <label className="yj-label">Old Password</label>
            <input
              className="yj-input" type="password" placeholder="••••••••"
              value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>

          <div className="yj-field">
            <label className="yj-label">New Password</label>
            <input
              className="yj-input" type="password" placeholder="••••••••"
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            />
            {newPassword && (
              <div className="yj-strength-wrap">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="yj-strength-bar"
                    style={{ background: i < filled ? strengthColor : undefined }}
                  />
                ))}
                <span className="yj-strength-label" style={{ color: strengthColor }}>
                  {currentStrength}
                </span>
              </div>
            )}
          </div>

          <div className="yj-field">
            <label className="yj-label">Confirm Password</label>
            <input
              className="yj-input" type="password" placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onPaste={(e) => e.preventDefault()}
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
            />
          </div>
        </div>

        <button
          className="yj-btn"
          style={{ width: "auto", padding: "12px 30px", marginTop: "10px" }}
          onClick={handlePasswordUpdate}
        >
          Update Password
        </button>
      </div>

    </div>
  );
}

export default Profile;