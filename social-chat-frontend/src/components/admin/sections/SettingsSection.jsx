import React from "react";

export default function SettingsSection({
  systemSettings = {},
  setSystemSettings,
  handleSaveSettings
}) {
  return (
    <div className="admin-settings-view">
      <div className="admin-view-header">
        <div>
          <h3 className="view-main-title">⚙️ Platform Master Configuration & Version Control</h3>
          <p className="view-sub-title">Toggle maintenance downtime, signup gates, app version force update, and upload policies.</p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="settings-admin-form">
        {/* Maintenance Mode Card */}
        <div className="admin-surface-card shadow-sm mb-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h5 className="mb-1 fw-bold">🚧 Platform Maintenance Mode</h5>
              <p className="text-muted small mb-0">When enabled, regular users will see a maintenance screen.</p>
            </div>

            <label className="admin-switch">
              <input 
                type="checkbox"
                checked={systemSettings.maintenance_mode || false}
                onChange={(e) => setSystemSettings({ ...systemSettings, maintenance_mode: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
          </div>

          {systemSettings.maintenance_mode && (
            <div className="mt-3">
              <label className="form-label small fw-bold">Maintenance Downtime Message</label>
              <textarea 
                className="form-control admin-input"
                rows={3}
                value={systemSettings.maintenance_message || ""}
                onChange={(e) => setSystemSettings({ ...systemSettings, maintenance_message: e.target.value })}
                placeholder="Enter notice message..."
              />
            </div>
          )}
        </div>

        {/* App Version Control & Force Update */}
        <div className="admin-surface-card shadow-sm mb-4">
          <h5 className="mb-3 fw-bold">📲 Mobile & Web App Version Control</h5>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label small fw-bold">Minimum Required App Version</label>
              <input 
                type="text"
                className="form-control admin-input"
                value={systemSettings.min_app_version || "2.4.0"}
                onChange={(e) => setSystemSettings({ ...systemSettings, min_app_version: e.target.value })}
                placeholder="e.g., 2.4.0"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-bold">Latest App Version Available</label>
              <input 
                type="text"
                className="form-control admin-input"
                value={systemSettings.latest_app_version || "2.5.0"}
                onChange={(e) => setSystemSettings({ ...systemSettings, latest_app_version: e.target.value })}
                placeholder="e.g., 2.5.0"
              />
            </div>
          </div>

          <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom border-secondary-subtle">
            <div>
              <strong>Force App Update</strong>
              <div className="text-muted small">Block older versions until users update to latest release</div>
            </div>
            <label className="admin-switch">
              <input 
                type="checkbox"
                checked={systemSettings.force_update_enabled || false}
                onChange={(e) => setSystemSettings({ ...systemSettings, force_update_enabled: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold">Release Notes & Update Description</label>
            <textarea 
              className="form-control admin-input"
              rows={2}
              value={systemSettings.update_release_notes || ""}
              onChange={(e) => setSystemSettings({ ...systemSettings, update_release_notes: e.target.value })}
              placeholder="What's new in this version..."
            />
          </div>
        </div>

        {/* Security, Uploads & Economy Settings */}
        <div className="admin-surface-card shadow-sm mb-4">
          <h5 className="mb-3 fw-bold">🛡️ Platform Security, Media & Star Economy</h5>
          
          <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom border-secondary-subtle">
            <div>
              <strong>Allow New User Signups</strong>
              <div className="text-muted small">Temporarily close new registrations during attacks or maintenance</div>
            </div>
            <label className="admin-switch">
              <input 
                type="checkbox"
                checked={systemSettings.allow_new_signups ?? true}
                onChange={(e) => setSystemSettings({ ...systemSettings, allow_new_signups: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom border-secondary-subtle">
            <div>
              <strong>Strict AI TruthGuard Filter</strong>
              <div className="text-muted small">Automatically quarantine posts scoring below 85% authenticity</div>
            </div>
            <label className="admin-switch">
              <input 
                type="checkbox"
                checked={systemSettings.ai_truthguard_strict || false}
                onChange={(e) => setSystemSettings({ ...systemSettings, ai_truthguard_strict: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="row g-3 mt-2">
            <div className="col-md-6">
              <label className="form-label small fw-bold">Max Reel Video Upload Size (MB)</label>
              <input 
                type="number"
                className="form-control admin-input"
                value={systemSettings.max_reel_upload_mb || 150}
                onChange={(e) => setSystemSettings({ ...systemSettings, max_reel_upload_mb: parseInt(e.target.value, 10) || 150 })}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-bold">Star Conversion Rate (1 Star = ₹ INR)</label>
              <input 
                type="number"
                step="0.1"
                className="form-control admin-input"
                value={systemSettings.star_rate_inr || 0.5}
                onChange={(e) => setSystemSettings({ ...systemSettings, star_rate_inr: parseFloat(e.target.value) || 0.5 })}
              />
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end">
          <button type="submit" className="btn btn-primary px-4 py-2 fw-bold shadow">
            💾 Save Platform Settings
          </button>
        </div>
      </form>
    </div>
  );
}
