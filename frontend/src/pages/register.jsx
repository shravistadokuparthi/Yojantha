import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

/* Password regex */
const passwordRegex =
/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;

/* Password strength function */
const getPasswordStrength = (password) => {

  if (!password) return "";

  /* Strong password */
  if (/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/.test(password)) {
    return "Strong";
  }

  /* Medium password */
  if (/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password)) {
    return "Medium";
  }

  /* Weak password */
  if (password.length > 0) {
    return "Weak";
  }

  return "";
};

function Register() {

  const navigate = useNavigate();

  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [confirmPassword,setConfirmPassword] = useState("");
  const [passwordStrength,setPasswordStrength] = useState("");
  const [error,setError] = useState("");

  const handleRegister = async () => {

    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (!email.includes("@")) {
      setError("Enter valid email");
      return;
    }

    /* Password cannot match name */
    if(password.toLowerCase() === name.toLowerCase()){
      setError("Password cannot be same as name");
      return;
    }

    /* Regex validation */
    if(!passwordRegex.test(password)){
      setError(
"Password must contain at least 8 characters with letters, numbers and special symbols"
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {

      const response = await fetch("http://localhost:5000/api/auth/register", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword
        })

      });

      const data = await response.json();

      if (response.ok) {

        alert("Registration successful 🎉");

        navigate("/");

      } else {

        setError(data.message);

      }

    } catch (err) {

      setError("Server error. Try again later.");

    }

  };

  return (

    <div className="container">

      <div className="card">

        <h2>Register</h2>

        <input
          className="input"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e)=>setName(e.target.value)}
        />

        <input
          className="input"
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>{

            const val = e.target.value;

            setPassword(val);

            setPasswordStrength(getPasswordStrength(val));

          }}
        />

        {/* Password strength indicator */}
        {password && (

        <p style={{
          color:
          passwordStrength==="Weak"?"red":
          passwordStrength==="Medium"?"orange":
          passwordStrength==="Strong"?"green":"black"
        }}>
          Password Strength: {passwordStrength}
        </p>

        )}

        <input
          className="input"
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e)=>setConfirmPassword(e.target.value)}

          /* Disable copy paste */
          onPaste={(e)=>e.preventDefault()}
          onCopy={(e)=>e.preventDefault()}
          onCut={(e)=>e.preventDefault()}
        />

        {error && <p style={{color:"red"}}>{error}</p>}

        <button className="button" onClick={handleRegister}>
          Register
        </button>

        <Link className="link" to="/">
          Already have an account? Login
        </Link>

      </div>

    </div>

  );
}

export default Register;