import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BsCalendar2EventFill, BsPlusLg, BsSearch, BsCheckCircleFill,
  BsGeoAltFill, BsBroadcast, BsPeopleFill, BsStarFill, BsStar,
  BsX, BsCalendarCheckFill, BsShareFill, BsLink45Deg
} from "react-icons/bs";
import Header from "./Header";
import { getActiveUserId } from "../services/profileApi";
import {
  fetchEventsApi,
  createEventApi,
  rsvpEventApi
} from "../services/communityHubApi";
import "./css/EventsHub.css";

const EVENT_CATEGORIES = [
  "All",
  "AI & Tech",
  "Meetups",
  "Music & Festivals",
  "Esports & Gaming",
  "Networking & Career"
];

function EventsHub() {
  const navigate = useNavigate();
  const currentUserId = getActiveUserId() || 1;

  const [events, setEvents] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'rsvps', 'online', 'in_person'
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Create Event Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [meetingLink, setMeetingLink] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const res = await fetchEventsApi(
        selectedCategory === "All" ? null : selectedCategory,
        activeFilter === "all" || activeFilter === "rsvps" ? null : activeFilter,
        currentUserId
      );
      if (res && res.success) {
        setEvents(res.data || []);
      }
    } catch (err) {
      console.error("Error loading events:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [activeFilter, selectedCategory]);

  const handleRsvp = async (eventId, status) => {
    try {
      const res = await rsvpEventApi(eventId, {
        user_id: currentUserId,
        status: status
      });

      if (res && res.success) {
        setEvents(prev => prev.map(ev => {
          if (ev.id === eventId) {
            return {
              ...ev,
              user_rsvp: res.rsvp
            };
          }
          return ev;
        }));
        showToast(`📅 ${res.message}`);
      }
    } catch (err) {
      showToast("❌ Could not update RSVP");
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await createEventApi({
        creator_id: currentUserId,
        title: eventTitle.trim(),
        description: eventDesc.trim(),
        location: eventLocation.trim(),
        is_online: isOnline,
        meeting_link: meetingLink.trim(),
        cover_image: coverImage.trim() || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200"
      });

      if (res && res.success) {
        showToast(`🎉 Event "${eventTitle}" published!`);
        setShowCreateModal(false);
        setEventTitle("");
        setEventDesc("");
        setEventLocation("");
        setIsOnline(false);
        setMeetingLink("");
        setCoverImage("");
        loadEvents();
      } else {
        showToast("❌ Could not create event");
      }
    } catch (err) {
      showToast("❌ Error creating event");
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayedEvents = events.filter(ev => {
    if (activeFilter === "rsvps") return !!ev.user_rsvp;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return ev.title.toLowerCase().includes(q) || ev.description.toLowerCase().includes(q) || ev.location.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="events-hub-wrapper">
      <Header />

      <div className="events-main-layout container-fluid">
        {/* Left Sidebar */}
        <aside className="events-left-sidebar">
          <div className="events-sidebar-header">
            <div className="d-flex align-items-center gap-2">
              <div className="events-badge-icon">
                <BsCalendar2EventFill size={20} />
              </div>
              <h4 className="m-0 font-weight-bold">Events</h4>
            </div>
            <button 
              className="btn-create-ev-trigger"
              onClick={() => setShowCreateModal(true)}
              title="Host new Event"
            >
              <BsPlusLg size={16} />
            </button>
          </div>

          <button 
            className="btn-create-ev-big shadow"
            onClick={() => setShowCreateModal(true)}
          >
            <BsPlusLg className="me-2" /> Host an Event
          </button>

          {/* Filter Tabs */}
          <div className="events-nav-list mt-3">
            <button 
              className={`ev-nav-btn ${activeFilter === "all" ? "active" : ""}`}
              onClick={() => setActiveFilter("all")}
            >
              <BsCalendar2EventFill className="nav-icon text-warning" />
              <span>Discover Top Events</span>
            </button>

            <button 
              className={`ev-nav-btn ${activeFilter === "rsvps" ? "active" : ""}`}
              onClick={() => setActiveFilter("rsvps")}
            >
              <BsCalendarCheckFill className="nav-icon text-success" />
              <span>Your RSVPs</span>
              <span className="count-badge">{events.filter(e => !!e.user_rsvp).length}</span>
            </button>

            <button 
              className={`ev-nav-btn ${activeFilter === "online" ? "active" : ""}`}
              onClick={() => setActiveFilter("online")}
            >
              <BsBroadcast className="nav-icon text-info" />
              <span>Online & Virtual Streams</span>
            </button>

            <button 
              className={`ev-nav-btn ${activeFilter === "in_person" ? "active" : ""}`}
              onClick={() => setActiveFilter("in_person")}
            >
              <BsGeoAltFill className="nav-icon text-danger" />
              <span>In-Person Meetups</span>
            </button>
          </div>

          <div className="events-divider"></div>

          {/* Categories */}
          <div className="events-cat-section">
            <span className="cat-header-label">CATEGORIES</span>
            <div className="events-cat-chips mt-2">
              {EVENT_CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  className={`ev-cat-chip ${selectedCategory === cat ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Main Grid */}
        <main className="events-content-area">
          {/* Top Bar */}
          <div className="events-top-bar">
            <div className="events-search-box">
              <BsSearch className="search-icon text-muted" />
              <input 
                type="text" 
                placeholder="Search events by title, topic or city..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="clear-search" onClick={() => setSearchQuery("")}>
                  <BsX size={20} />
                </button>
              )}
            </div>

            <span className="events-count-text">
              Showing <strong>{displayedEvents.length}</strong> upcoming events
            </span>
          </div>

          {/* Events Grid */}
          {isLoading ? (
            <div className="events-loading-grid">
              {[1, 2, 3].map(n => (
                <div key={n} className="event-skeleton-card"></div>
              ))}
            </div>
          ) : displayedEvents.length === 0 ? (
            <div className="events-empty-state">
              <div className="empty-cal-circle">
                <BsCalendar2EventFill size={36} />
              </div>
              <h5>No events found in this category</h5>
              <p className="text-muted">
                {activeFilter === "rsvps" 
                  ? "You haven't RSVP'd to any events yet. Check out upcoming summits, workshops, and meetups!" 
                  : "Try clearing your search or switching categories to discover more gatherings."}
              </p>
              <button className="btn btn-warning rounded-pill px-4 text-dark font-weight-bold" onClick={() => setShowCreateModal(true)}>
                <BsPlusLg className="me-1" /> Host an Event
              </button>
            </div>
          ) : (
            <div className="events-cards-grid">
              {displayedEvents.map(ev => (
                <div key={ev.id} className="event-card shadow-lg">
                  {/* Cover Header */}
                  <div className="event-cover-box">
                    <img src={ev.cover_image} alt="" />
                    <div className="event-date-badge">
                      <span className="month">{ev.month_badge}</span>
                      <span className="day">{ev.day_badge}</span>
                    </div>
                    <span className="event-type-pill">
                      {ev.is_online ? "🌐 Virtual Stream" : "📍 In-Person"}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="event-card-body">
                    <div className="event-time-row">
                      <span className="text-warning font-weight-bold small">{ev.date_display}</span>
                    </div>

                    <h5 className="event-card-title">{ev.title}</h5>
                    
                    <div className="event-location-row">
                      <BsGeoAltFill className="text-muted me-1.5" />
                      <span className="text-truncate">{ev.location}</span>
                    </div>

                    <p className="event-card-desc">{ev.description}</p>

                    <div className="event-attendees-row">
                      <span><BsPeopleFill className="me-1 text-success" /> <strong>{ev.going_count}</strong> going</span>
                      <span>•</span>
                      <span><BsStarFill className="me-1 text-warning" /> <strong>{ev.interested_count}</strong> interested</span>
                    </div>

                    {/* RSVP Buttons */}
                    <div className="event-rsvp-bar">
                      <button 
                        className={`btn-rsvp-pill ${ev.user_rsvp === "going" ? "active-going" : ""}`}
                        onClick={() => handleRsvp(ev.id, "going")}
                      >
                        <BsCheckCircleFill className="me-1" /> Going
                      </button>

                      <button 
                        className={`btn-rsvp-pill ${ev.user_rsvp === "interested" ? "active-interested" : ""}`}
                        onClick={() => handleRsvp(ev.id, "interested")}
                      >
                        <BsStar className="me-1" /> Interested
                      </button>

                      {ev.is_online && ev.meeting_link && (
                        <a 
                          href={ev.meeting_link} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="btn-join-stream"
                          title="Join Live Stream"
                        >
                          <BsBroadcast size={15} /> Join
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* CREATE EVENT MODAL */}
      {showCreateModal && (
        <div className="events-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="events-modal-dialog shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="events-modal-header">
              <h5 className="m-0 font-weight-bold">
                <BsCalendar2EventFill className="me-2 text-warning" /> Host a New Event
              </h5>
              <button className="btn-close-emodal" onClick={() => setShowCreateModal(false)}>
                <BsX size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="events-modal-body">
              <div className="mb-3">
                <label className="form-label font-weight-bold small text-light">Event Title</label>
                <input 
                  type="text" 
                  className="form-control bg-dark text-light border-secondary"
                  placeholder="e.g. AI Hackathon 2026, Synthesizer Jam Night..."
                  value={eventTitle}
                  onChange={e => setEventTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="form-check form-switch mb-3">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="onlineSwitch"
                  checked={isOnline}
                  onChange={e => setIsOnline(e.target.checked)}
                />
                <label className="form-check-label text-light small font-weight-bold" htmlFor="onlineSwitch">
                  Is this a Virtual / Online Live Event?
                </label>
              </div>

              {isOnline ? (
                <div className="mb-3">
                  <label className="form-label font-weight-bold small text-light">Live Stream / Meeting Link</label>
                  <input 
                    type="url" 
                    className="form-control bg-dark text-light border-secondary"
                    placeholder="https://nexoria.social/live/your-event"
                    value={meetingLink}
                    onChange={e => setMeetingLink(e.target.value)}
                  />
                </div>
              ) : (
                <div className="mb-3">
                  <label className="form-label font-weight-bold small text-light">Location / Venue</label>
                  <input 
                    type="text" 
                    className="form-control bg-dark text-light border-secondary"
                    placeholder="e.g. Cyber Hub, Gurugram / Delhi NCR"
                    value={eventLocation}
                    onChange={e => setEventLocation(e.target.value)}
                  />
                </div>
              )}

              <div className="mb-3">
                <label className="form-label font-weight-bold small text-light">Description</label>
                <textarea 
                  className="form-control bg-dark text-light border-secondary"
                  rows={3}
                  placeholder="Provide details about schedule, speakers, tickets, or requirements..."
                  value={eventDesc}
                  onChange={e => setEventDesc(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label font-weight-bold small text-light">Cover Photo URL (Optional)</label>
                <input 
                  type="url" 
                  className="form-control bg-dark text-light border-secondary"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={coverImage}
                  onChange={e => setCoverImage(e.target.value)}
                />
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button 
                  type="button" 
                  className="btn btn-secondary rounded-pill px-3"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-warning text-dark rounded-pill px-4 font-weight-bold"
                  disabled={isSubmitting || !eventTitle.trim()}
                >
                  {isSubmitting ? "Publishing..." : "Publish Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="events-floating-toast">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default EventsHub;
