
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { useNavigate } from "react-router-dom";

import React, { useState } from "react";
import Login from "./Login";

import "./Signup.css";

function Signup() {
  const navigate = useNavigate();   // 👈 ye line add karo
  const currentYear = new Date().getFullYear();

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const months = [
    "01","02","03","04","05","06",
    "07","08","09","10","11","12"
  ];

  const years = [];
  for (let y = currentYear; y >= 1976; y--) {
    years.push(y);
  }

  const [username, setUsername] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");

  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    const date_of_birth = `${year}-${month}-${day}`;

    try {
      const response = await fetch("http://localhost:8000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          surname,
          email,
          password,
          phone,
          gender,
          date_of_birth
        })
      });

      const data = await response.json();
      alert(data.message);

      // ✅ FORM RESET
      setUsername("");
      setSurname("");
      setEmail("");
      setPassword("");
      setPhone("");
      setGender("");
      setDay("");
      setMonth("");
      setYear("");

    } catch (error) {
      alert("Signup failed");
      console.error(error);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-box">

        <h2>Get started on Nexoria</h2>
        <p>Connect with friends and communities that share your interests.</p>

        <form onSubmit={handleSignup}>

          <label>Name</label>
          <div className="name-row">

            <input
              type="text"
              placeholder="First name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Surname"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              required
            />

          </div>

          <label>Date of birth</label>

          <select value={day} onChange={(e) => setDay(e.target.value)} required>
            <option value="">Day</option>
            {days.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select value={month} onChange={(e) => setMonth(e.target.value)} required>
            <option value="">Month</option>
            {months.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select value={year} onChange={(e) => setYear(e.target.value)} required>
            <option value="">Year</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <label>Mobile</label>
          <input
            type="number"
            placeholder="Mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <label>Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)} required>
            <option value="">Select your gender</option>
            <option>Male</option>
            <option>Female</option>
          </select>

          <label>Email address</label>
          <input
            type="email"
            placeholder="Mobile number or email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

<div className="signup-actions">
  <button type="submit">Create account</button>

  <p>Already have an account?</p>

  <button
    type="button"
    onClick={() => navigate("/login")}
    className="login-btn"
  >
    Login
  </button>
</div>

        </form>

      </div>
    </div>
  );
}

export default Signup;