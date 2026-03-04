import { useState, useEffect } from "react";
import "./profile.css";
import { useNavigate } from "react-router-dom";

function Profile() {

  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);

  const [user, setUser] = useState({
    name: "",
    email: "",
    mobile: "",
    place: "",
    dob: "",
    gender: ""
  });

  // Fetch profile when page loads
  useEffect(() => {

    const fetchProfile = async () => {

      try {

        const res = await fetch("http://localhost:5000/api/user/profile", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
          }
        });

        const data = await res.json();

        setUser({
          name: data.name || "",
          email: data.email || "",
          mobile: data.mobile || "",
          place: data.city || "",
          dob: data.dob || "",
          gender: data.gender || ""
        });

      } catch (error) {

        console.log("Error fetching profile");

      }

    };

    fetchProfile();

  }, []);

  const handleChange = (e) => {

    setUser({
      ...user,
      [e.target.name]: e.target.value
    });

  };

  // Save profile
  const handleSave = async () => {

    try {

      const res = await fetch("http://localhost:5000/api/user/profile", {

        method: "PUT",

        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token")
        },

        body: JSON.stringify({
          mobile: user.mobile,
          city: user.place,
          dob: user.dob,
          gender: user.gender
        })

      });

      const data = await res.json();

      if (res.ok) {
        alert("Profile updated successfully");
      }

    } catch (error) {

      console.log("Error updating profile");

    }

    setEditing(false);

  };

  //handle password change
const [oldPassword, setOldPassword] = useState("");
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordUpdate = async () => {

  try {

    const res = await fetch("http://localhost:5000/api/user/update-password", {

      method: "PUT",

      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token")
      },

      body: JSON.stringify({
        oldPassword,
        newPassword,
        confirmPassword
      })

    });

    const data = await res.json();

    if (res.ok) {

      alert("Password updated successfully");

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } else {

      alert(data.message);

    }

  } catch (error) {

    console.log("Error updating password");

  }

};

//handle logout
const handleLogout = () => {

  localStorage.removeItem("token");

  alert("Logged out successfully");

  navigate("/");

};

  return (
    <div className="profile-container">

      <h2>User Profile</h2>

      {/* Status */}
      <div className="status">🟢 Account Verified</div>

      {/* Personal Info */}
      <div className="card">
        <h3>Personal Information</h3>

        <input name="name" value={user.name} onChange={handleChange} disabled={!editing} placeholder="name"/>
        <input name="email" value={user.email} onChange={handleChange} disabled={!editing} placeholder="email"/>
        <input name="mobile" value={user.mobile} onChange={handleChange} disabled={!editing} placeholder="mobile"/>
        <input name="place" value={user.place} onChange={handleChange} disabled={!editing} placeholder="place"/>
        <input name="dob" value={user.dob} onChange={handleChange} disabled={!editing} placeholder="date of birth"/>
        <input name="gender" value={user.gender} onChange={handleChange} disabled={!editing} placeholder="gender"/>

        <button onClick={editing ? handleSave : () => setEditing(true)}>
          {editing ? "Save" : "Edit"}
        </button>
      </div>

      {/* Scheme Stats */}
      <div className="stats">
        <div className="stat-card">
          <h4>Eligible</h4>
          <p>8</p>
        </div>
      </div>

      {/* Progress */}
      <div className="card">
        <h3>Application Progress</h3>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: "70%" }}>
            70%
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="card">
        <h3>Change Password</h3>
      <input
type="password"
placeholder="Old Password"
value={oldPassword}
onChange={(e) => setOldPassword(e.target.value)}
/>

<input
type="password"
placeholder="New Password"
value={newPassword}
onChange={(e) => setNewPassword(e.target.value)}
/>

<input
type="password"
placeholder="Confirm Password"
value={confirmPassword}
onChange={(e) => setConfirmPassword(e.target.value)}
/>
        <button onClick={handlePasswordUpdate}>Update Password</button>
      </div>
      {/* Logout */}
     <button className="logout" onClick={handleLogout}>Logout</button>

    </div>
  );
}

export default Profile;