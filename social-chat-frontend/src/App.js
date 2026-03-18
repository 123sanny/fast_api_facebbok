import { Routes, Route } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Home from "./components/Home";
import Profile from "./components/Profile";
import Header from "./components/Header";
import Friends from "./components/Friends";
import Market from "./components/Market";
import Reels from "./components/Reels";
import Notifications from "./components/Notifications";
import "bootstrap-icons/font/bootstrap-icons.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} />

      <Route path="/profile" element={<Profile />} />
      <Route path="/" element={<h1>Home</h1>} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/market" element={<Market />} />
        <Route path="/reels" element={<Reels />} />
        <Route path="/notifications" element={<Notifications />} />

    </Routes>
  );
}

export default App;

