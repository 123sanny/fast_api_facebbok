import React from "react";

export default function LegalSection({
  legalDocsList = [],
  selectedLegalDoc,
  setSelectedLegalDoc,
  editingLegalContent,
  setEditingLegalContent,
  isSavingLegalDoc,
  handleSaveLegalDoc
}) {
  return (
    <div className="admin-legal-view">
      <div className="admin-view-header">
        <div>
          <h3 className="view-main-title">📜 Dynamic Legal Policies & FAQ Editor</h3>
          <p className="view-sub-title">Edit and publish live Privacy Policy, Terms of Service, Community Guidelines, and FAQ.</p>
        </div>
      </div>

      {/* Document Tabs */}
      <div className="admin-surface-card p-2 mb-3 shadow-sm">
        <div className="filter-pill-group">
          {legalDocsList.map((doc) => (
            <button 
              key={doc.slug}
              className={`filter-pill-btn ${selectedLegalDoc?.slug === doc.slug ? "active" : ""}`}
              onClick={() => {
                setSelectedLegalDoc(doc);
                setEditingLegalContent(doc.content_markdown);
              }}
            >
              📄 {doc.title}
            </button>
          ))}
        </div>
      </div>

      {selectedLegalDoc ? (
        <div className="admin-surface-card shadow-sm">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="fw-bold mb-1">{selectedLegalDoc.title}</h5>
              <small className="text-muted">Last updated by {selectedLegalDoc.last_updated_by} • {selectedLegalDoc.updated_at}</small>
            </div>

            <button 
              className="btn btn-success fw-bold d-flex align-items-center gap-2"
              onClick={handleSaveLegalDoc}
              disabled={isSavingLegalDoc}
            >
              {isSavingLegalDoc ? "Publishing..." : "💾 Save & Publish Document Live"}
            </button>
          </div>

          <label className="form-label small fw-bold">Markdown Content Editor</label>
          <textarea 
            className="form-control admin-input font-monospace"
            rows={16}
            value={editingLegalContent}
            onChange={(e) => setEditingLegalContent(e.target.value)}
            placeholder="Enter policy markdown text here..."
          />
        </div>
      ) : (
        <div className="admin-surface-card text-center py-5 text-muted">
          Select a legal policy document to edit.
        </div>
      )}
    </div>
  );
}
