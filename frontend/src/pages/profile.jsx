import { useState, useEffect } from "react";
import "./profile.css";
import { useNavigate } from "react-router-dom";

/* PASSWORD REGEX */
const passwordRegex =
/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;

/* PASSWORD STRENGTH FUNCTION */
const getPasswordStrength = (password) => {

  if (!password) return "";

  if (/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/.test(password))
    return "Strong";

  if (/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password))
    return "Medium";

  return "Weak";
};

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

  const [oldPassword,setOldPassword] = useState("");
  const [newPassword,setNewPassword] = useState("");
  const [confirmPassword,setConfirmPassword] = useState("");
  const [passwordStrength,setPasswordStrength] = useState("");

  /* FETCH PROFILE */
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
          mobile: user.mobile,
          city: user.place,
          dob: user.dob,
          gender: user.gender
        })

      });

      if (res.ok) {
        alert("Profile updated successfully");
      }

    } catch (error) {

      console.log("Error updating profile");

    }

    setEditing(false);

  };

  /* UPDATE PASSWORD */
  const handlePasswordUpdate = async () => {

    if(!oldPassword || !newPassword || !confirmPassword){
      alert("All password fields required");
      return;
    }

    /* password ≠ username */
    if(newPassword.toLowerCase() === user.name.toLowerCase()){
      alert("Password cannot be same as name");
      return;
    }

    /* regex validation */
    if(!passwordRegex.test(newPassword)){
      alert("Password must contain 8 characters with letters, numbers and special symbols");
      return;
    }

    if(newPassword !== confirmPassword){
      alert("Passwords do not match");
      return;
    }

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
        setPasswordStrength("");

      } else {

        alert(data.message);

      }

    } catch (error) {

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
    <div className="profile-container">

      <h2>User Profile</h2>

      <div className="status">🟢 Account Verified</div>

      {/* PERSONAL INFO */}
      <div className="card">
        <h3>Personal Information</h3>

        <input name="name" value={user.name} onChange={handleChange} disabled={!editing} placeholder="Name"/>
        <input name="email" value={user.email} onChange={handleChange} disabled={!editing} placeholder="Email"/>
        <input name="mobile" value={user.mobile} onChange={handleChange} disabled={!editing} placeholder="Mobile"/>
        <input name="place" value={user.place} onChange={handleChange} disabled={!editing} placeholder="City"/>
        <input name="dob" value={user.dob} onChange={handleChange} disabled={!editing} placeholder="Date of Birth"/>
        <input name="gender" value={user.gender} onChange={handleChange} disabled={!editing} placeholder="Gender"/>

        <button onClick={editing ? handleSave : () => setEditing(true)}>
          {editing ? "Save" : "Edit"}
        </button>
      </div>

      {/* PASSWORD CHANGE */}
      <div className="card">

        <h3>Change Password</h3>

        <input
        type="password"
        placeholder="Old Password"
        value={oldPassword}
        onChange={(e)=>setOldPassword(e.target.value)}
        />

        <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e)=>{

          const val = e.target.value;

          setNewPassword(val);

          setPasswordStrength(getPasswordStrength(val));

        }}
        />

        {newPassword && (
          <p style={{
            color:
            passwordStrength==="Weak"?"red":
            passwordStrength==="Medium"?"orange":
            passwordStrength==="Strong"?"green":""
          }}>
            Password Strength: {passwordStrength}
          </p>
        )}

        <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e)=>setConfirmPassword(e.target.value)}
        onPaste={(e)=>e.preventDefault()}
        onCopy={(e)=>e.preventDefault()}
        onCut={(e)=>e.preventDefault()}
        />

        <button onClick={handlePasswordUpdate}>
          Update Password
        </button>

      </div>

      {/* LOGOUT */}
      <button className="logout" onClick={handleLogout}>
        Logout
      </button>

    </div>
  );
}

export default Profile;