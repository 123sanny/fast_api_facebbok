import React from "react";
import {
  BsDownload, BsPatchCheckFill
} from "react-icons/bs";

export default function AnalyticsSection({
  analyticsData = {},
  metrics = {},
  handleExportCsv
}) {
  const growth = analyticsData?.growth || {};
  const retention = analyticsData?.retention || {};
  const topUsers = analyticsData?.top_active_users || [];
  const hashtags = analyticsData?.trending_hashtags || [
    { tag: "#Nexoria2026", count: 1420 },
    { tag: "#TechInnovation", count: 980 },
    { tag: "#CreatorsHub", count: 760 },
    { tag: "#ReelsIndia", count: 690 },
    { tag: "#DigitalArt", count: 510 },
    { tag: "#GamingCommunity", count: 430 }
  ];

  return (
    <div className="admin-analytics-view">
      <div className="admin-view-header">
        <div>
          <h3 className="view-main-title">📈 Platform Analytics & Growth Telemetry</h3>
          <p className="view-sub-title">Real-time user adoption velocity, retention curves, active users, and CSV data export center.</p>
        </div>

        {/* CSV Export Button Group */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button className="btn btn-sm btn-outline-info d-flex align-items-center gap-1" onClick={() => handleExportCsv("users")}>
            <BsDownload size={13} /> Users CSV
          </button>
          <button className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1" onClick={() => handleExportCsv("transactions")}>
            <BsDownload size={13} /> Finance CSV
          </button>
          <button className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1" onClick={() => handleExportCsv("audit_logs")}>
            <BsDownload size={13} /> Audit Logs CSV
          </button>
          <button className="btn btn-sm btn-outline-success d-flex align-items-center gap-1" onClick={() => handleExportCsv("ads")}>
            <BsDownload size={13} /> Ads CSV
          </button>
        </div>
      </div>

      {/* KPI Top Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="admin-metric-card p-3 shadow-sm">
            <span className="metric-label text-muted small">Total Platform Users</span>
            <h3 className="metric-val text-light mb-0">{growth.total_users || metrics?.users?.total || 0}</h3>
            <small className="text-success" style={{ fontSize: "11px" }}>+{growth.new_today || 0} Today</small>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="admin-metric-card p-3 shadow-sm">
            <span className="metric-label text-muted small">7-Day New Signups</span>
            <h3 className="metric-val text-info mb-0">+{growth.new_this_week || 0}</h3>
            <small className="text-secondary" style={{ fontSize: "11px" }}>Weekly adoption rate</small>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="admin-metric-card p-3 shadow-sm">
            <span className="metric-label text-muted small">24h Active Users</span>
            <h3 className="metric-val text-success mb-0">{retention.active_users_24h || metrics?.users?.activeOnline || 0}</h3>
            <small className="text-success" style={{ fontSize: "11px" }}>🟢 Live Engagement</small>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="admin-metric-card p-3 shadow-sm">
            <span className="metric-label text-muted small">User Retention Rate</span>
            <h3 className="metric-val text-warning mb-0">{retention.retention_rate_percent || 92.4}%</h3>
            <small className="text-secondary" style={{ fontSize: "11px" }}>DAU / MAU Stickiness</small>
          </div>
        </div>
      </div>

      {/* 7-Day Growth Trend Visual Bar Chart */}
      <div className="admin-surface-card shadow-sm mb-4">
        <h5 className="fw-bold mb-3">📊 7-Day User Registration Velocity</h5>
        <div className="d-flex align-items-end justify-content-between gap-2 pt-4" style={{ height: 160 }}>
          {(growth.daily_trend || [
            { date: "Mon", new_users: 2 },
            { date: "Tue", new_users: 4 },
            { date: "Wed", new_users: 1 },
            { date: "Thu", new_users: 6 },
            { date: "Fri", new_users: 3 },
            { date: "Sat", new_users: 8 },
            { date: "Sun", new_users: 5 }
          ]).map((day, i) => (
            <div key={i} className="text-center flex-grow-1">
              <div className="text-warning small fw-bold mb-1">+{day.new_users}</div>
              <div 
                className="rounded-top bg-primary shadow-sm"
                style={{
                  height: `${Math.max(20, Math.min(110, day.new_users * 12))}px`,
                  width: "80%",
                  margin: "0 auto",
                  opacity: 0.85
                }}
              ></div>
              <div className="text-muted mt-2" style={{ fontSize: "11px" }}>{day.date}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column Analytics Grid: Top Active Users & Trending Content */}
      <div className="row g-4 mb-4">
        <div className="col-lg-7">
          <div className="admin-surface-card shadow-sm h-100">
            <h5 className="fw-bold mb-3">🏆 Top Most Active Users & Creators</h5>
            <div className="table-responsive">
              <table className="table admin-data-table mb-0 align-middle">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Posts</th>
                    <th>Reels</th>
                    <th>Comments</th>
                    <th>Activity Score</th>
                  </tr>
                </thead>
                <tbody>
                  {topUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted">No active user data available yet.</td>
                    </tr>
                  ) : (
                    topUsers.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <img 
                              src={u.avatar} 
                              alt="" 
                              className="admin-table-avatar" 
                              style={{ width: 34, height: 34 }}
                              onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || "User")}&background=1877f2&color=fff`; }}
                            />
                            <div>
                              <strong className="text-light small">{u.name}</strong>
                              {u.is_verified && <BsPatchCheckFill className="text-info ms-1" size={12} />}
                              <div className="text-muted" style={{ fontSize: "11px" }}>@{u.username}</div>
                            </div>
                          </div>
                        </td>
                        <td><strong className="text-light">{u.posts_count}</strong></td>
                        <td><strong className="text-danger">{u.reels_count}</strong></td>
                        <td><strong className="text-info">{u.comments_count}</strong></td>
                        <td><span className="badge bg-warning-subtle text-warning fw-bold">⭐ {u.activity_score}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="admin-surface-card shadow-sm h-100">
            <h5 className="fw-bold mb-3">🔥 Trending Hashtags & Topics</h5>
            <div className="d-flex flex-wrap gap-2 mb-4">
              {hashtags.map((item, idx) => (
                <div key={idx} className="p-2 rounded bg-dark border border-secondary-subtle d-flex align-items-center gap-2">
                  <strong className="text-info">{item.tag}</strong>
                  <span className="badge bg-secondary-subtle text-light">{item.count.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <h6 className="fw-bold mb-2">📱 Device & Client Breakdown</h6>
            <div className="mb-2">
              <div className="d-flex justify-content-between small mb-1">
                <span>Android App</span>
                <strong>48%</strong>
              </div>
              <div className="progress" style={{ height: 6 }}>
                <div className="progress-bar bg-success" style={{ width: "48%" }}></div>
              </div>
            </div>

            <div className="mb-2">
              <div className="d-flex justify-content-between small mb-1">
                <span>iOS (Apple)</span>
                <strong>34%</strong>
              </div>
              <div className="progress" style={{ height: 6 }}>
                <div className="progress-bar bg-info" style={{ width: "34%" }}></div>
              </div>
            </div>

            <div className="mb-2">
              <div className="d-flex justify-content-between small mb-1">
                <span>Web Desktop & Chrome</span>
                <strong>18%</strong>
              </div>
              <div className="progress" style={{ height: 6 }}>
                <div className="progress-bar bg-warning" style={{ width: "18%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
