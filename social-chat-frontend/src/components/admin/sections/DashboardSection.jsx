import React from "react";
import {
  BsPeopleFill, BsPatchCheckFill, BsStarFill, BsCashStack,
  BsGlobe, BsArrowRepeat, BsLaptopFill, BsPhoneFill,
  BsShieldLockFill, BsBroadcast,
  BsGeoAltFill, BsPinMapFill
} from "react-icons/bs";

export default function DashboardSection({
  metrics,
  verifiedUsersList = [],
  starPurchasesList = [],
  recentActivity = [],
  visitorAnalytics,
  geoLoginStream = [],
  isLoading,
  loadDashboard,
  setActiveTab,
  showToast
}) {
  const visitors = visitorAnalytics?.counters || {
    total_visits: metrics?.visitors?.totalVisits || 0,
    unique_today: metrics?.visitors?.uniqueToday || 0,
    live_active: metrics?.visitors?.liveActiveNow || 0,
    week_visits: 0
  };

  const cityDist = visitorAnalytics?.city_distribution || [
    { city: "Mumbai", flag: "🇮🇳", hits: 450, percentage: 38 },
    { city: "Bengaluru", flag: "🇮🇳", hits: 320, percentage: 27 },
    { city: "Delhi NCR", flag: "🇮🇳", hits: 240, percentage: 20 },
    { city: "Hyderabad", flag: "🇮🇳", hits: 180, percentage: 15 }
  ];

  const recentVisitors = visitorAnalytics?.recent_visitors || [];
  const deviceBreakdown = visitorAnalytics?.device_breakdown || { Desktop: 65, Mobile: 35 };
  const browserBreakdown = visitorAnalytics?.browser_breakdown || { Chrome: 70, Safari: 20, Firefox: 10 };

  return (
    <div className="admin-dashboard-view">
      <div className="admin-view-header">
        <div>
          <h3 className="view-main-title">Platform Performance & Overview</h3>
          <p className="view-sub-title">Real-time telemetry, user adoption velocity, and moderation health.</p>
        </div>
      </div>

      {/* KPI STATS GRID */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card shadow-sm" onClick={() => setActiveTab("users")} style={{ cursor: "pointer" }}>
          <div className="kpi-icon-box bg-primary-subtle text-primary">
            <BsPeopleFill size={24} />
          </div>
          <div className="kpi-info-box">
            <span className="kpi-label">Total Users</span>
            <h3 className="kpi-val">{metrics?.users?.total || 0}</h3>
            <span className="kpi-trend positive">🟢 {metrics?.users?.activeOnline || 0} Online</span>
          </div>
        </div>

        <div className="admin-kpi-card shadow-sm" onClick={() => setActiveTab("bluetick")} style={{ cursor: "pointer" }}>
          <div className="kpi-icon-box bg-info-subtle text-info">
            <BsPatchCheckFill size={24} />
          </div>
          <div className="kpi-info-box">
            <span className="kpi-label">Verified Badges</span>
            <h3 className="kpi-val">{verifiedUsersList.length || metrics?.users?.verified || 0}</h3>
            <span className="kpi-trend">Blue Tick Directory</span>
          </div>
        </div>

        <div className="admin-kpi-card shadow-sm" onClick={() => setActiveTab("star-purchases")} style={{ cursor: "pointer" }}>
          <div className="kpi-icon-box bg-warning-subtle text-warning">
            <BsStarFill size={24} />
          </div>
          <div className="kpi-info-box">
            <span className="kpi-label">Star Purchases</span>
            <h3 className="kpi-val">{starPurchasesList.filter(s => s.status === "pending").length || 0} Pending</h3>
            <span className="kpi-trend positive">Verify & Grant Stars</span>
          </div>
        </div>

        <div className="admin-kpi-card shadow-sm" onClick={() => setActiveTab("finance")} style={{ cursor: "pointer" }}>
          <div className="kpi-icon-box bg-purple-subtle text-purple">
            <BsCashStack size={24} />
          </div>
          <div className="kpi-info-box">
            <span className="kpi-label">Stars Circulated</span>
            <h3 className="kpi-val">{metrics?.economy?.starsCirculated?.toLocaleString() || "0"} ⭐</h3>
            <span className="kpi-trend">Creator Economy</span>
          </div>
        </div>
      </div>

      {/* ================= 🌐 VISITOR TELEMETRY & LIVE TRAFFIC COUNTER ================= */}
      <div className="admin-surface-card shadow-sm mb-4 mt-3 p-3">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 pb-2 border-bottom border-secondary-subtle">
          <div className="d-flex align-items-center gap-2">
            <div className="p-2 rounded bg-primary-subtle text-primary">
              <BsGlobe size={20} />
            </div>
            <div>
              <h5 className="mb-0 fw-bold text-light">🌐 Platform Visitor Counter & Live Traffic Telemetry</h5>
              <span className="text-muted small">Real-time visitor hits, unique daily audiences, device breakdown & geolocation detection</span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-success-subtle text-success border border-success d-flex align-items-center gap-1 px-3 py-2">
              <span className="pulse-dot-live"></span> Live Traffic Sensor Active
            </span>
            <button 
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
              onClick={loadDashboard}
              title="Refresh Live Visitor Telemetry"
            >
              <BsArrowRepeat size={14} className={isLoading ? "spin-icon" : ""} /> Refresh
            </button>
          </div>
        </div>

        {/* 4 Glowing Mini Visitor KPI Tiles */}
        <div className="row g-3 mb-3">
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="visitor-metric-tile shadow-sm border-start border-primary border-4 p-3 rounded bg-dark-subtle h-100">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-muted small text-uppercase fw-semibold">Total Platform Visits</span>
                <span className="badge bg-primary-subtle text-primary">All-Time</span>
              </div>
              <h3 className="fw-bold mb-0 text-light">{visitors.total_visits?.toLocaleString() || 0}</h3>
              <small className="text-success">↑ Live tracked requests</small>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="visitor-metric-tile shadow-sm border-start border-success border-4 p-3 rounded bg-dark-subtle h-100">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-muted small text-uppercase fw-semibold">Unique Visitors Today</span>
                <span className="badge bg-success-subtle text-success">Today</span>
              </div>
              <h3 className="fw-bold mb-0 text-light">{visitors.unique_today?.toLocaleString() || 0}</h3>
              <small className="text-info">Distinct IP addresses</small>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="visitor-metric-tile shadow-sm border-start border-warning border-4 p-3 rounded bg-dark-subtle h-100">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-muted small text-uppercase fw-semibold">Live Active Online</span>
                <span className="badge bg-warning-subtle text-warning">Last 15m</span>
              </div>
              <h3 className="fw-bold mb-0 text-light">{visitors.live_active || 0}</h3>
              <small className="text-warning">⚡ Active browsing now</small>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="visitor-metric-tile shadow-sm border-start border-info border-4 p-3 rounded bg-dark-subtle h-100">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-muted small text-uppercase fw-semibold">Top Visitor Region</span>
                <span className="badge bg-info-subtle text-info">Geo</span>
              </div>
              <h4 className="fw-bold mb-0 text-light text-truncate">{metrics?.visitors?.topRegion || "India 🇮🇳"}</h4>
              <small className="text-muted">Primary traffic origin</small>
            </div>
          </div>
        </div>

        {/* Live Radar Feed & Top Cities Distribution */}
        <div className="row g-3">
          <div className="col-12 col-lg-7">
            <div className="p-3 rounded bg-black border border-secondary-subtle h-100">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="fw-bold small text-light d-flex align-items-center gap-2">
                  <BsGeoAltFill className="text-danger" /> Live Geolocation Radar (Recent Hits)
                </span>
                <span className="text-muted small" style={{ fontSize: "11px" }}>Auto-updating</span>
              </div>

              <div className="visitor-radar-stream custom-scrollbar" style={{ maxHeight: "240px", overflowY: "auto" }}>
                {recentVisitors && recentVisitors.length > 0 ? (
                  recentVisitors.slice(0, 10).map((v) => (
                    <div key={v.id} className="radar-hit-item d-flex align-items-center justify-content-between py-2 px-2 border-bottom border-secondary-subtle">
                      <div className="d-flex align-items-center gap-2">
                        <span className="fs-5">{v.country_flag || "🌐"}</span>
                        <div>
                          <div className="fw-semibold small text-light">{v.city || "Unknown City"}, {v.country || "India"}</div>
                          <div className="text-muted" style={{ fontSize: "11px" }}>IP: {v.ip_address} • {v.device} • {v.browser}</div>
                        </div>
                      </div>
                      <div className="text-end">
                        <span className="badge bg-dark text-info" style={{ fontSize: "10px" }}>{v.page || "/"}</span>
                        <div className="text-muted" style={{ fontSize: "10px" }}>{v.time || "Just now"}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted small">
                    <BsPinMapFill size={28} className="d-block mx-auto mb-2 opacity-50" />
                    No recent visitor hits tracked yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-5">
            <div className="p-3 rounded bg-black border border-secondary-subtle h-100">
              <span className="fw-bold small text-light d-flex align-items-center gap-2 mb-3">
                <BsPinMapFill className="text-warning" /> Top Cities Traffic Share
              </span>

              <div className="city-bars-list">
                {cityDist.map((c, i) => (
                  <div key={i} className="mb-2">
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="text-light">{c.flag || "🌐"} {c.city}</span>
                      <span className="text-muted">{c.percentage || 0}% ({c.hits || 0} hits)</span>
                    </div>
                    <div className="progress" style={{ height: "6px", backgroundColor: "#222" }}>
                      <div 
                        className="progress-bar bg-gradient bg-primary" 
                        role="progressbar" 
                        style={{ width: `${c.percentage || 10}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Devices & Browsers Mini Share */}
              <div className="mt-3 pt-2 border-top border-secondary-subtle d-flex justify-content-between text-muted" style={{ fontSize: "11px" }}>
                <div>
                  <BsLaptopFill className="me-1 text-primary" /> Desktop: <strong className="text-light">{deviceBreakdown.Desktop || 60}%</strong>
                </div>
                <div>
                  <BsPhoneFill className="me-1 text-success" /> Mobile: <strong className="text-light">{deviceBreakdown.Mobile || deviceBreakdown.Android || 40}%</strong>
                </div>
                <div>
                  🌐 Chrome: <strong className="text-light">{browserBreakdown.Chrome || 75}%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT USER GEO-LOGINS & SYSTEM ACTIVITY */}
      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="admin-surface-card shadow-sm p-3 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-secondary-subtle">
              <h5 className="mb-0 fw-bold text-light d-flex align-items-center gap-2">
                <BsShieldLockFill className="text-info" /> Recent User Login Geolocations
              </h5>
              <button 
                className="btn btn-sm btn-link text-info text-decoration-none p-0"
                onClick={() => setActiveTab("security-logs")}
              >
                View Full Logs →
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-dark table-hover table-sm align-middle mb-0" style={{ fontSize: "12px" }}>
                <thead>
                  <tr className="text-muted">
                    <th>User</th>
                    <th>Location & IP</th>
                    <th>Device</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {geoLoginStream && geoLoginStream.length > 0 ? (
                    geoLoginStream.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <img src={item.user_avatar || "https://i.pravatar.cc/100"} alt="User" className="rounded-circle" width={24} height={24} />
                            <div>
                              <div className="fw-semibold text-light text-truncate" style={{ maxWidth: "120px" }}>{item.user_name}</div>
                              <small className="text-muted" style={{ fontSize: "10px" }}>ID: #{item.user_id}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="text-light">{item.location}</div>
                          <small className="text-info" style={{ fontSize: "10px" }}>{item.ip_address}</small>
                        </td>
                        <td>
                          <span className="badge bg-dark-subtle text-light border border-secondary">{item.device}</span>
                        </td>
                        <td className="text-muted">{item.time}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center text-muted py-3">No login geolocation logs available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="admin-surface-card shadow-sm p-3 h-100">
            <h5 className="mb-3 pb-2 border-bottom border-secondary-subtle fw-bold text-light d-flex align-items-center gap-2">
              <BsBroadcast className="text-warning" /> Quick Platform Actions
            </h5>

            <div className="d-grid gap-2">
              <button className="btn btn-outline-primary text-start d-flex align-items-center justify-content-between p-2" onClick={() => setActiveTab("users")}>
                <span>👥 Inspect User Accounts</span>
                <span className="badge bg-primary">{metrics?.users?.total || 0}</span>
              </button>

              <button className="btn btn-outline-warning text-start d-flex align-items-center justify-content-between p-2" onClick={() => setActiveTab("star-purchases")}>
                <span>⭐ Review Star Purchases</span>
                <span className="badge bg-warning text-dark">{starPurchasesList.filter(s => s.status === "pending").length || 0}</span>
              </button>

              <button className="btn btn-outline-info text-start d-flex align-items-center justify-content-between p-2" onClick={() => setActiveTab("bluetick")}>
                <span>🌟 Blue Tick Approvals</span>
                <span className="badge bg-info text-dark">Verify</span>
              </button>

              <button className="btn btn-outline-danger text-start d-flex align-items-center justify-content-between p-2" onClick={() => setActiveTab("pin-resets")}>
                <span>🔐 PIN Reset Approvals</span>
                <span className="badge bg-danger">4-Digit PIN</span>
              </button>

              <button className="btn btn-outline-secondary text-start d-flex align-items-center justify-content-between p-2" onClick={() => setActiveTab("announcements")}>
                <span>📢 Dispatch Global Push</span>
                <span className="badge bg-secondary">Broadcast</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
