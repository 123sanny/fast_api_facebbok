import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";

function Home() {

  const navigate = useNavigate();

  useEffect(() => {

    const token = localStorage.getItem(
      "access_token"
    );

    if (!token) {
      navigate("/login", {
        replace: true
      });
    }

  }, [navigate]);

  return (
    <div>
      <Header />
    </div>
  );
}

export default Home;