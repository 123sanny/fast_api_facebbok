import React from "react";
import MenuIcons from "./MenuIcons";
import "./Marketplace.css";

function Marketplace() {
  const products = [
    { 
      id: 1, 
      price: "₹11,500", 
      name: "Apple iphon...", 
      location: "Delhi", 
      img: "https://images.unsplash.com/photo-1510557880182-3d4d3cba3f95?w=400" // iPhone
    },
    { 
      id: 2, 
      price: "₹21,000", 
      name: "Canon eos 6...", 
      location: "Delhi", 
      img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400" // Camera
    },
    { 
      id: 3, 
      price: "₹4,200", 
      name: "Speaker sony...", 
      location: "Delhi", 
      img: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400" // Speakers
    },
    { 
      id: 4, 
      price: "₹150", 
      oldPrice: "₹250", 
      name: "Vintage T...", 
      location: "Delhi", 
      img: "https://images.unsplash.com/photo-1621607512214-68297480165e?w=400" // Trimmer
    },
    { 
      id: 5, 
      price: "₹8,500", 
      name: "Washing Machine", 
      location: "Delhi", 
      img: "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=400" // Washing Machine
    },
    { 
      id: 6, 
      price: "₹45,000", 
      name: "Hero Splendor", 
      location: "Delhi", 
      img: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400" // Bike
    },
  ];

  return (
    <div className="marketplace-container">
      {/* Navbar fixed part */}
      <div className="menu-icons">
        <MenuIcons />
      </div>

      {/* Header Section */}
      <div className="market-header">
        <div className="market-top-row">
          <div className="left-head">
            <i className="bi bi-list"></i>
            <h1>Marketplace</h1>
          </div>
          <div className="right-head">
            <i className="bi bi-person-fill"></i>
            <i className="bi bi-search"></i>
          </div>
        </div>

        <div className="market-actions">
          <button className="market-btn"><i className="bi bi-pencil-square"></i> Sell</button>
          <button className="market-btn"><i className="bi bi-list-ul"></i> Categories</button>
        </div>
      </div>

      <hr className="market-divider" />

      {/* Today's Picks Section */}
      <div className="picks-header">
        <h3>Today's picks</h3>
        <div className="location">
          <i className="bi bi-geo-alt-fill"></i> <span>Delhi</span>
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {products.map((item) => (
          <div className="product-card" key={item.id}>
            <div className="img-wrapper">
              <img src={item.img} alt={item.name} />
            </div>
            <div className="product-details">
              <p className="price">
                {item.price} 
                {item.oldPrice && <span className="old-price">{item.oldPrice}</span>}
                <span className="dot"> · </span> 
                <span className="p-name">{item.name}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Marketplace;