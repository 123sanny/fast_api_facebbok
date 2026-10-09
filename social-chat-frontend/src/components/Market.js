import React, { useState, useEffect, useCallback } from "react";
import { 
  BsSearch, BsGeoAltFill, BsPlusLg, BsX, 
  BsBookmark, BsBookmarkFill, 
  BsSendFill, BsImages, BsCompassFill,
  BsArrowDownUp, BsShieldCheck
} from "react-icons/bs";
import Header from "./Header";
import MenuIcons from "./MenuIcons";
import ChatDrawer from "./ChatDrawer";
import { getActiveUserId, getActiveUserName, getUserStorageItem } from "../services/profileApi";
import { 
  fetchMarketplaceItemsApi, 
  createMarketplaceListingApi, 
  toggleSaveMarketplaceItemApi 
} from "../services/marketplaceApi";
import "./css/Marketplace.css";

// Major Indian Cities and Hubs with Lat/Lng for Distance Calculation
const CITIES = [
  { name: "Delhi", state: "NCR", lat: 28.6139, lng: 77.2090, localities: ["Connaught Place", "Lajpat Nagar", "Karol Bagh", "Dwarka", "Saket", "Rohini"] },
  { name: "Noida", state: "NCR", lat: 28.5355, lng: 77.3910, localities: ["Sector 18", "Sector 62", "Sector 137", "Sector 76", "Noida Expressway"] },
  { name: "Gurugram", state: "NCR", lat: 28.4595, lng: 77.0266, localities: ["Cyber City", "Golf Course Road", "Sohna Road", "MG Road", "Sector 56"] },
  { name: "Mumbai", state: "Maharashtra", lat: 19.0760, lng: 72.8777, localities: ["Bandra West", "Andheri East", "Juhu", "Colaba", "Powai", "Thane"] },
  { name: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946, localities: ["Indiranagar", "Koramangala", "HSR Layout", "Whitefield", "MG Road"] },
  { name: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867, localities: ["Hitec City", "Gachibowli", "Jubilee Hills", "Banjara Hills", "Madhapur"] },
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567, localities: ["Koregaon Park", "Viman Nagar", "Kothrud", "Baner", "Hinjewadi"] },
  { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873, localities: ["Malviya Nagar", "Vaishali Nagar", "C-Scheme", "Mansarovar", "Raja Park"] },
  { name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462, localities: ["Hazratganj", "Gomti Nagar", "Aliganj", "Indira Nagar", "Mahanagar"] },
  { name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639, localities: ["Park Street", "Salt Lake", "New Town", "Ballygunge", "Howrah"] },
  { name: "Chandigarh", state: "Punjab/Haryana", lat: 30.7333, lng: 76.7794, localities: ["Sector 17", "Sector 35", "Sector 22", "Panchkula", "Mohali Phase 7"] },
  { name: "Patna", state: "Bihar", lat: 25.5941, lng: 85.1376, localities: ["Boring Road", "Kankarbagh", "Bailey Road", "Patliputra Colony"] }
];

// Distance Calculation (Haversine Formula in KM)
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 5;
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return parseFloat((R * c).toFixed(1));
}

const INITIAL_FALLBACK_PRODUCTS = [
  { 
    id: 1, 
    price: "₹11,500", 
    rawPrice: 11500,
    name: "Apple iPhone 12 (128GB) Blue", 
    city: "Delhi",
    locality: "Connaught Place",
    lat: 28.6280,
    lng: 77.2180,
    category: "Electronics",
    condition: "Used - Like New",
    seller: "Rahul Sharma",
    sellerImg: "https://i.pravatar.cc/100?img=1",
    verified: true,
    desc: "100% battery health, original box and cable included. Zero scratches.",
    img: "https://images.unsplash.com/photo-1510557880182-3d4d3cba3f95?w=600"
  },
  { 
    id: 2, 
    price: "₹21,000", 
    rawPrice: 21000,
    name: "Canon EOS 600D with 18-55mm Lens", 
    city: "Noida",
    locality: "Sector 18",
    lat: 28.5700,
    lng: 77.3200,
    category: "Electronics",
    condition: "Good",
    seller: "Satish Gupta",
    sellerImg: "https://i.pravatar.cc/100?img=6",
    verified: true,
    desc: "Great condition DSLR, perfect for beginners and content creators.",
    img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600"
  },
  { 
    id: 3, 
    price: "₹4,200", 
    rawPrice: 4200,
    name: "Sony Extra Bass Bluetooth Speaker", 
    city: "Delhi",
    locality: "Saket",
    lat: 28.5244,
    lng: 77.2167,
    category: "Electronics",
    condition: "Brand New",
    seller: "Priya Singh",
    sellerImg: "https://i.pravatar.cc/100?img=25",
    verified: true,
    desc: "Unopened sealed box. 16 hours battery backup, waterproof.",
    img: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600"
  },
  { 
    id: 4, 
    price: "₹45,000", 
    rawPrice: 45000,
    name: "Hero Splendor Plus 2021 Model", 
    city: "Gurugram",
    locality: "Cyber City",
    lat: 28.4900,
    lng: 77.0900,
    category: "Vehicles",
    condition: "Good",
    seller: "Amit Kumar",
    sellerImg: "https://i.pravatar.cc/100?img=33",
    verified: true,
    desc: "First owner, all service records available, insurance valid.",
    img: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600"
  },
  { 
    id: 5, 
    price: "₹8,500", 
    rawPrice: 8500,
    name: "LG 7kg Fully Automatic Washing Machine", 
    city: "Delhi",
    locality: "Lajpat Nagar",
    lat: 28.5700,
    lng: 77.2400,
    category: "Home Goods",
    condition: "Used - Good",
    seller: "Naina Kumari",
    sellerImg: "https://i.pravatar.cc/100?img=20",
    verified: false,
    desc: "Selling due to relocation. Works perfectly with smart inverter motor.",
    img: "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=600"
  },
  { 
    id: 6, 
    price: "₹1,250", 
    oldPrice: "₹2,500",
    rawPrice: 1250,
    name: "Vintage Casual Bomber Jacket (Size L)", 
    city: "Delhi",
    locality: "Karol Bagh",
    lat: 28.6500,
    lng: 77.1900,
    category: "Apparel",
    condition: "Brand New",
    seller: "Md Aslam",
    sellerImg: "https://i.pravatar.cc/100?img=11",
    verified: false,
    desc: "Imported premium quality bomber jacket. Navy blue color.",
    img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600"
  },
  { 
    id: 7, 
    price: "₹34,000", 
    rawPrice: 34000,
    name: "Sony PlayStation 5 Disc Edition + 2 Controllers", 
    city: "Noida",
    locality: "Sector 62",
    lat: 28.6200,
    lng: 77.3600,
    category: "Entertainment",
    condition: "Used - Like New",
    seller: "Vikas Mehra",
    sellerImg: "https://i.pravatar.cc/100?img=15",
    verified: true,
    desc: "Complete box with Spider-Man 2 and God of War games included.",
    img: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600"
  },
  { 
    id: 8, 
    price: "₹18,500", 
    rawPrice: 18500,
    name: "Solid Sheesham Wood 6-Seater Dining Table", 
    city: "Gurugram",
    locality: "Golf Course Road",
    lat: 28.4500,
    lng: 77.1000,
    category: "Home Goods",
    condition: "Used - Good",
    seller: "Ananya Roy",
    sellerImg: "https://i.pravatar.cc/100?img=28",
    verified: true,
    desc: "Heavy teak finish Sheesham dining table with 6 cushioned chairs.",
    img: "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=600"
  },
  { 
    id: 9, 
    price: "₹68,000", 
    rawPrice: 68000,
    name: "Royal Enfield Classic 350 (Gunmetal Grey)", 
    city: "Mumbai",
    locality: "Bandra West",
    lat: 19.0596,
    lng: 72.8295,
    category: "Vehicles",
    condition: "Good",
    seller: "Karan Johar Fan",
    sellerImg: "https://i.pravatar.cc/100?img=32",
    verified: false,
    desc: "Single owner, dual-channel ABS, custom exhaust, mint condition.",
    img: "https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?w=600"
  },
  { 
    id: 10, 
    price: "₹52,000", 
    rawPrice: 52000,
    name: "Apple MacBook Air M2 (8GB / 256GB Midnight)", 
    city: "Bengaluru",
    locality: "Indiranagar",
    lat: 12.9784,
    lng: 77.6408,
    category: "Electronics",
    condition: "Used - Like New",
    seller: "Arjun Dev",
    sellerImg: "https://i.pravatar.cc/100?img=53",
    verified: true,
    desc: "Battery cycle count 42, with invoice, MagSafe charger and sleeve.",
    img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600"
  }
];

const CATEGORIES = ["All", "Vehicles", "Electronics", "Home Goods", "Apparel", "Property", "Entertainment"];

function Marketplace() {
  const [products, setProducts] = useState(INITIAL_FALLBACK_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChat, setActiveChat] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Location and Radius Filtering States
  const [userLocation, setUserLocation] = useState(() => {
    try {
      const saved = localStorage.getItem("nexoria_market_location");
      return saved ? JSON.parse(saved) : CITIES[0]; // Default: Delhi
    } catch {
      return CITIES[0];
    }
  });

  const [radiusKm, setRadiusKm] = useState(() => {
    try {
      const saved = localStorage.getItem("nexoria_market_radius");
      return saved ? parseInt(saved, 10) : 40; // Default: 40 km radius
    } catch {
      return 40;
    }
  });

  const [sortOption, setSortOption] = useState("nearest"); // 'nearest' | 'recommended' | 'low_high' | 'high_low'
  const [distanceQuickFilter, setDistanceQuickFilter] = useState("all"); // 'all' | '5' | '15' | '30' | '50'
  const [onlyVerifiedSellers, setOnlyVerifiedSellers] = useState(false);

  // Location Selector Modal States
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [tempCity, setTempCity] = useState(userLocation.name);
  const [tempRadius, setTempRadius] = useState(radiusKm);
  const [citySearchInput, setCitySearchInput] = useState("");
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  // Selected Product for Lightbox Details Modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sellerMessage, setSellerMessage] = useState("Hi, is this still available?");
  const [savedProducts, setSavedProducts] = useState({});

  // "Sell" Create Listing Modal
  const [showSellModal, setShowSellModal] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Electronics");
  const [newItemCondition, setNewItemCondition] = useState("Brand New");
  const [newItemCity, setNewItemCity] = useState(userLocation.name);
  const [newItemLocality, setNewItemLocality] = useState("Nearby");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemMedia, setNewItemMedia] = useState(null);

  // Load Marketplace Items from FastAPI Backend
  const loadMarketplaceItems = useCallback(async () => {
    try {
      const activeUserId = getActiveUserId();
      const res = await fetchMarketplaceItemsApi({
        userId: activeUserId,
        category: selectedCategory,
        search: searchQuery,
        city: userLocation.name,
        lat: userLocation.lat,
        lng: userLocation.lng,
        radius: distanceQuickFilter === "all" ? radiusKm : parseInt(distanceQuickFilter, 10),
        sort: sortOption,
        verifiedOnly: onlyVerifiedSellers
      });

      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setProducts(res.data);
        // Sync saved status
        const savedMap = {};
        res.data.forEach(item => {
          if (item.is_saved) savedMap[item.id] = true;
        });
        setSavedProducts(prev => ({ ...prev, ...savedMap }));
      }
    } catch (err) {
      console.warn("Could not fetch remote marketplace items, using fallback:", err);
    }
  }, [selectedCategory, searchQuery, userLocation, distanceQuickFilter, radiusKm, sortOption, onlyVerifiedSellers]);

  useEffect(() => {
    loadMarketplaceItems();
  }, [loadMarketplaceItems]);

  // GPS Auto-Detection Function
  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Find closest known city
        let closest = CITIES[0];
        let minD = Infinity;

        CITIES.forEach(c => {
          const d = calculateDistance(latitude, longitude, c.lat, c.lng);
          if (d < minD) {
            minD = d;
            closest = { ...c, lat: latitude, lng: longitude, isGps: true };
          }
        });

        setUserLocation(closest);
        setTempCity(closest.name);
        try {
          localStorage.setItem("nexoria_market_location", JSON.stringify(closest));
        } catch (e) {
          console.error(e);
        }
        setIsDetectingGps(false);
        setShowLocationModal(false);
      },
      (error) => {
        console.warn("GPS lookup denied/failed:", error);
        setIsDetectingGps(false);
        alert("Could not retrieve precise location. Please select your city from the list.");
      },
      { timeout: 8000 }
    );
  };

  // Apply Location Filter Modal
  const handleApplyLocation = () => {
    const matchedCity = CITIES.find(c => c.name.toLowerCase() === tempCity.toLowerCase()) || CITIES[0];
    setUserLocation(matchedCity);
    setRadiusKm(tempRadius);

    try {
      localStorage.setItem("nexoria_market_location", JSON.stringify(matchedCity));
      localStorage.setItem("nexoria_market_radius", tempRadius.toString());
    } catch (e) {
      console.error(e);
    }
    setShowLocationModal(false);
  };

  // Create Listing and persist across all users in MySQL backend
  const handleCreateListing = async (e) => {
    e?.preventDefault();
    if (!newItemTitle || !newItemPrice) return;

    setIsSubmitting(true);
    const matchedCity = CITIES.find(c => c.name === newItemCity) || userLocation;
    const currentUserId = getActiveUserId();

    const payload = {
      title: newItemTitle.trim(),
      price: parseFloat(newItemPrice) || 0,
      category: newItemCategory,
      condition: newItemCondition,
      city: matchedCity.name,
      locality: newItemLocality || "Local Area",
      lat: matchedCity.lat + (Math.random() - 0.5) * 0.04,
      lng: matchedCity.lng + (Math.random() - 0.5) * 0.04,
      description: newItemDesc.trim(),
      img: newItemMedia || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600",
      images: [newItemMedia || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600"]
    };

    try {
      const res = await createMarketplaceListingApi(payload, currentUserId);
      if (res.success && res.data) {
        setProducts(prev => [res.data, ...prev]);
      } else {
        // Fallback optimistic addition
        const newProd = {
          id: Date.now(),
          seller_id: currentUserId,
          name: payload.title,
          title: payload.title,
          price: `₹${payload.price.toLocaleString("en-IN")}`,
          rawPrice: payload.price,
          city: payload.city,
          locality: payload.locality,
          lat: payload.lat,
          lng: payload.lng,
          distanceKm: calculateDistance(userLocation.lat, userLocation.lng, payload.lat, payload.lng),
          locationFormatted: `${payload.locality}, ${payload.city} · 0 km away`,
          category: payload.category,
          condition: payload.condition,
          desc: payload.description,
          description: payload.description,
          seller: getActiveUserName(),
          sellerImg: getUserStorageItem("avatar", `https://i.pravatar.cc/100?u=${currentUserId}`, currentUserId),
          verified: true,
          img: payload.img,
          images: payload.images,
          status: "active",
          created_at: new Date().toISOString()
        };
        setProducts(prev => [newProd, ...prev]);
      }
    } catch (err) {
      console.error("Error creating listing:", err);
    } finally {
      setIsSubmitting(false);
      setShowSellModal(false);
      setNewItemTitle("");
      setNewItemPrice("");
      setNewItemDesc("");
      setNewItemMedia(null);
    }
  };

  const handleMessageSeller = (e) => {
    e?.preventDefault();
    if (!selectedProduct) return;
    setActiveChat({
      id: selectedProduct.seller_id,
      name: selectedProduct.seller,
      img: selectedProduct.sellerImg,
      online: true,
      initialMessage: sellerMessage
    });
    setSelectedProduct(null);
  };

  const toggleSaveProduct = async (id, e) => {
    e?.stopPropagation();
    const newStatus = !savedProducts[id];
    setSavedProducts(prev => ({ ...prev, [id]: newStatus }));
    
    try {
      const activeUserId = getActiveUserId();
      await toggleSaveMarketplaceItemApi(id, activeUserId);
    } catch (err) {
      console.warn("Failed to persist save state on backend:", err);
    }
  };

  // Calculate live distance for all products from active userLocation
  const productsWithDistance = products.map(p => {
    const dist = calculateDistance(userLocation.lat, userLocation.lng, p.lat, p.lng);
    return {
      ...p,
      distanceKm: dist,
      locationFormatted: `${p.locality || p.city} · ${dist} km away`
    };
  });

  // Filter & Sort Products based on Location, Category, Distance Radius, and Search
  const filteredProducts = productsWithDistance
    .filter(p => {
      const matchCat = selectedCategory === "All" || p.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch = (p.name || p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.city || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.locality && p.locality.toLowerCase().includes(searchQuery.toLowerCase()));

      // Distance Radius Filtering
      const effectiveRadius = distanceQuickFilter === "all" ? radiusKm : parseInt(distanceQuickFilter, 10);
      const matchDistance = effectiveRadius === 100 ? true : p.distanceKm <= effectiveRadius;

      // Verified Seller Filter (Aadhaar / Govt ID Verified Local Seller)
      const matchVerified = !onlyVerifiedSellers || p.verified;

      return matchCat && matchSearch && matchDistance && matchVerified;
    })
    .sort((a, b) => {
      if (sortOption === "nearest") return a.distanceKm - b.distanceKm;
      if (sortOption === "low_high") return a.rawPrice - b.rawPrice;
      if (sortOption === "high_low") return b.rawPrice - a.rawPrice;
      return b.id - a.id; // Newest / Recommended
    });

  const searchedCities = CITIES.filter(c => 
    !citySearchInput.trim() || c.name.toLowerCase().includes(citySearchInput.toLowerCase()) || c.state.toLowerCase().includes(citySearchInput.toLowerCase())
  );

  return (
    <div className="market-page-root">
      <Header onOpenChat={setActiveChat} />

      <div className="market-layout-container">
        
        {/* Marketplace Top Controls with Location Pill */}
        <div className="market-top-bar shadow-sm">
          <div className="market-title-left">
            <h2>Marketplace</h2>
            <button 
              className="market-location-badge-btn"
              onClick={() => {
                setTempCity(userLocation.name);
                setTempRadius(radiusKm);
                setShowLocationModal(true);
              }}
              title="Change your shopping location and radius"
            >
              <BsGeoAltFill />
              <span>{userLocation.name} · Within {radiusKm === 100 ? "Any distance" : `${radiusKm} km`}</span>
            </button>
          </div>

          <div className="market-actions-right">
            <div className="market-search-pill">
              <BsSearch className="m-search-icon" />
              <input 
                type="text" 
                placeholder="Search local marketplace..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button className="btn-create-listing" onClick={() => setShowSellModal(true)}>
              <BsPlusLg className="me-1" /> Create listing
            </button>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="market-category-tray">
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              className={`cat-pill-btn ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary Filter Bar: Quick Distance Filter & Sorting */}
        <div className="market-secondary-toolbar shadow-sm">
          <div className="toolbar-left-chips">
            <span className="sort-label-text me-1 d-none d-sm-inline">
              <BsCompassFill className="me-1 text-primary" /> Near You:
            </span>
            {[
              { id: "all", label: `Within ${radiusKm} km` },
              { id: "5", label: "< 5 km" },
              { id: "15", label: "< 15 km" },
              { id: "30", label: "< 30 km" },
              { id: "50", label: "< 50 km" }
            ].map(chip => (
              <button
                key={chip.id}
                className={`distance-filter-chip ${distanceQuickFilter === chip.id ? "active" : ""}`}
                onClick={() => setDistanceQuickFilter(chip.id)}
              >
                {chip.label}
              </button>
            ))}

            <button
              className={`verified-filter-chip ${onlyVerifiedSellers ? "active" : ""}`}
              onClick={() => setOnlyVerifiedSellers(!onlyVerifiedSellers)}
              title="Filter by Aadhaar / Govt ID Verified Local Sellers"
            >
              <BsShieldCheck className="me-1" />
              {onlyVerifiedSellers ? "✓ Verified Sellers Only" : "🛡️ Verified Sellers"}
            </button>
          </div>

          <div className="toolbar-right-sort">
            <span className="sort-label-text">
              <BsArrowDownUp className="me-1" /> Sort by:
            </span>
            <select 
              className="sort-select-dropdown"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="nearest">🎯 Nearest to Me</option>
              <option value="recommended">🔥 Recommended</option>
              <option value="low_high">💰 Price: Low to High</option>
              <option value="high_low">💎 Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Today's Local Picks Section */}
        <div className="market-grid-section">
          <div className="picks-heading-row">
            <h3>Local Picks Near {userLocation.name}</h3>
            <span className="results-count">{filteredProducts.length} items available</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="market-empty-near-state shadow-sm">
              <BsGeoAltFill className="market-empty-icon" />
              <h4>No listings found within this radius</h4>
              <p>
                There are no items matching your criteria within {distanceQuickFilter === "all" ? `${radiusKm} km` : `${distanceQuickFilter} km`} of {userLocation.name}. Try expanding your distance radius or switching to all categories.
              </p>
              <button 
                className="btn-expand-radius"
                onClick={() => {
                  setRadiusKm(80);
                  setDistanceQuickFilter("all");
                }}
              >
                Expand Radius to 80 km 📍
              </button>
            </div>
          ) : (
            <div className="market-products-grid">
              {filteredProducts.map(item => (
                <div 
                  className="market-product-card shadow-sm" 
                  key={item.id}
                  onClick={() => setSelectedProduct(item)}
                >
                  <div className="card-media-wrapper">
                    <img src={item.img} alt={item.name || item.title} />
                    
                    {/* Distance Pill Overlay */}
                    <div className="product-card-distance-pill">
                      <span className={`distance-dot ${item.distanceKm > 15 ? "far" : ""}`}></span>
                      <span>{item.distanceKm} km away</span>
                    </div>

                    <button 
                      className={`btn-save-item ${savedProducts[item.id] ? "saved" : ""}`}
                      onClick={(e) => toggleSaveProduct(item.id, e)}
                      title="Save item"
                    >
                      {savedProducts[item.id] ? <BsBookmarkFill className="text-primary" /> : <BsBookmark />}
                    </button>
                  </div>

                  <div className="card-info-content">
                    <div className="card-price-row">
                      <span className="item-price">{item.price}</span>
                      {item.oldPrice && <span className="item-old-price">{item.oldPrice}</span>}
                    </div>
                    <h5 className="item-title">{item.name || item.title}</h5>
                    <span className="item-location">
                      <BsGeoAltFill size={11} className="text-primary" />
                      {item.locality ? `${item.locality}, ${item.city}` : item.city}
                    </span>
                    {item.verified && (
                      <div className="v-seller-badge">
                        <BsShieldCheck size={12} className="v-seller-icon" />
                        <span>Aadhaar / Govt ID Verified</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ==================================================================== */}
      {/* NEXORIA SMART LOCATION & RADIUS SELECTOR MODAL                       */}
      {/* ==================================================================== */}
      {showLocationModal && (
        <div className="location-modal-overlay" onClick={() => setShowLocationModal(false)}>
          <div className="location-modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="location-modal-header">
              <h4>Change Location & Radius</h4>
              <button className="location-modal-close" onClick={() => setShowLocationModal(false)}>
                <BsX size={26} />
              </button>
            </div>

            <div className="location-modal-body">
              {/* GPS Auto-Detect Button */}
              <button 
                className="btn-use-gps-location"
                onClick={handleDetectCurrentLocation}
                disabled={isDetectingGps}
              >
                <BsCompassFill />
                <span>{isDetectingGps ? "Detecting GPS location..." : "Use My Current GPS Location"}</span>
              </button>

              {/* City Search */}
              <label className="fw-bold small text-muted">Choose City or Hub</label>
              <div className="location-city-search-box">
                <BsSearch className="text-muted" />
                <input 
                  type="text" 
                  placeholder="Search city (Delhi, Mumbai, Bengaluru...)"
                  value={citySearchInput}
                  onChange={(e) => setCitySearchInput(e.target.value)}
                />
              </div>

              {/* Popular Cities Chips */}
              <div className="popular-cities-chips">
                {searchedCities.map(c => (
                  <button 
                    key={c.name}
                    className={`city-chip-btn ${tempCity === c.name ? "active" : ""}`}
                    onClick={() => setTempCity(c.name)}
                  >
                    📍 {c.name} ({c.state})
                  </button>
                ))}
              </div>

              {/* Radius Slider */}
              <div className="radius-slider-section">
                <div className="radius-slider-label">
                  <span>Distance Radius</span>
                  <span className="text-primary">{tempRadius === 100 ? "Any distance" : `${tempRadius} km`}</span>
                </div>
                
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={tempRadius}
                  onChange={(e) => setTempRadius(parseInt(e.target.value, 10))}
                  className="radius-range-slider"
                />

                <div className="radius-quick-presets">
                  {[5, 15, 30, 50, 100].map(r => (
                    <button
                      key={r}
                      className={`radius-preset-pill ${tempRadius === r ? "active" : ""}`}
                      onClick={() => setTempRadius(r)}
                    >
                      {r === 100 ? "All" : `${r}km`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="location-modal-footer">
              <button className="btn-location-cancel" onClick={() => setShowLocationModal(false)}>
                Cancel
              </button>
              <button className="btn-location-apply" onClick={handleApplyLocation}>
                Apply Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* PRODUCT DETAILS LIGHTBOX MODAL                                       */}
      {/* ==================================================================== */}
      {selectedProduct && (
        <div className="product-modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="product-modal-dialog" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedProduct(null)}>
              <BsX size={26} />
            </button>

            <div className="product-modal-grid">
              {/* Left Large Image */}
              <div className="product-modal-media">
                <img src={selectedProduct.img} alt={selectedProduct.name || selectedProduct.title} />
              </div>

              {/* Right Details Panel */}
              <div className="product-modal-sidebar">
                <h3>{selectedProduct.name || selectedProduct.title}</h3>
                <div className="modal-price-tag">{selectedProduct.price}</div>
                
                <div className="modal-meta-line">
                  <BsGeoAltFill className="text-primary" />
                  <strong>{selectedProduct.locality || selectedProduct.city}, {selectedProduct.city}</strong>
                  <span className="badge bg-primary-soft text-primary ms-1">
                    🟢 {selectedProduct.distanceKm} km away from your location
                  </span>
                </div>

                <div className="product-details-pills">
                  <span className="detail-pill">Condition: <strong>{selectedProduct.condition || "Used - Good"}</strong></span>
                  <span className="detail-pill">Category: <strong>{selectedProduct.category}</strong></span>
                  <span className="detail-pill">🚗 <strong>~{(selectedProduct.distanceKm * 2.5).toFixed(0)} mins drive</strong></span>
                </div>

                <div className="modal-description-box">
                  <h6>Description</h6>
                  <p>{selectedProduct.desc || selectedProduct.description || "Contact seller for more specifications."}</p>
                </div>

                {/* Seller Info Card */}
                <div className="seller-profile-card">
                  <img src={selectedProduct.sellerImg} alt="" className="seller-avatar" />
                  <div>
                    <h6>{selectedProduct.seller}</h6>
                    {selectedProduct.verified ? (
                      <span className="text-success fw-bold d-flex align-items-center gap-1" style={{ fontSize: "12px" }}>
                        <BsShieldCheck /> Govt ID / Aadhaar Verified Local Seller
                      </span>
                    ) : (
                      <span>Nexoria Seller · {selectedProduct.city}</span>
                    )}
                  </div>
                </div>

                {/* Send Message to Seller Form */}
                <form className="message-seller-form" onSubmit={handleMessageSeller}>
                  <h6>Send seller a message</h6>
                  <div className="msg-input-wrap">
                    <input 
                      type="text" 
                      value={sellerMessage}
                      onChange={(e) => setSellerMessage(e.target.value)}
                    />
                    <button type="submit" className="btn-send-seller">
                      <BsSendFill className="me-1" /> Send
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* CREATE NEW LISTING MODAL                                             */}
      {/* ==================================================================== */}
      {showSellModal && (
        <div className="product-modal-overlay" onClick={() => setShowSellModal(false)}>
          <div className="create-listing-dialog" onClick={e => e.stopPropagation()}>
            <div className="listing-modal-header">
              <h5>Create New Item Listing</h5>
              <button className="modal-close-btn" onClick={() => setShowSellModal(false)}>
                <BsX size={26} />
              </button>
            </div>

            <form className="listing-modal-body" onSubmit={handleCreateListing}>
              <label>Item Title</label>
              <input 
                type="text" 
                placeholder="What are you selling?"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                required
              />

              <div className="form-row-2">
                <div>
                  <label>Price (₹)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 5000"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>Category</label>
                  <select 
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                  >
                    {CATEGORIES.filter(c => c !== "All").map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <div>
                  <label>City</label>
                  <select 
                    value={newItemCity}
                    onChange={(e) => setNewItemCity(e.target.value)}
                  >
                    {CITIES.map(c => (
                      <option key={c.name} value={c.name}>{c.name} ({c.state})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Locality / Area</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Sector 18 / Connaught Place"
                    value={newItemLocality}
                    onChange={(e) => setNewItemLocality(e.target.value)}
                  />
                </div>
              </div>

              <label>Condition</label>
              <select 
                value={newItemCondition}
                onChange={(e) => setNewItemCondition(e.target.value)}
              >
                <option value="Brand New">Brand New</option>
                <option value="Used - Like New">Used - Like New</option>
                <option value="Used - Good">Used - Good</option>
                <option value="Used - Fair">Used - Fair</option>
              </select>

              <label>Description</label>
              <textarea 
                rows={3}
                placeholder="Describe your item (specs, warranty, pickup details)..."
                value={newItemDesc}
                onChange={(e) => setNewItemDesc(e.target.value)}
              />

              <label>Photo</label>
              <label className="photo-upload-dropzone">
                <BsImages size={28} className="mb-2 text-primary" />
                <span>Upload Item Photo</span>
                <input 
                  type="file" 
                  hidden 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => setNewItemMedia(ev.target.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>

              {newItemMedia && (
                <div className="preview-thumb-box">
                  <img src={newItemMedia} alt="Preview" />
                </div>
              )}

              <button type="submit" className="btn-publish-listing" disabled={isSubmitting}>
                {isSubmitting ? "Publishing Listing..." : "🚀 Publish Listing to Marketplace"}
              </button>
            </form>
          </div>
        </div>
      )}

      <ChatDrawer activeChat={activeChat} onClose={() => setActiveChat(null)} />

      <div className="mobile-bottom-nav">
        <MenuIcons />
      </div>
    </div>
  );
}

export default Marketplace;