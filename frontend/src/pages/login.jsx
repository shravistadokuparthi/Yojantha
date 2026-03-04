import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [showForgot, setShowForgot] = useState(false);

  const [resetEmail, setResetEmail] = useState("");
  const [resetStage, setResetStage] = useState(1);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");



  const handleLogin = async () => {

    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    try {

      const response = await fetch("http://localhost:5000/api/auth/login", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          email,
          password
        })

      });

      const data = await response.json();

      if (response.ok) {

        localStorage.setItem("token", data.token);

        alert("Login successful");

        navigate("/dashboard");

      } else {

        setError(data.message);

      }

    } catch (error) {

      setError("Server error");

    }

  };



  const handleForgotPassword = async () => {

    try {

      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({ email: resetEmail })

      });

      const data = await res.json();

      alert(data.message);

      if (res.ok) {
        setResetStage(2);
      }

    } catch (error) {

      console.log(error);

    }

  };



  const handleResetPassword = async () => {

    try {

      const res = await fetch("http://localhost:5000/api/auth/reset-password", {

        method: "PUT",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          email: resetEmail,
          newPassword,
          confirmPassword
        })

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

    } catch (error) {

      console.log(error);

    }

  };



  return (

    <div className="container">

      <div className="card">


        {!showForgot ? (

          <>
            <h2>Login</h2>

            <input
              className="input"
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p style={{ color: "red" }}>{error}</p>}

            <button className="button" onClick={handleLogin}>
              Login
            </button>

            <p
              style={{ cursor: "pointer", color: "blue" }}
              onClick={() => setShowForgot(true)}
            >
              Forgot Password?
            </p>

            <Link className="link" to="/register">
              Don't have an account? Register
            </Link>

          </>

        ) : (

          <>
            <h2>Reset Password</h2>


            {resetStage === 1 && (

              <>
                <input
                  className="input"
                  type="email"
                  placeholder="Enter your registered email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />

                <button className="button" onClick={handleForgotPassword}>
                  Send Reset Request
                </button>
              </>

            )}


            {resetStage === 2 && (

              <>
                <input
                  className="input"
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />

                <input
                  className="input"
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <button className="button" onClick={handleResetPassword}>
                  Update Password
                </button>
              </>

            )}


            <p
              style={{ cursor: "pointer", color: "blue" }}
              onClick={() => {
                setShowForgot(false);
                setResetStage(1);
              }}
            >
              Back to Login
            </p>

          </>

        )}

      </div>

    </div>

  );

}

export default Login;