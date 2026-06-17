import React from "react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";

import "./css/MenuIcons.css";

function MenuIcons() {

  const navigate = useNavigate();

  return (
     <div className="menu-bar">

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

    </div>
  );
}

export default MenuIcons;