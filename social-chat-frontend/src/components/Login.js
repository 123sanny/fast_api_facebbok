
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import "./Login.css";

function Login() {
const navigate = useNavigate();   // 👈 ye line add karo
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:8000/login", {
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
    localStorage.setItem("token", data.access_token);

    alert(data.error);
        navigate("/home");

  };

  return (
    <div className="login-page">

      <div className="login-left">

        <h1>Nexoria</h1>
        <h2>Explore the things you love.</h2>

      </div>

      <div className="login-right">

        <form className="login-box" onSubmit={handleLogin}>

          <h3>Log in</h3>

          <input
            type="text"
            placeholder="Email address or mobile number"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="login-btn">
            Log in
          </button>

          <p className="forgot">Forgotten password?</p>


             <button
                type="button"
                onClick={() => navigate("/")}
                className="login-btn"
            >
            Create new account
            </button>
       

        </form>

      </div>

    </div>
  );
}

export default Login;