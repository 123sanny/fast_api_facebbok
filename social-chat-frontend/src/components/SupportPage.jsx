import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BsChevronLeft, BsSearch, BsChevronRight, BsChatSquareDots,
  BsLifePreserver, BsFileText, BsExclamationTriangle,
  BsCheckCircleFill, BsShieldCheck, BsCashCoin, BsQuestionCircleFill,
  BsX, BsClockHistory, BsUpload, BsCheck2, BsHandThumbsUp, BsHandThumbsDown,
  BsRobot, BsArrowRight, BsStarFill, BsGraphUpArrow, BsInfoCircleFill,
  BsShieldFillCheck, BsArrowRepeat, BsSendFill, BsChatQuoteFill,
  BsExclamationCircleFill
} from "react-icons/bs";
import Header from "./Header";
import ChatDrawer from "./ChatDrawer";
import NexoriaAI from "./NexoriaAI";
import { getActiveUserId, getActiveUserName, getUserStorageItem } from "../services/profileApi";
import {
  fetchAccountHealthApi,
  triggerSecurityScanApi,
  fetchUserTicketsApi,
  createSupportTicketApi,
  fetchTicketThreadApi,
  replyToTicketApi,
  fetchReportsFiledApi,
  fetchViolationsApi,
  requestViolationReviewApi,
  submitTechnicalReportApi,
  fetchMonetisationHubApi,
  fetchKnowledgeBaseArticlesApi,
  submitArticleFeedbackApi
} from "../services/supportApi";
import "./css/SupportPage.css";

const HELP_CATEGORIES = [
  { id: "account", label: "Account Settings", icon: "👤", desc: "Profile, name change, email & password" },
  { id: "security", label: "Login & Security", icon: "🔒", desc: "2FA, active logins, password reset" },
  { id: "privacy", label: "Privacy & Safety", icon: "🛡️", desc: "Audience controls, blocking, reporting" },
  { id: "marketplace", label: "Marketplace & Shop", icon: "🛍️", desc: "Buying, selling listings & payments" },
  { id: "creator", label: "Creator & Monetisation", icon: "💎", desc: "Reels bonuses, subscriptions, stars" },
  { id: "groups", label: "Pages & Groups", icon: "👥", desc: "Admin roles, moderation & engagement" }
];

const SupportPage = () => {
  const navigate = useNavigate();
  const currentUserId = getActiveUserId();
  const [userName, setUserName] = useState(() => getActiveUserName());
  const [userPic, setUserPic] = useState(() => getUserStorageItem("avatar", `https://i.pravatar.cc/150?u=${currentUserId}`, currentUserId));

  const [activeChat, setActiveChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMetaAI, setShowMetaAI] = useState(false);
  const [showAllArticles, setShowAllArticles] = useState(false);
  const [activeModal, setActiveModal] = useState(null); 
  // 'profile_status', 'support_inbox', 'monetisation', 'help_centre', 'report_problem', 'article_view', 'ticket_thread', 'review_request'

  // 1. Account Health & Standing State
  const [accountHealth, setAccountHealth] = useState({
    health_score: 100,
    security_rating: "secure",
    violation_count: 0,
    strike_count: 0,
    shadowban_status: false,
    is_verified_creator: false,
    last_security_scan: new Date().toISOString()
  });
  const [isScanning, setIsScanning] = useState(false);

  // 2. Support Inbox States (3 Tabs)
  const [inboxTab, setInboxTab] = useState("reports"); // 'reports', 'violations', 'tickets'
  const [reportsFiled, setReportsFiled] = useState([]);
  const [violations, setViolations] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [activeTicketThread, setActiveTicketThread] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const threadEndRef = useRef(null);

  // Custom Ticket Form State
  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [newTicketCategory, setNewTicketCategory] = useState("general");
  const [newTicketPriority, setNewTicketPriority] = useState("medium");
  const [newTicketDescription, setNewTicketDescription] = useState("");
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);

  // Violation Appeal Modal State
  const [selectedViolationForReview, setSelectedViolationForReview] = useState(null);
  const [reviewReasonText, setReviewReasonText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // 3. Technical Problem Report State
  const [reportCategory, setReportCategory] = useState("Feed & Posts");
  const [reportText, setReportText] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // 4. Creator Monetisation Hub State
  const [monetisationData, setMonetisationData] = useState(null);
  const [isLoadingMonetisation, setIsLoadingMonetisation] = useState(false);

  // 5. Knowledge Base Articles & Feedback
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [feedbackGiven, setFeedbackGiven] = useState({});

  const location = useLocation();

  // Initial Data Fetching from FastAPI Backend
  useEffect(() => {
    let isMounted = true;

    // Fetch Health
    fetchAccountHealthApi(currentUserId).then(res => {
      if (res.success && isMounted) setAccountHealth(res.data);
    });

    // Fetch Reports Filed
    fetchReportsFiledApi(currentUserId).then(res => {
      if (res.success && isMounted) setReportsFiled(res.reports);
    });

    // Fetch Violations
    fetchViolationsApi(currentUserId).then(res => {
      if (res.success && isMounted) setViolations(res.violations);
    });

    // Fetch User Tickets
    fetchUserTicketsApi(currentUserId).then(res => {
      if (res.success && isMounted) setTickets(res.data);
    });

    // Fetch Articles
    fetchKnowledgeBaseArticlesApi("").then(res => {
      if (res.success && isMounted) setArticles(res.articles);
    });

    // Check URL params for direct view opening (e.g., from ReportModal or navigation)
    const params = new URLSearchParams(location.search);
    const view = params.get("view");
    const tab = params.get("tab");
    if (view) {
      setActiveModal(view);
      if (view === "monetisation") {
        setIsLoadingMonetisation(true);
        fetchMonetisationHubApi(currentUserId).then(res => {
          if (res.success && isMounted) setMonetisationData(res.data);
          if (isMounted) setIsLoadingMonetisation(false);
        });
      }
    }
    if (tab) {
      setInboxTab(tab);
    }

    const handleProfileUpdate = () => {
      const activeId = getActiveUserId();
      setUserName(getActiveUserName());
      setUserPic(getUserStorageItem("avatar", `https://i.pravatar.cc/150?u=${activeId}`, activeId));
    };
    window.addEventListener("profile-updated", handleProfileUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("profile-updated", handleProfileUpdate);
    };
  }, [currentUserId, location.search]);

  // Handle Search Input Change
  const handleSearchChange = (val) => {
    setSearchQuery(val);
    fetchKnowledgeBaseArticlesApi(val).then(res => {
      if (res.success) setArticles(res.articles);
    });
  };

  // Run On-Demand Security & Health Scan
  const handleRunSecurityScan = async () => {
    setIsScanning(true);
    const res = await triggerSecurityScanApi(currentUserId);
    if (res.success) {
      setAccountHealth(res.data);
    }
    setTimeout(() => {
      setIsScanning(false);
    }, 600);
  };

  // Open Monetisation Modal
  const handleOpenMonetisation = async () => {
    setActiveModal("monetisation");
    if (!monetisationData) {
      setIsLoadingMonetisation(true);
      const res = await fetchMonetisationHubApi(currentUserId);
      if (res.success) setMonetisationData(res.data);
      setIsLoadingMonetisation(false);
    }
  };

  // Open Article Reader
  const handleOpenArticle = (article) => {
    setSelectedArticle(article);
    setActiveModal("article_view");
  };

  // Article Helpfulness Voting
  const handleArticleFeedback = async (articleId, isHelpful) => {
    setFeedbackGiven(prev => ({ ...prev, [articleId]: isHelpful ? "yes" : "no" }));
    await submitArticleFeedbackApi(articleId, isHelpful);
  };

  // Submit Technical Problem Report
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportText.trim()) return;

    setIsSubmittingReport(true);
    const sysDiagnostics = `OS: ${navigator.platform || "Windows"} | UserAgent: ${navigator.userAgent.slice(0, 70)} | Screen: ${window.innerWidth}x${window.innerHeight}`;

    const res = await submitTechnicalReportApi({
      category: reportCategory,
      title: `${reportCategory} Issue`,
      steps_to_reproduce: reportText.trim(),
      system_diagnostics: sysDiagnostics,
      app_version: "2.5.0",
      os_info: navigator.platform || "Windows"
    }, currentUserId);

    setIsSubmittingReport(false);
    if (res.success) {
      setTicketId(res.ticket_id || `NX-REP-${Date.now().toString().slice(-5)}`);
      setReportSubmitted(true);
      // Refresh tickets list
      fetchUserTicketsApi(currentUserId).then(tRes => {
        if (tRes.success) setTickets(tRes.data);
      });
    }
  };

  const resetReportForm = () => {
    setReportSubmitted(false);
    setReportText("");
    setTicketId("");
    setActiveModal(null);
  };

  // Open Support Ticket Conversation Thread
  const handleOpenTicketThread = async (tck) => {
    const res = await fetchTicketThreadApi(tck.id, currentUserId);
    if (res.success) {
      setActiveTicketThread(res.data);
    } else {
      setActiveTicketThread(tck);
    }
    setActiveModal("ticket_thread");
    setTimeout(() => threadEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  // Reply to Ticket
  const handleSendTicketReply = async (e) => {
    e?.preventDefault();
    if (!replyMessage.trim() || !activeTicketThread) return;

    setIsSendingReply(true);
    const res = await replyToTicketApi(activeTicketThread.id, replyMessage.trim(), currentUserId);
    setIsSendingReply(false);

    if (res.success) {
      const updatedMessages = [...(activeTicketThread.messages || []), res.data];
      setActiveTicketThread(prev => ({ ...prev, messages: updatedMessages }));
      setReplyMessage("");
      setTimeout(() => threadEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  // Create New Custom Support Ticket
  const handleCreateCustomTicket = async (e) => {
    e?.preventDefault();
    if (!newTicketSubject.trim() || !newTicketDescription.trim()) return;

    setIsCreatingTicket(true);
    const res = await createSupportTicketApi({
      subject: newTicketSubject.trim(),
      category: newTicketCategory,
      priority: newTicketPriority,
      description: newTicketDescription.trim()
    }, currentUserId);
    setIsCreatingTicket(false);

    if (res.success) {
      setNewTicketSubject("");
      setNewTicketDescription("");
      // Refresh tickets
      fetchUserTicketsApi(currentUserId).then(tRes => {
        if (tRes.success) setTickets(tRes.data);
      });
      // Open the new ticket thread
      handleOpenTicketThread(res.data);
    } else {
      alert(`Could not create ticket: ${res.error || "Unknown error"}`);
    }
  };

  // Submit Violation Appeal Review
  const handleSubmitViolationReview = async (e) => {
    e?.preventDefault();
    if (!reviewReasonText.trim() || !selectedViolationForReview) return;

    setIsSubmittingReview(true);
    const res = await requestViolationReviewApi(selectedViolationForReview.id, reviewReasonText.trim(), currentUserId);
    setIsSubmittingReview(false);

    if (res.success) {
      alert(`✅ ${res.message || "Appeal submitted for human review."}`);
      setSelectedViolationForReview(null);
      setReviewReasonText("");
      setActiveModal("support_inbox");
      // Refresh tickets
      fetchUserTicketsApi(currentUserId).then(tRes => {
        if (tRes.success) setTickets(tRes.data);
      });
    }
  };

  return (
    <div className="support-page-wrapper">
      <Header />

      <div className="support-container">
        
        {/* Support Header */}
        <div className="support-header">
          <div className="support-header-left" onClick={() => navigate(-1)}>
            <BsChevronLeft className="back-icon" />
            <h3>Help & Support</h3>
          </div>
          <span className="support-badge-chip">
            <BsShieldFillCheck className="me-1 text-success" /> Verified Center
          </span>
        </div>

        {/* Omnisearch Knowledge Base Bar */}
        <div className="search-section">
          <div className="sp-search-bar">
            <BsSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="How can we help you today? (e.g. monetisation, 2FA, password, strikes)"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {searchQuery && (
              <BsX className="clear-search-btn" onClick={() => handleSearchChange("")} />
            )}
          </div>
        </div>

        {/* Real-time Search Results View */}
        {searchQuery.trim() !== "" ? (
          <div className="search-results-tray content-padding">
            <div className="search-tray-header">
              <h6>Search results for "{searchQuery}" ({articles.length} found)</h6>
            </div>
            {articles.length > 0 ? (
              <div className="search-results-list">
                {articles.map((art) => (
                  <div key={art.id} className="search-result-card" onClick={() => handleOpenArticle(art)}>
                    <div className="src-top">
                      <span className="src-cat">{art.category}</span>
                      <span className="src-time">{art.readTime}</span>
                    </div>
                    <h5>{art.title}</h5>
                    <p>{art.summary}</p>
                    <span className="src-read-link">Read guide <BsArrowRight size={12} /></span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-search-results">
                <BsQuestionCircleFill size={36} className="text-muted mb-2" />
                <h5>No matching articles found</h5>
                <p>Try searching for keywords like "monetisation", "password", "privacy", or ask Nexoria AI assistant directly.</p>
                <button className="btn btn-primary btn-sm rounded-pill mt-2" onClick={() => setShowMetaAI(true)}>
                  <BsRobot className="me-1" /> Ask Nexoria AI
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Default Main Support Hub Layout */
          <div className="content-padding">

            {/* Nexoria AI Assistant Card */}
            <div className="meta-ai-card shadow-sm">
              <div className="meta-ai-top">
                <div className="meta-ai-left">
                  <div className="meta-ai-logo meta-ai-logo-placeholder">
                    <BsRobot size={20} />
                  </div>
                  <div>
                    <strong>Nexoria Quantum AI Assistant</strong>
                    <p>Instant answers & personalized account guidance</p>
                  </div>
                </div>
                <span className="meta-ai-dots" onClick={() => setShowMetaAI(true)}>•••</span>
              </div>
              <p className="meta-ai-desc">
                Need help with your account, monetization, or privacy? Ask anything or choose a quick action below.
              </p>
              <div className="meta-ai-btns">
                <button onClick={() => setShowMetaAI(true)}>
                  <BsRobot className="me-1 text-info" /> I need support
                </button>
                <button onClick={handleOpenMonetisation}>
                  <BsGraphUpArrow className="me-1 text-success" /> What tools am I earning with?
                </button>
              </div>
            </div>

            {/* Section 1: Dynamic Profile Health Standing */}
            <h4 className="section-title">Get help with your profile</h4>
            <div className="sp-list-item" onClick={() => setActiveModal("profile_status")}>
              <div className="sp-item-left">
                <img src={userPic} alt="Profile" className="sp-profile-img" />
                <div>
                  <strong>{userName}</strong>
                  <p className="sp-status-good">
                    <BsCheckCircleFill className="me-1 text-success" /> 
                    {accountHealth.health_score >= 90 ? "Profile in Good Standing · Recommended" : `Account Safety Score: ${accountHealth.health_score}%`}
                  </p>
                </div>
              </div>
              <BsChevronRight className="sp-arrow-icon" />
            </div>

            {/* Section 2: Support Activity / Inbox */}
            <h4 className="section-title">Your support activity</h4>
            <div className="sp-list-item" onClick={() => setActiveModal("support_inbox")}>
              <div className="sp-item-left">
                <div className="sp-icon-box bg-blue-soft">
                  <BsChatSquareDots className="sp-icon text-primary" />
                </div>
                <div>
                  <strong>Support Inbox</strong>
                  <p>
                    {tickets.length > 0 ? `${tickets.length} active ticket(s)` : `${reportsFiled.length} reports filed`} · {violations.length} violations
                  </p>
                </div>
              </div>
              <BsChevronRight className="sp-arrow-icon" />
            </div>

            {/* Section 3: Creator Monetisation Hub Banner */}
            <h4 className="section-title">Make the most of your experience</h4>
            <div className="sp-promo-card" onClick={handleOpenMonetisation}>
              <div className="sp-promo-banner-gradient">
                <div className="sp-promo-badge"><BsStarFill className="me-1" /> Creator Program</div>
                <h3>Monetisation & Payouts Hub</h3>
                <p>Unlock Subscriptions, Stars, and In-Stream Video Ads for your content.</p>
              </div>
            </div>

            {/* Knowledge Base Article Links */}
            <div className="sp-article-list">
              {(showAllArticles ? articles : articles.slice(0, 3)).map((art) => (
                <div className="sp-article-item" key={art.id} onClick={() => handleOpenArticle(art)}>
                  <div className="sp-item-left">
                    <BsFileText className="sp-icon text-primary" />
                    <div>
                      <span>{art.title}</span>
                      <small className="sp-art-cat">{art.category} · {art.readTime}</small>
                    </div>
                  </div>
                  <BsChevronRight className="sp-arrow-icon" />
                </div>
              ))}
              <p className="sp-see-all" onClick={() => setShowAllArticles(!showAllArticles)}>
                {showAllArticles ? "Show less" : `See all guides (${articles.length})`}
              </p>
            </div>

            {/* Section 4: Help Centre Categories & Report Technical Problem */}
            <h4 className="section-title">Can't find what you're looking for?</h4>
            <p className="sp-subtitle">Find step-by-step guides to resolve common issues or report technical glitches.</p>

            <div className="sp-list-item" onClick={() => setActiveModal("help_centre")}>
              <div className="sp-item-left">
                <div className="sp-icon-box bg-teal-soft">
                  <BsLifePreserver className="sp-icon text-teal" />
                </div>
                <div>
                  <strong>Help Centre Categories</strong>
                  <p>Browse by topic: Account, Security, Marketplace, Groups</p>
                </div>
              </div>
              <BsChevronRight className="sp-arrow-icon" />
            </div>

            <div className="sp-list-item" onClick={() => navigate("/terms_policies")}>
              <div className="sp-item-left">
                <div className="sp-icon-box bg-purple-soft">
                  <BsShieldCheck className="sp-icon text-purple" />
                </div>
                <div>
                  <strong>Terms & Policies</strong>
                  <p>Terms of service, privacy policy, community guidelines</p>
                </div>
              </div>
              <BsChevronRight className="sp-arrow-icon" />
            </div>

            <div className="sp-list-item" onClick={() => setActiveModal("report_problem")} style={{ marginBottom: 30 }}>
              <div className="sp-item-left">
                <div className="sp-icon-box bg-amber-soft">
                  <BsExclamationTriangle className="sp-icon text-warning" />
                </div>
                <div>
                  <strong>Report a technical problem</strong>
                  <p>Encountered a bug or broken feature? Let our engineers know</p>
                </div>
              </div>
              <BsChevronRight className="sp-arrow-icon" />
            </div>

          </div>
        )}
      </div>

      {/* ================= MODALS & SUBPAGES ================= */}

      {/* 1. DYNAMIC PROFILE STATUS & HEALTH SCAN MODAL */}
      {activeModal === "profile_status" && (
        <div className="sp-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="sp-modal-content shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="sp-modal-header">
              <h5>Profile Status & Account Quality</h5>
              <button className="sp-modal-close" onClick={() => setActiveModal(null)}><BsX size={24} /></button>
            </div>
            <div className="sp-modal-body">
              <div className="profile-health-hero">
                <img src={userPic} alt="Avatar" className="ph-avatar" />
                <div className={`ph-badge-good ${accountHealth.health_score < 70 ? "text-warning bg-warning-soft" : ""}`}>
                  <BsCheckCircleFill /> {accountHealth.security_rating.replace("_", " ").toUpperCase()} ({accountHealth.health_score}%)
                </div>
                <h4>{userName}</h4>
                <p>
                  {accountHealth.violation_count === 0 
                    ? "Your profile has no policy violations and has full access to all Nexoria features."
                    : `${accountHealth.violation_count} active warning(s) on file.`}
                </p>

                <div className="sp-scan-badge-row">
                  <button 
                    className={`sp-scan-btn ${isScanning ? "scanning" : ""}`}
                    onClick={handleRunSecurityScan}
                    disabled={isScanning}
                  >
                    <BsArrowRepeat className={isScanning ? "spin-anim" : ""} />
                    {isScanning ? "Scanning Account Integrity..." : "Run Security & Health Checkup"}
                  </button>
                </div>
              </div>

              <div className="health-metrics-list">
                <div className="health-metric-row">
                  <div className="hm-icon-circle bg-success"><BsCheck2 size={18} /></div>
                  <div className="hm-info">
                    <h6>Profile is Recommendable</h6>
                    <p>We are helping you grow because your content follows our recommendation guidelines.</p>
                  </div>
                </div>

                <div className="health-metric-row">
                  <div className="hm-icon-circle bg-success"><BsCheck2 size={18} /></div>
                  <div className="hm-info">
                    <h6>Monetisation Status: {accountHealth.health_score >= 80 ? "Eligible" : "Under Review"}</h6>
                    <p>{accountHealth.strike_count === 0 ? "No strikes detected. You can apply for Stars and Subscriptions." : "Resolve active strikes to unlock monetization."}</p>
                  </div>
                </div>

                <div className="health-metric-row">
                  <div className="hm-icon-circle bg-success"><BsCheck2 size={18} /></div>
                  <div className="hm-info">
                    <h6>{accountHealth.violation_count} Community Standards Violations</h6>
                    <p>No warning history or content removals in the last 12 months.</p>
                  </div>
                </div>
              </div>

              <div className="sp-modal-footer-btn-wrap">
                <button className="btn btn-secondary w-100 rounded-pill" onClick={() => setActiveModal(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. DYNAMIC SUPPORT INBOX & REPORTS MODAL (3 TABS) */}
      {activeModal === "support_inbox" && (
        <div className="sp-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="sp-modal-content sp-modal-large shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="sp-modal-header">
              <h5>Support Inbox</h5>
              <button className="sp-modal-close" onClick={() => setActiveModal(null)}><BsX size={24} /></button>
            </div>
            <div className="sp-modal-body">
              {/* Inbox Tabs */}
              <div className="inbox-tabs-nav">
                <button 
                  className={`inbox-tab-btn ${inboxTab === "reports" ? "active" : ""}`}
                  onClick={() => setInboxTab("reports")}
                >
                  Reports about others <span className="inbox-tab-badge">{reportsFiled.length}</span>
                </button>
                <button 
                  className={`inbox-tab-btn ${inboxTab === "violations" ? "active" : ""}`}
                  onClick={() => setInboxTab("violations")}
                >
                  Your violations & alerts <span className="inbox-tab-badge">{violations.length}</span>
                </button>
                <button 
                  className={`inbox-tab-btn ${inboxTab === "tickets" ? "active" : ""}`}
                  onClick={() => setInboxTab("tickets")}
                >
                  Support Tickets <span className="inbox-tab-badge">{tickets.length}</span>
                </button>
              </div>

              {/* Tab 1: Reports About Others */}
              {inboxTab === "reports" && (
                <div className="inbox-tickets-list">
                  {reportsFiled.length > 0 ? (
                    reportsFiled.map(rep => (
                      <div className="inbox-ticket-item" key={rep.id}>
                        <div className="ticket-top">
                          <span className={`ticket-badge ${rep.status === "action_taken" ? "resolved" : "open"}`}>
                            {rep.status.replace("_", " ").toUpperCase()}
                          </span>
                          <span className="ticket-time"><BsClockHistory className="me-1" /> {new Date(rep.created_at).toLocaleDateString()}</span>
                        </div>
                        <h6>Report #{rep.reference_code} ({rep.reason})</h6>
                        <p>{rep.details || "Moderation report filed."}</p>
                        <div className="ticket-result-box bg-success-soft">
                          <BsCheckCircleFill className="text-success me-2 flex-shrink-0" />
                          <span>{rep.action_summary}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="inbox-clean-view text-center py-4">
                      <BsShieldCheck size={36} className="text-success mb-2" />
                      <h5>No reports submitted</h5>
                      <p>You haven't reported any accounts or content recently.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Violations & Appeals */}
              {inboxTab === "violations" && (
                <div className="inbox-tickets-list">
                  {violations.length > 0 ? (
                    violations.map(viol => (
                      <div className="inbox-ticket-item" key={viol.id}>
                        <div className="ticket-top">
                          <span className="ticket-badge urgent">STRIKE ACTIVE</span>
                          <span className="ticket-time">{new Date(viol.date).toLocaleDateString()}</span>
                        </div>
                        <h6>{viol.title}</h6>
                        <p><strong>Policy:</strong> {viol.policy}</p>
                        <p>{viol.details}</p>
                        <div className="ticket-action-row">
                          <span className="text-muted small">You can request human review within 14 days.</span>
                          <button 
                            className="btn-request-review"
                            onClick={() => {
                              setSelectedViolationForReview(viol);
                              setActiveModal("review_request");
                            }}
                          >
                            Request Human Review
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="inbox-clean-view text-center py-4">
                      <div className="clean-icon-circle">
                        <BsShieldCheck size={36} className="text-success" />
                      </div>
                      <h5>No violations on your record</h5>
                      <p>You have zero active strikes and no reports against your content. Thank you for making Nexoria a safe community!</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Support Helpdesk Tickets */}
              {inboxTab === "tickets" && (
                <div className="inbox-tickets-list">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted small">Showing all active and resolved inquiries</span>
                    <button 
                      className="btn btn-primary btn-sm rounded-pill px-3"
                      onClick={() => setActiveModal("create_ticket")}
                    >
                      + Open New Ticket
                    </button>
                  </div>
                  {tickets.length > 0 ? (
                    tickets.map(tck => (
                      <div 
                        className="inbox-ticket-item" 
                        key={tck.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleOpenTicketThread(tck)}
                      >
                        <div className="ticket-top">
                          <span className={`ticket-badge ${tck.status === "resolved" ? "resolved" : tck.status === "in_progress" ? "in-progress" : "open"}`}>
                            {tck.status.toUpperCase()}
                          </span>
                          <span className={`ticket-priority-badge ${tck.priority}`}>{tck.priority} priority</span>
                          <span className="ticket-time ms-auto"><BsClockHistory className="me-1" /> {new Date(tck.created_at).toLocaleDateString()}</span>
                        </div>
                        <h6>{tck.ticket_number}: {tck.subject}</h6>
                        <p>{tck.description.slice(0, 120)}...</p>
                        <span className="text-primary small fw-bold">
                          <BsChatQuoteFill className="me-1" /> View & Reply to Thread ({tck.messages?.length || 1} messages) →
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="inbox-clean-view text-center py-4">
                      <BsFileText size={36} className="text-muted mb-2" />
                      <h5>No open tickets</h5>
                      <p>Need assistance? You can report a technical issue or open a new inquiry.</p>
                      <button className="btn btn-primary btn-sm rounded-pill mt-2" onClick={() => setActiveModal("create_ticket")}>
                        + Open a Support Ticket
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* 2.1 CREATE SUPPORT TICKET MODAL */}
      {activeModal === "create_ticket" && (
        <div className="sp-modal-overlay" onClick={() => setActiveModal("support_inbox")}>
          <div className="sp-modal-content shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="sp-modal-header">
              <h5>Open New Support Ticket</h5>
              <button className="sp-modal-close" onClick={() => setActiveModal("support_inbox")}><BsX size={24} /></button>
            </div>
            <div className="sp-modal-body">
              <form onSubmit={handleCreateCustomTicket}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Ticket Subject</label>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="e.g. Creator Payout Question, Account Recovery, Security Concern"
                    value={newTicketSubject}
                    onChange={(e) => setNewTicketSubject(e.target.value)}
                    required
                  />
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Category</label>
                    <select 
                      className="form-select"
                      value={newTicketCategory}
                      onChange={(e) => setNewTicketCategory(e.target.value)}
                    >
                      <option value="general">General Support</option>
                      <option value="account_recovery">Account Recovery & Login</option>
                      <option value="security_breach">Security & 2FA Incident</option>
                      <option value="creator_payout">Creator Monetisation & Payouts</option>
                      <option value="payment_issue">Payment & Star Transactions</option>
                      <option value="bug_report">App Bug / Glitch</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Priority</label>
                    <select 
                      className="form-select"
                      value={newTicketPriority}
                      onChange={(e) => setNewTicketPriority(e.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Describe your issue in detail</label>
                  <textarea 
                    className="form-control"
                    rows={4}
                    placeholder="Please provide all relevant details so our support specialists can assist you rapidly..."
                    value={newTicketDescription}
                    onChange={(e) => setNewTicketDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="sp-modal-footer-btn-wrap d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-secondary rounded-pill" onClick={() => setActiveModal("support_inbox")}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={!newTicketSubject.trim() || !newTicketDescription.trim() || isCreatingTicket}>
                    {isCreatingTicket ? "Creating Ticket..." : "Submit Ticket"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 3. TICKET THREAD & CONVERSATION MODAL */}
      {activeModal === "ticket_thread" && activeTicketThread && (
        <div className="sp-modal-overlay" onClick={() => setActiveModal("support_inbox")}>
          <div className="sp-modal-content sp-modal-large shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="sp-modal-header">
              <div>
                <span className="badge bg-primary me-2">{activeTicketThread.ticket_number}</span>
                <strong>{activeTicketThread.subject}</strong>
              </div>
              <button className="sp-modal-close" onClick={() => setActiveModal("support_inbox")}><BsX size={24} /></button>
            </div>
            <div className="sp-modal-body">
              
              {/* Message Thread History */}
              <div className="ticket-thread-container">
                {(activeTicketThread.messages || []).map((msg, idx) => (
                  <div key={idx} className={`thread-message-item ${msg.is_staff ? "staff-msg" : "user-msg"}`}>
                    <div className="thread-bubble">
                      {msg.message}
                    </div>
                    <span className="thread-meta">
                      {msg.is_staff ? "🛡️ Nexoria Support Engineer" : "You"} · {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
                <div ref={threadEndRef} />
              </div>

              {/* Reply Form */}
              <form className="ticket-reply-form" onSubmit={handleSendTicketReply}>
                <input 
                  type="text" 
                  className="ticket-reply-input"
                  placeholder="Type your response to support..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  disabled={isSendingReply}
                />
                <button type="submit" className="btn btn-primary rounded-pill px-3" disabled={!replyMessage.trim() || isSendingReply}>
                  <BsSendFill className="me-1" /> {isSendingReply ? "Sending..." : "Reply"}
                </button>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* 4. VIOLATION HUMAN APPEAL REVIEW MODAL */}
      {activeModal === "review_request" && selectedViolationForReview && (
        <div className="sp-modal-overlay" onClick={() => setActiveModal("support_inbox")}>
          <div className="sp-modal-content shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="sp-modal-header">
              <h5>Request Human Appeal Review</h5>
              <button className="sp-modal-close" onClick={() => setActiveModal("support_inbox")}><BsX size={24} /></button>
            </div>
            <div className="sp-modal-body">
              <div className="alert alert-warning py-2 mb-3">
                <BsExclamationCircleFill className="me-2" />
                <strong>Appealing:</strong> {selectedViolationForReview.policy}
              </div>
              <form onSubmit={handleSubmitViolationReview}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Why do you believe this was issued in error?</label>
                  <textarea 
                    className="form-control"
                    rows={4}
                    placeholder="Please explain context, copyright ownership, or why your content complies with Community Guidelines..."
                    value={reviewReasonText}
                    onChange={(e) => setReviewReasonText(e.target.value)}
                    required
                  />
                </div>
                <div className="sp-modal-footer-btn-wrap d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-secondary rounded-pill" onClick={() => setActiveModal("support_inbox")}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={!reviewReasonText.trim() || isSubmittingReview}>
                    {isSubmittingReview ? "Submitting Appeal..." : "Submit Appeal"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 5. DYNAMIC CREATOR MONETISATION & PAYOUTS MODAL */}
      {activeModal === "monetisation" && (
        <div className="sp-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="sp-modal-content sp-modal-large shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="sp-modal-header">
              <h5>Creator Monetisation & Payouts Hub</h5>
              <button className="sp-modal-close" onClick={() => setActiveModal(null)}><BsX size={24} /></button>
            </div>
            <div className="sp-modal-body">
              {isLoadingMonetisation ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary mb-2" role="status"></div>
                  <p>Loading your dynamic creator earnings and stream status...</p>
                </div>
              ) : (
                <>
                  <div className="monetisation-summary-card">
                    <div className="m-left">
                      <span>Estimated Total Earnings (This Month)</span>
                      <h2>
                        ${monetisationData?.estimated_total_earnings?.toFixed(2) || "1,840.70"}{" "}
                        <small className="text-success">+{monetisationData?.monthly_growth_percent || 18.4}%</small>
                      </h2>
                      <p>Next automatic payout scheduled for: <strong>{monetisationData?.next_payout_date || "21st of this month"}</strong></p>
                    </div>
                    <div className="m-right">
                      <div className="payout-badge active">
                        <BsCashCoin className="me-1" /> {monetisationData?.payout_status || "Direct Bank Payout Active"}
                      </div>
                    </div>
                  </div>

                  <h6 className="mt-4 mb-3 fw-bold">Active Earning Streams</h6>
                  <div className="earning-streams-grid">
                    {(monetisationData?.streams || []).map((st) => (
                      <div className="earning-stream-card" key={st.id}>
                        <div className="es-top">
                          <span className="es-icon bg-warning-soft">{st.icon}</span>
                          <span className={`es-status ${st.status.toLowerCase()}`}>{st.status}</span>
                        </div>
                        <h6>{st.name}</h6>
                        <h3>${st.amount.toFixed(2)}</h3>
                        <small>{st.metric_label}</small>
                      </div>
                    ))}
                  </div>

                  <div className="sp-modal-footer-btn-wrap mt-4">
                    <button className="btn btn-primary rounded-pill me-2" onClick={() => { setActiveModal(null); navigate("/orders-payments"); }}>
                      Manage Bank & Payout Settings
                    </button>
                    <button className="btn btn-outline-secondary rounded-pill" onClick={() => setActiveModal(null)}>
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. HELP CENTRE TOPIC DIRECTORY MODAL */}
      {activeModal === "help_centre" && (
        <div className="sp-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="sp-modal-content sp-modal-large shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="sp-modal-header">
              <h5>Help Centre Topic Directory</h5>
              <button className="sp-modal-close" onClick={() => setActiveModal(null)}><BsX size={24} /></button>
            </div>
            <div className="sp-modal-body">
              <p className="text-muted">Select a topic below to view verified step-by-step guides and solutions.</p>
              
              <div className="help-categories-grid">
                {HELP_CATEGORIES.map((cat) => (
                  <div 
                    key={cat.id} 
                    className="help-category-box"
                    onClick={() => {
                      handleSearchChange(cat.label.split(" ")[0]);
                      setActiveModal(null);
                    }}
                  >
                    <span className="hc-icon">{cat.icon}</span>
                    <h6>{cat.label}</h6>
                    <p>{cat.desc}</p>
                  </div>
                ))}
              </div>

              <div className="sp-modal-footer-btn-wrap mt-3">
                <button className="btn btn-secondary w-100 rounded-pill" onClick={() => setActiveModal(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. REPORT TECHNICAL PROBLEM MODAL */}
      {activeModal === "report_problem" && (
        <div className="sp-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="sp-modal-content shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="sp-modal-header">
              <h5>Report a Technical Problem</h5>
              <button className="sp-modal-close" onClick={() => setActiveModal(null)}><BsX size={24} /></button>
            </div>
            <div className="sp-modal-body">
              {reportSubmitted ? (
                <div className="report-success-view text-center py-4">
                  <div className="clean-icon-circle bg-success-soft mb-3">
                    <BsCheckCircleFill size={42} className="text-success" />
                  </div>
                  <h4>Report Submitted Successfully!</h4>
                  <p className="text-muted">
                    Reference Ticket: <strong>#{ticketId}</strong>
                  </p>
                  <p className="sp-subtext">
                    Our engineering team has received your report and diagnostic logs. You can track this in your Support Inbox.
                  </p>
                  <button className="btn btn-primary rounded-pill px-4 mt-3" onClick={resetReportForm}>
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitReport}>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Where is the issue occurring?</label>
                    <select 
                      className="form-select" 
                      value={reportCategory}
                      onChange={(e) => setReportCategory(e.target.value)}
                    >
                      <option value="Feed & Posts">News Feed & Posts</option>
                      <option value="Stories & Reels">Stories & Reels Player</option>
                      <option value="Messenger & Chat">Messenger & Real-time Chat</option>
                      <option value="Profile & Photos">Profile, Photos & Tabs</option>
                      <option value="Marketplace">Marketplace & Listings</option>
                      <option value="Notifications & Settings">Notifications & Settings</option>
                      <option value="Other">Other Technical Issue</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Briefly explain what happened:</label>
                    <textarea 
                      className="form-control" 
                      rows={4} 
                      placeholder="Please include details like what you clicked, what went wrong, and steps to reproduce..."
                      value={reportText}
                      onChange={(e) => setReportText(e.target.value)}
                      required
                    />
                  </div>

                  <div className="report-screenshot-box mb-3">
                    <BsUpload size={20} className="mb-1 text-muted" />
                    <span>Attach screenshot (optional)</span>
                    <small className="text-muted">PNG, JPG up to 10MB</small>
                  </div>

                  <div className="alert alert-info py-2 d-flex align-items-center mb-3">
                    <BsInfoCircleFill className="me-2 flex-shrink-0" />
                    <small>Device diagnostics & browser info will be automatically included to assist debugging.</small>
                  </div>

                  <div className="sp-modal-footer-btn-wrap d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-secondary rounded-pill" onClick={() => setActiveModal(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={!reportText.trim() || isSubmittingReport}>
                      {isSubmittingReport ? "Submitting..." : "Submit Report"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 8. KNOWLEDGE ARTICLE FULL READER MODAL */}
      {activeModal === "article_view" && selectedArticle && (
        <div className="sp-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="sp-modal-content sp-modal-large shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="sp-modal-header">
              <span className="badge bg-primary me-2">{selectedArticle.category}</span>
              <button className="sp-modal-close" onClick={() => setActiveModal(null)}><BsX size={24} /></button>
            </div>
            <div className="sp-modal-body article-reader-body">
              <h2>{selectedArticle.title}</h2>
              <p className="article-meta-info">
                <span><BsClockHistory className="me-1" /> {selectedArticle.readTime}</span>
                <span>• Updated for Nexoria 2026</span>
              </p>

              <div className="article-intro-callout">
                {selectedArticle.summary}
              </div>

              <div className="article-paragraphs">
                {(selectedArticle.content || []).map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              {selectedArticle.tips && (
                <div className="article-tips-card">
                  <h6>💡 Pro Tips for Creators:</h6>
                  <ul>
                    {selectedArticle.tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Feedback Section */}
              <div className="article-feedback-row">
                <span>Was this information helpful?</span>
                {feedbackGiven[selectedArticle.id] ? (
                  <span className="feedback-thankyou text-success">
                    <BsCheck2 className="me-1" /> Thank you for your feedback!
                  </span>
                ) : (
                  <div className="feedback-btn-group">
                    <button 
                      className="btn btn-outline-success btn-sm rounded-pill"
                      onClick={() => handleArticleFeedback(selectedArticle.id, true)}
                    >
                      <BsHandThumbsUp className="me-1" /> Yes
                    </button>
                    <button 
                      className="btn btn-outline-secondary btn-sm rounded-pill"
                      onClick={() => handleArticleFeedback(selectedArticle.id, false)}
                    >
                      <BsHandThumbsDown className="me-1" /> No
                    </button>
                  </div>
                )}
              </div>

              <div className="sp-modal-footer-btn-wrap mt-3">
                <button className="btn btn-secondary w-100 rounded-pill" onClick={() => setActiveModal(null)}>
                  Close Article
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nexoria Quantum AI Chat Assistant Modal */}
      {showMetaAI && (
        <NexoriaAI onClose={() => setShowMetaAI(false)} />
      )}

      {/* Chat Drawer */}
      <ChatDrawer activeChat={activeChat} onClose={() => setActiveChat(null)} />
    </div>
  );
};

export default SupportPage;