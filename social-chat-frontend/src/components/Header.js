import { useNavigate } from "react-router-dom";
import React , { useState }  from "react";
import { NavLink } from "react-router-dom";
import Sidebar from "./Sidebar"; // 👈 import

import "./Header.css";
import Stories from "./Stories";
import Post from "./Post";

function Header() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false); // 👈 state


    return (
        <div className="header">
           <Sidebar open={open} setOpen={setOpen} />
            {/* Top bar */}
            <div className="topbar">

                <div className="left">
                     <span className="menu" onClick={() => setOpen(true)}>☰</span>
                    <h2 className="logo" onClick={() => navigate("/")}>Nexoria</h2>
                </div>

                <div className="right">
                    <span className="icon">＋</span>
                    <span className="icon">🔍</span>
                    <span className="icon">💬</span>

                </div>

            </div>

            {/* Menu icons */}
            <div className="menu-icons">

               <NavLink to="/home">
                         <i className="bi bi-house"></i>
                       </NavLink>
               
                       <NavLink to="/reels">
                         <i className="bi bi-play-btn"></i>
                       </NavLink>
               
                       <NavLink to="/friends">
                         <i className="bi bi-people"></i>
                       </NavLink>
               
                       <NavLink to="/market">
                         <i className="bi bi-shop"></i>
                       </NavLink>
               
                       <NavLink to="/notifications">
                         <i className="bi bi-bell"></i>
                       </NavLink>
               
                       <NavLink to="/profile">
                         <img
                           className="header-profile"
                           src="https://i.pravatar.cc/40"
                           alt="profile"
                         />
                       </NavLink>

            </div>

            {/* Post input */}
            <div className="post-box">

                <img
                    className="header-profile"
                    src="https://i.pravatar.cc/40"
                    alt=""
                    onClick={() => navigate("/profile")}
                />

                <input
                    type="text"
                    placeholder="What's on your mind?"
                />

                <span className="photo">🖼</span>

            </div>

            <Stories />
            <Post />

        </div>
    );
}

export default Header;