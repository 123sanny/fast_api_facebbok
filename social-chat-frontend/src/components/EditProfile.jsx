import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    BsPencilFill, BsChevronUp, BsChevronDown,
    BsGeoAlt, BsCameraFill, BsArrowLeft,
    BsShieldCheck, BsPersonFill, BsCheckCircleFill
} from "react-icons/bs";
import {
    FaGraduationCap, FaMusic, FaTv, FaFilm, FaGamepad,
    FaTshirt, FaBriefcase, FaHome, FaCalendarAlt,
    FaLink, FaUsers, FaPercentage, FaAt, FaPhoneAlt,
    FaHeart, FaTree, FaMars, FaCommentDots, FaMagic,
    FaSchool, FaStar, FaEnvelope, FaPhotoVideo
} from "react-icons/fa";
import "./css/EditProfile.css";

// Profile Backend API Services
import {
    fetchFullProfileApi,
    getActiveUserId,
    getActiveUserName,
    getUserStorageItem,
    setUserStorageItem,
    uploadAvatarFileApi,
    uploadCoverFileApi,
    updateAvatarUrlApi,
    updateCoverUrlApi,
    updateBioApi,
    updatePinnedDetailsApi,
    updateCategoryApi,
    updatePersonalDetailsApi,
    updateFamilyAndPetsApi,
    updateWorkApi,
    updateEducationApi,
    updateHobbiesApi,
    updateInterestsApi,
    updatePlacesApi,
    updateCommunitiesApi,
    updateOffersApi,
    updateSocialsApi,
    updateMediaKitApi,
    updateBadgesApi,
    updateProfileNameApi
} from "../services/profileApi";

// Sub-pages & Modals
import CoverBottomSheet from "./CoverBottomSheet";
import FullScreenCover from "./FullScreenCover";
import ChooseCoverPhoto from "./ChooseCoverPhoto";
import DragToAdjust from "./DragToAdjust";
import BioEditPage from "./BioEditPage";
import PinnedDetailsPage from "./PinnedDetailsPage";
import AiCreatorPage from "./AiCreatorPage";
import CategoryPage from "./CategoryPage";
import SimpleTextFieldPage from "./SimpleTextFieldPage";
import DateOfBirthPage from "./DateOfBirthPage";
import StatusPage from "./StatusPage";
import FamilyBottomSheet from "./FamilyBottomSheet";
import FamilyMemberPage from "./FamilyMemberPage";
import PetPage from "./PetPage";
import GenderPage from "./GenderPage";
import LanguagesPage from "./LanguagesPage";
import LinksPage from "./LinksPage";
import CommunitiesPage from "./CommunitiesPage";
import PhonePage from "./PhonePage";
import EmailPage from "./EmailPage";
import EducationPage from "./EducationPage";
import WorkPage from "./WorkPage";
import MediaKitPage from "./MediaKitPage";

// New Next-Gen Interactive Modals
import HobbiesModal from "./HobbiesModal";
import InterestsModal from "./InterestsModal";
import PlacesModal from "./PlacesModal";
import OffersModal from "./OffersModal";
import SocialLinksModal from "./SocialLinksModal";
import BadgesModal from "./BadgesModal";

/* ── Collapsible Section with Gradient Header Badge ── */
function Section({ title, icon, gradientClass = "bg-gradient-blue", children, defaultOpen = true }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="ep-section">
            <div className="ep-section-header" onClick={() => setOpen(!open)}>
                <div className="ep-section-title-wrap">
                    {icon && <div className={`ep-section-badge-icon ${gradientClass}`}>{icon}</div>}
                    <h3>{title}</h3>
                </div>
                {open ? <BsChevronUp className="ep-toggle-icon" /> : <BsChevronDown className="ep-toggle-icon" />}
            </div>
            {open && <div className="ep-section-body">{children}</div>}
        </div>
    );
}

/* ── Item Row with Gradient Icon Box & Chip Support ── */
function Item({ icon, gradientClass = "bg-gradient-blue", mainText, subText, chips, privacy, showEdit = true, onClick }) {
    return (
        <div className="ep-item" onClick={onClick} style={onClick ? { cursor: "pointer" } : undefined}>
            <div className="ep-item-left">
                {icon && <div className={`ep-item-icon-box ${gradientClass}`}>{icon}</div>}
                <div className="ep-item-text">
                    <span className="ep-item-main">{mainText}</span>
                    {subText && (
                        <span className="ep-item-sub">
                            {subText}
                            {privacy && <span className="ep-privacy-badge">{privacy}</span>}
                        </span>
                    )}
                    {chips && Array.isArray(chips) && chips.length > 0 && (
                        <div className="d-flex flex-wrap gap-1 mt-1">
                            {chips.map((c, idx) => (
                                <span key={idx} className="ep-chip">{c}</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {showEdit && <button className="ep-edit-btn" type="button"><BsPencilFill size={14} /></button>}
        </div>
    );
}

function EditProfile() {
    const navigate = useNavigate();
    const coverFileInputRef = useRef(null);
    const avatarFileInputRef = useRef(null);
    const currentUserId = getActiveUserId();

    // Name & Username Identity States
    const [showNameModal, setShowNameModal] = useState(false);
    const [firstName, setFirstName] = useState(() => localStorage.getItem("first_name") || "");
    const [surname, setSurname] = useState(() => localStorage.getItem("surname") || "");
    const [fullName, setFullName] = useState(() => getActiveUserName());
    const [username, setUsername] = useState(() => localStorage.getItem("username") || "");
    const [editFirstName, setEditFirstName] = useState(firstName);
    const [editSurname, setEditSurname] = useState(surname);
    const [editUsername, setEditUsername] = useState(username);
    const [nameError, setNameError] = useState("");
    const [isSavingName, setIsSavingName] = useState(false);
    const [nameToast, setNameToast] = useState("");

    // Cover & Profile Avatar
    const [showCoverMenu, setShowCoverMenu] = useState(false);
    const [coverImg, setCoverImg] = useState(() => getUserStorageItem("cover", "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800", currentUserId));
    const [avatarImg, setAvatarImg] = useState(() => getUserStorageItem("avatar", "https://i.pravatar.cc/150?u=" + currentUserId, currentUserId));
    const [showFullCover, setShowFullCover] = useState(false);
    const [showChooseCover, setShowChooseCover] = useState(false);
    const [dragImage, setDragImage] = useState(null);
    const [selectedCoverFile, setSelectedCoverFile] = useState(null);

    // Intro & Bio
    const [showBioEdit, setShowBioEdit] = useState(false);
    const [bio, setBio] = useState(() => getUserStorageItem("bio", "🚀 Full Stack Engineer · Creator & Pioneer · Building Nexoria Cosmos 💫", currentUserId));
    const [showPinnedDetails, setShowPinnedDetails] = useState(false);
    const [pinnedDetails, setPinnedDetails] = useState(() => {
        try {
            const saved = getUserStorageItem("pinned_details", null, currentUserId);
            return saved ? JSON.parse(saved) : ["category", "city", "education"];
        } catch {
            return ["category", "city", "education"];
        }
    });

    // Category
    const [showAiCreator, setShowAiCreator] = useState(false);
    const [aiCreator, setAiCreator] = useState(() => getUserStorageItem("ai_creator", "No", currentUserId));
    const [showCategoryPage, setShowCategoryPage] = useState(false);
    const [categories, setCategories] = useState(() => {
        try {
            const saved = getUserStorageItem("categories", null, currentUserId);
            return saved ? JSON.parse(saved) : ["Digital creator", "Software Engineer"];
        } catch {
            return ["Digital creator"];
        }
    });

    // Personal details
    const [showLocation, setShowLocation] = useState(false);
    const [location, setLocation] = useState(() => getUserStorageItem("location", "Delhi, India", currentUserId));
    const [locationPrivacy, setLocationPrivacy] = useState(() => getUserStorageItem("location_privacy", "Public", currentUserId));

    const [showHometown, setShowHometown] = useState(false);
    const [hometown, setHometown] = useState(() => getUserStorageItem("hometown", "Deoria", currentUserId));
    const [hometownPrivacy, setHometownPrivacy] = useState(() => getUserStorageItem("hometown_privacy", "Public", currentUserId));

    const [showEducation, setShowEducation] = useState(false);
    const [education, setEducation] = useState(() => getUserStorageItem("education", "Computer Science and Engineering", currentUserId));
    const [educationPrivacy, setEducationPrivacy] = useState(() => getUserStorageItem("education_privacy", "Public", currentUserId));

    const [showDob, setShowDob] = useState(false);
    const [dob, setDob] = useState(() => {
        try {
            const saved = getUserStorageItem("dob", null, currentUserId);
            return saved ? JSON.parse(saved) : { monthDay: "10 August", year: "2002", privacy: "Friends" };
        } catch {
            return { monthDay: "10 August", year: "2002", privacy: "Friends" };
        }
    });

    const [showStatus, setShowStatus] = useState(false);
    const [status, setStatus] = useState(() => getUserStorageItem("status", "Single", currentUserId));
    const [statusPrivacy, setStatusPrivacy] = useState(() => getUserStorageItem("status_privacy", "Friends", currentUserId));

    const [showFamilySheet, setShowFamilySheet] = useState(false);
    const [showFamilyMember, setShowFamilyMember] = useState(false);
    const [showPet, setShowPet] = useState(false);
    const [familyMembers, setFamilyMembers] = useState(() => {
        try {
            const saved = getUserStorageItem("family", null, currentUserId);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [pets, setPets] = useState(() => {
        try {
            const saved = getUserStorageItem("pets", null, currentUserId);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [showGender, setShowGender] = useState(false);
    const [gender, setGender] = useState(() => getUserStorageItem("gender", "Male", currentUserId));
    const [pronouns, setPronouns] = useState(() => getUserStorageItem("pronouns", "he/him", currentUserId));
    const [systemPronoun, setSystemPronoun] = useState(() => getUserStorageItem("sys_pronoun", "he/him", currentUserId));

    const [showLanguages, setShowLanguages] = useState(false);
    const [languages, setLanguages] = useState(() => getUserStorageItem("languages", "English · Hindi", currentUserId));
    const [languagesPrivacy, setLanguagesPrivacy] = useState(() => getUserStorageItem("languages_privacy", "Your friends", currentUserId));

    // Work
    const [showWork, setShowWork] = useState(false);
    const [work, setWork] = useState(() => {
        try {
            const saved = getUserStorageItem("work", null, currentUserId);
            return saved ? JSON.parse(saved) : { company: "Nexoria Technologies", position: "Full Stack Engineer", privacy: "Public" };
        } catch {
            return { company: "Nexoria Technologies", position: "Full Stack Engineer", privacy: "Public" };
        }
    });

    // Hobbies
    const [showHobbies, setShowHobbies] = useState(false);
    const [hobbies, setHobbies] = useState(() => {
        try {
            const saved = getUserStorageItem("hobbies", null, currentUserId);
            return saved ? JSON.parse(saved) : ["💻 Coding", "📸 Photography", "🎵 Music Production", "✈️ Traveling"];
        } catch {
            return ["💻 Coding", "📸 Photography", "🎵 Music Production"];
        }
    });

    // Interests
    const [showInterests, setShowInterests] = useState(false);
    const [activeInterestType, setActiveInterestType] = useState("music");
    const [interests, setInterests] = useState(() => {
        try {
            const saved = getUserStorageItem("interests", null, currentUserId);
            return saved ? JSON.parse(saved) : {
                music: ["A.R. Rahman", "Coldplay"],
                tv: ["Silicon Valley", "Dark"],
                films: ["Interstellar", "Inception"],
                games: ["Cyberpunk 2077", "Valorant"],
                sports: ["Real Madrid", "CSK"]
            };
        } catch {
            return {
                music: ["A.R. Rahman", "Coldplay"],
                tv: ["Silicon Valley"],
                films: ["Interstellar"],
                games: ["Cyberpunk 2077"],
                sports: ["Real Madrid"]
            };
        }
    });

    // Travel & Places
    const [showPlaces, setShowPlaces] = useState(false);
    const [places, setPlaces] = useState(() => {
        try {
            const saved = getUserStorageItem("places", null, currentUserId);
            return saved ? JSON.parse(saved) : ["Delhi, India", "Deoria, UP", "Varanasi, UP", "Goa, India"];
        } catch {
            return ["Delhi, India", "Deoria, UP"];
        }
    });

    // Communities
    const [showCommunities, setShowCommunities] = useState(false);
    const [communities, setCommunities] = useState(() => {
        try {
            const saved = getUserStorageItem("communities", null, currentUserId);
            return saved ? JSON.parse(saved) : [
                { id: 1, name: "General Knowledge & News", members: "904K" },
                { id: 5, name: "Nexoria Pioneers Community", members: "107K" }
            ];
        } catch {
            return [{ id: 5, name: "Nexoria Pioneers Community", members: "107K" }];
        }
    });

    // Offers & Promotions
    const [showOffers, setShowOffers] = useState(false);
    const [offers, setOffers] = useState(() => {
        try {
            const saved = getUserStorageItem("offers", null, currentUserId);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // Links
    const [showLinks, setShowLinks] = useState(false);
    const [links, setLinks] = useState(() => {
        try {
            const saved = getUserStorageItem("links", null, currentUserId);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [linksPrivacy, setLinksPrivacy] = useState(() => getUserStorageItem("links_privacy", "Public", currentUserId));

    // Contact info
    const [showSocials, setShowSocials] = useState(false);
    const [socials, setSocials] = useState(() => {
        try {
            const saved = getUserStorageItem("socials", null, currentUserId);
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });

    const [showPhone, setShowPhone] = useState(false);
    const [phone, setPhone] = useState(() => getUserStorageItem("phone", "", currentUserId));
    const [phonePrivacy, setPhonePrivacy] = useState(() => getUserStorageItem("phone_privacy", "Only me", currentUserId));

    const [showEmail, setShowEmail] = useState(false);
    const [email, setEmail] = useState(() => getUserStorageItem("email", localStorage.getItem("email") || "", currentUserId));
    const [emailPrivacy, setEmailPrivacy] = useState(() => getUserStorageItem("email_privacy", "Friends", currentUserId));

    const [showMediaKit, setShowMediaKit] = useState(false);
    const [mediaKit, setMediaKit] = useState(() => {
        try {
            const saved = getUserStorageItem("media_kit", null, currentUserId);
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    // Badges
    const [showBadges, setShowBadges] = useState(false);
    const [badges, setBadges] = useState(() => {
        try {
            const saved = getUserStorageItem("badges", null, currentUserId);
            return saved ? JSON.parse(saved) : ["verified_id", "pioneer", "e2e_guard", "top_contributor"];
        } catch {
            return ["verified_id", "pioneer", "e2e_guard"];
        }
    });

    // Cover upload handler
    const handleCoverFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSelectedCoverFile(file);
        const reader = new FileReader();
        reader.onload = (event) => {
            setDragImage(event.target.result);
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    // Avatar upload handler
    const handleAvatarFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 1. Immediate Base64 Data URL preview (works instantly offline/online)
        const reader = new FileReader();
        reader.onload = async (event) => {
            const previewUrl = event.target.result;
            setAvatarImg(previewUrl);
            setUserStorageItem("avatar", previewUrl, currentUserId);
            window.dispatchEvent(new Event("profile-updated"));

            // 2. Upload file to FastAPI server disk and update database
            try {
                const uploadRes = await uploadAvatarFileApi(file, currentUserId);
                if (uploadRes && uploadRes.profile_pic) {
                    setAvatarImg(uploadRes.profile_pic);
                    setUserStorageItem("avatar", uploadRes.profile_pic, currentUserId);
                    window.dispatchEvent(new Event("profile-updated"));
                } else {
                    updateAvatarUrlApi(previewUrl, currentUserId);
                }
            } catch (err) {
                updateAvatarUrlApi(previewUrl, currentUserId);
            }
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    // Initial sync from FastAPI Backend
    useEffect(() => {
        let isMounted = true;
        const loadBackendProfile = async () => {
            const res = await fetchFullProfileApi(currentUserId);
            if (res.success && res.data && isMounted) {
                const d = res.data;
                if (d.cover_photo) {
                    setCoverImg(d.cover_photo);
                    setUserStorageItem("cover", d.cover_photo, currentUserId);
                }
                if (d.profile_pic) {
                    setAvatarImg(d.profile_pic);
                    setUserStorageItem("avatar", d.profile_pic, currentUserId);
                }
                if (d.bio) {
                    setBio(d.bio);
                    setUserStorageItem("bio", d.bio, currentUserId);
                }
                if (d.pinned_details && Array.isArray(d.pinned_details)) {
                    setPinnedDetails(d.pinned_details);
                    setUserStorageItem("pinned_details", d.pinned_details, currentUserId);
                }
                if (d.categories && Array.isArray(d.categories)) {
                    setCategories(d.categories);
                    setUserStorageItem("categories", d.categories, currentUserId);
                }
                if (d.is_ai_creator !== undefined && d.is_ai_creator !== null) {
                    const aiVal = d.is_ai_creator ? "Yes" : "No";
                    setAiCreator(aiVal);
                    setUserStorageItem("ai_creator", aiVal, currentUserId);
                }
                if (d.current_city) {
                    setLocation(d.current_city);
                    setUserStorageItem("location", d.current_city, currentUserId);
                }
                if (d.hometown) {
                    setHometown(d.hometown);
                    setUserStorageItem("hometown", d.hometown, currentUserId);
                }
                if (d.education_college || d.education_degree || d.education_school) {
                    const edu = d.education_college || d.education_degree || d.education_school;
                    setEducation(edu);
                    setUserStorageItem("education", edu, currentUserId);
                }
                if (d.education_privacy) {
                    setEducationPrivacy(d.education_privacy);
                    setUserStorageItem("education_privacy", d.education_privacy, currentUserId);
                }
                if (d.dob_month_day || d.dob_year) {
                    const dobObj = {
                        monthDay: d.dob_month_day || "10 August",
                        year: d.dob_year || "2002",
                        privacy: d.dob_privacy || "Friends"
                    };
                    setDob(dobObj);
                    setUserStorageItem("dob", dobObj, currentUserId);
                }
                if (d.relationship_status) {
                    setStatus(d.relationship_status);
                    setUserStorageItem("status", d.relationship_status, currentUserId);
                }
                if (d.family_members && Array.isArray(d.family_members)) {
                    setFamilyMembers(d.family_members);
                    setUserStorageItem("family", d.family_members, currentUserId);
                }
                if (d.pets && Array.isArray(d.pets)) {
                    setPets(d.pets);
                    setUserStorageItem("pets", d.pets, currentUserId);
                }
                if (d.gender) {
                    setGender(d.gender);
                    setUserStorageItem("gender", d.gender, currentUserId);
                }
                if (d.pronouns) {
                    setPronouns(d.pronouns);
                    setSystemPronoun(d.pronouns);
                    setUserStorageItem("pronouns", d.pronouns, currentUserId);
                    setUserStorageItem("sys_pronoun", d.pronouns, currentUserId);
                }
                if (d.languages) {
                    const langStr = Array.isArray(d.languages) ? d.languages.join(" · ") : d.languages;
                    setLanguages(langStr);
                    setUserStorageItem("languages", langStr, currentUserId);
                }
                if (d.work_workplace || d.work_job_title) {
                    const workObj = {
                        company: d.work_workplace || "Nexoria Technologies",
                        position: d.work_job_title || "Full Stack Engineer",
                        privacy: d.work_privacy || "Public"
                    };
                    setWork(workObj);
                    setUserStorageItem("work", workObj, currentUserId);
                }
                if (d.hobbies && Array.isArray(d.hobbies)) {
                    setHobbies(d.hobbies);
                    setUserStorageItem("hobbies", d.hobbies, currentUserId);
                }
                if (d.interests && typeof d.interests === "object") {
                    setInterests(d.interests);
                    setUserStorageItem("interests", d.interests, currentUserId);
                }
                if (d.visited_places && Array.isArray(d.visited_places)) {
                    setPlaces(d.visited_places);
                    setUserStorageItem("places", d.visited_places, currentUserId);
                }
                if (d.communities && Array.isArray(d.communities)) {
                    setCommunities(d.communities);
                    setUserStorageItem("communities", d.communities, currentUserId);
                }
                if (d.offers && Array.isArray(d.offers)) {
                    setOffers(d.offers);
                    setUserStorageItem("offers", d.offers, currentUserId);
                }
                if (d.social_handles && typeof d.social_handles === "object") {
                    setSocials(d.social_handles);
                    setUserStorageItem("socials", d.social_handles, currentUserId);
                }
                if (d.custom_links && Array.isArray(d.custom_links)) {
                    setLinks(d.custom_links);
                    setUserStorageItem("links", d.custom_links, currentUserId);
                }
                if (d.contact_phone) {
                    setPhone(d.contact_phone);
                    setUserStorageItem("phone", d.contact_phone, currentUserId);
                }
                if (d.contact_email) {
                    setEmail(d.contact_email);
                    setUserStorageItem("email", d.contact_email, currentUserId);
                }
                if (d.contact_privacy) {
                    setPhonePrivacy(d.contact_privacy);
                    setEmailPrivacy(d.contact_privacy);
                    setUserStorageItem("phone_privacy", d.contact_privacy, currentUserId);
                    setUserStorageItem("email_privacy", d.contact_privacy, currentUserId);
                }
                if (d.media_kit_title || d.media_kit_link) {
                    const mkObj = {
                        title: d.media_kit_title || "",
                        link: d.media_kit_link || "",
                        privacy: d.media_kit_privacy || "Public"
                    };
                    setMediaKit(mkObj);
                    setUserStorageItem("media_kit", mkObj, currentUserId);
                }
                if (d.badges && Array.isArray(d.badges)) {
                    setBadges(d.badges);
                    setUserStorageItem("badges", d.badges, currentUserId);
                }
                if (d.first_name) {
                    setFirstName(d.first_name);
                    setEditFirstName(d.first_name);
                }
                if (d.surname) {
                    setSurname(d.surname);
                    setEditSurname(d.surname);
                }
                if (d.full_name) {
                    setFullName(d.full_name);
                }
                if (d.username) {
                    setUsername(d.username);
                    setEditUsername(d.username);
                }
            }
        };
        loadBackendProfile();
        return () => { isMounted = false; };
    }, [currentUserId]);

    // Handle Saving Updated Name & Username
    const handleSaveName = async (e) => {
        if (e) e.preventDefault();
        setNameError("");
        if (!editFirstName.trim()) {
            setNameError("First name cannot be empty.");
            return;
        }
        setIsSavingName(true);
        try {
            const res = await updateProfileNameApi({
                first_name: editFirstName.trim(),
                surname: editSurname.trim(),
                username: editUsername.trim()
            }, currentUserId);

            if (res && res.success) {
                setFirstName(res.first_name);
                setSurname(res.surname);
                setFullName(res.full_name);
                setUsername(res.username);
                setShowNameModal(false);
                setNameToast("✅ Profile name and handle updated successfully!");
                setTimeout(() => setNameToast(""), 3500);
            } else {
                setNameError(res?.message || "Could not update name. Check inputs.");
            }
        } catch (err) {
            setNameError("An error occurred while saving profile name.");
        } finally {
            setIsSavingName(false);
        }
    };

    // Helper for interest opening
    const openInterest = (type) => {
        setActiveInterestType(type);
        setShowInterests(true);
    };

    // Calculate dynamic profile completion percentage
    const calculateProfileStrength = () => {
        let score = 0;
        const total = 10;
        if (avatarImg && !avatarImg.includes("default")) score += 1;
        if (coverImg) score += 1;
        if (fullName || firstName) score += 1;
        if (bio && bio.length > 5) score += 1;
        if (categories && categories.length > 0) score += 1;
        if (location || hometown) score += 1;
        if (education || (work && work.company)) score += 1;
        if (hobbies && hobbies.length > 0) score += 1;
        if (socials && Object.values(socials).some(v => Boolean(v))) score += 1;
        if (phone || email) score += 1;
        return Math.round((score / total) * 100);
    };

    const profileStrength = calculateProfileStrength();

    return (
        <div className="ep-container">

            {/* STICKY GLASSMORPHISM HEADER */}
            <div className="ep-header">
                <button className="ep-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
                    <BsArrowLeft size={20} />
                </button>
                <div className="ep-header-center">
                    <h2>Edit Profile</h2>
                    <span className="ep-header-sub">Public Creator Identity</span>
                </div>
                <button className="ep-preview-btn" onClick={() => navigate("/profile")}>
                    <span>Preview</span>
                </button>
            </div>

            {/* MAIN CONTENT WRAPPER */}
            <div className="ep-main-wrapper">

                {/* HERO COVER & AVATAR SHOWCASE */}
                <div className="ep-hero-card">
                    <div className="ep-cover-wrapper">
                        <img src={coverImg} alt="Cover" className="ep-cover-img" />
                        <div className="ep-cover-gradient" />
                        <button className="ep-cover-cam-pill" type="button" onClick={() => setShowCoverMenu(true)} aria-label="Edit Cover Photo">
                            <BsCameraFill size={15} />
                            <span>Edit Cover</span>
                        </button>
                    </div>

                    <div className="ep-profile-identity-bar">
                        <div className="ep-avatar-stage">
                            <div className="ep-avatar-ring">
                                <img src={avatarImg} alt="Profile" className="ep-avatar-img" />
                                <button
                                    className="ep-avatar-cam-btn"
                                    type="button"
                                    onClick={() => avatarFileInputRef.current && avatarFileInputRef.current.click()}
                                    aria-label="Edit Profile Picture"
                                >
                                    <BsCameraFill size={15} />
                                </button>
                            </div>
                        </div>

                        <div className="ep-hero-info">
                            <div className="ep-hero-name-row">
                                <h3 className="ep-hero-name">{fullName || `${firstName} ${surname}`.trim() || "Nexoria Pioneer"}</h3>
                                <BsCheckCircleFill className="ep-verified-badge" title="Verified Creator" />
                            </div>
                            <div className="ep-hero-handle">@{username || "pioneer"}</div>
                            
                            <div className="ep-hero-chips">
                                {categories && categories.length > 0 && (
                                    <span className="ep-chip">✨ {categories[0]}</span>
                                )}
                                {location && (
                                    <span className="ep-chip purple">📍 {location}</span>
                                )}
                                {status && (
                                    <span className="ep-chip green">💖 {status}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* PROFILE COMPLETION STRENGTH METER */}
                <div className="ep-strength-card">
                    <div className="ep-strength-header">
                        <div className="ep-strength-title">
                            <span>⚡ Profile Completeness</span>
                            <span className="badge bg-primary rounded-pill px-2 py-1" style={{ fontSize: "0.72rem" }}>
                                {profileStrength >= 80 ? "All-Star" : "Intermediate"}
                            </span>
                        </div>
                        <span className="ep-strength-percent">{profileStrength}%</span>
                    </div>
                    <div className="ep-progress-bar-bg">
                        <div className="ep-progress-fill" style={{ width: `${profileStrength}%` }}></div>
                    </div>
                    <p className="ep-strength-tips">
                        {profileStrength < 100 
                            ? "Complete your bio, hobbies, and social handles to boost profile reach by 3.5x across Nexoria Discover."
                            : "🎉 Amazing! Your profile is 100% complete and verified for maximum discoverability."}
                    </p>
                </div>

                {/* Hidden File Inputs */}
                <input ref={coverFileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleCoverFileChange} />
                <input ref={avatarFileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarFileChange} />

                {/* Floating Toast Alert */}
                {nameToast && (
                    <div style={{
                        position: "fixed",
                        top: 20,
                        right: 20,
                        zIndex: 2000,
                        background: "#198754",
                        color: "#fff",
                        padding: "10px 18px",
                        borderRadius: "12px",
                        boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontWeight: 600,
                        fontSize: "0.9rem"
                    }}>
                        <BsCheckCircleFill size={18} />
                        <span>{nameToast}</span>
                    </div>
                )}

                {/* BODY */}
                <div className="ep-body">

                    {/* 0. NAME & IDENTITY */}
                    <Section title="Name & Identity" icon={<BsPersonFill />} gradientClass="bg-gradient-blue">
                        <Item
                            icon={<BsPersonFill />}
                            gradientClass="bg-gradient-blue"
                            mainText={<strong>{fullName || `${firstName} ${surname}`.trim() || "Add your name"}</strong>}
                            subText={username ? `@${username}` : "Tap to edit first name, surname, and username"}
                            onClick={() => {
                                setEditFirstName(firstName);
                                setEditSurname(surname);
                                setEditUsername(username);
                                setNameError("");
                                setShowNameModal(true);
                            }}
                        />
                    </Section>

                    {/* 1. INTRO & BIO */}
                    <Section title="Intro & Bio" icon={<FaCommentDots />} gradientClass="bg-gradient-purple">
                        <Item
                            icon={<span>✍️</span>}
                            gradientClass="bg-gradient-purple"
                            mainText={bio ? <span className="ep-bold">{bio}</span> : <span className="ep-muted-text">About you</span>}
                            subText={bio ? "Bio shown on public profile" : undefined}
                            privacy="Public"
                            onClick={() => setShowBioEdit(true)}
                        />
                        <Item
                            icon={<span>📌</span>}
                            gradientClass="bg-gradient-indigo"
                            mainText={<span className="ep-bold">Pinned details</span>}
                            subText={`${categories.join(" · ")} · ${location} · ${education}`}
                            onClick={() => setShowPinnedDetails(true)}
                        />
                    </Section>

                    {/* 2. CATEGORY & CREATOR TAG */}
                    <Section title="Category & Creator Mode" icon={<FaMagic />} gradientClass="bg-gradient-indigo">
                        <Item
                            icon={<FaTv size={18} />}
                            gradientClass="bg-gradient-indigo"
                            mainText={<span className="ep-bold">{categories.join(" · ")}</span>}
                            subText="Featured category badge on profile"
                            chips={categories}
                            onClick={() => setShowCategoryPage(true)}
                        />
                        <Item
                            icon={<FaMagic size={18} />}
                            gradientClass="bg-gradient-purple"
                            mainText={<span className="ep-bold">AI Creator Tag</span>}
                            subText={aiCreator === "Yes" ? "Enabled (AI Verified Creator)" : "Standard creator"}
                            onClick={() => setShowAiCreator(true)}
                        />
                    </Section>

                    {/* 3. PERSONAL DETAILS */}
                    <Section title="Personal Details" icon={<BsGeoAlt />} gradientClass="bg-gradient-blue">
                        <Item
                            icon={<BsGeoAlt size={18} />}
                            gradientClass="bg-gradient-blue"
                            mainText={<strong>{location}</strong>}
                            subText="Current City / Location"
                            privacy={locationPrivacy}
                            onClick={() => setShowLocation(true)}
                        />
                        <Item
                            icon={<FaHome size={18} />}
                            gradientClass="bg-gradient-teal"
                            mainText={<strong>{hometown}</strong>}
                            subText="Hometown"
                            privacy={hometownPrivacy}
                            onClick={() => setShowHometown(true)}
                        />
                        <Item
                            icon={<FaGraduationCap size={18} />}
                            gradientClass="bg-gradient-amber"
                            mainText={<span className="ep-bold">Studied at {education}</span>}
                            subText="College / University"
                            privacy={educationPrivacy}
                            onClick={() => setShowEducation(true)}
                        />
                        <Item
                            icon={<FaCalendarAlt size={18} />}
                            gradientClass="bg-gradient-rose"
                            mainText={<span className="ep-bold">{dob.monthDay} {dob.year}</span>}
                            subText="Birthday"
                            privacy={dob.privacy || "Friends"}
                            onClick={() => setShowDob(true)}
                        />
                        <Item
                            icon={<FaHeart size={18} />}
                            gradientClass="bg-gradient-rose"
                            mainText={status ? <span className="ep-bold">{status}</span> : <span className="ep-muted-text">Relationship status</span>}
                            subText="Relationship Status"
                            privacy={statusPrivacy}
                            onClick={() => setShowStatus(true)}
                        />
                        <Item
                            icon={<FaTree size={18} />}
                            gradientClass="bg-gradient-teal"
                            mainText={<span className={familyMembers.length > 0 || pets.length > 0 ? "ep-bold" : "ep-muted-text"}>
                                {familyMembers.length > 0 || pets.length > 0
                                    ? `${familyMembers.length} Family · ${pets.length} Pets`
                                    : "Family and Pets"}
                            </span>}
                            subText={familyMembers.length > 0 ? familyMembers.map(f => `${f.relationship}: ${f.name}`).join(" · ") : "Add family members and pets"}
                            onClick={() => setShowFamilySheet(true)}
                        />
                        <Item
                            icon={<FaMars size={18} />}
                            gradientClass="bg-gradient-indigo"
                            mainText={<span className="ep-bold">{gender} ({pronouns})</span>}
                            subText={`System Pronouns: ${systemPronoun}`}
                            privacy="Only me"
                            onClick={() => setShowGender(true)}
                        />
                        <Item
                            icon={<FaCommentDots size={18} />}
                            gradientClass="bg-gradient-blue"
                            mainText={<span className="ep-bold">{languages}</span>}
                            subText="Spoken Languages"
                            privacy={languagesPrivacy}
                            onClick={() => setShowLanguages(true)}
                        />
                    </Section>

                    {/* 4. WORK EXPERIENCE */}
                    <Section title="Work Experience" icon={<FaBriefcase />} gradientClass="bg-gradient-amber">
                        <Item
                            icon={<FaBriefcase size={18} />}
                            gradientClass="bg-gradient-amber"
                            mainText={work?.company ? <span className="ep-bold">{work.position} at {work.company}</span> : <span className="ep-muted-text">Add work experience</span>}
                            subText="Professional Career"
                            privacy={work?.privacy || "Public"}
                            onClick={() => setShowWork(true)}
                        />
                    </Section>

                    {/* 5. EDUCATION */}
                    <Section title="Education" icon={<FaSchool />} gradientClass="bg-gradient-amber">
                        <Item
                            icon={<FaSchool size={18} />}
                            gradientClass="bg-gradient-amber"
                            mainText={<span className="ep-bold">{education}</span>}
                            subText="Higher Education"
                            privacy={educationPrivacy}
                            onClick={() => setShowEducation(true)}
                        />
                    </Section>

                    {/* 6. HOBBIES & PASSIONS */}
                    <Section title="Hobbies & Passions" icon={<FaStar />} gradientClass="bg-gradient-rose">
                        <Item
                            icon={<FaStar size={18} />}
                            gradientClass="bg-gradient-rose"
                            mainText={hobbies.length > 0 ? <span className="ep-bold">{hobbies.length} Selected Hobbies</span> : <span className="ep-muted-text">Add hobbies</span>}
                            subText="Featured on Profile Header"
                            chips={hobbies}
                            onClick={() => setShowHobbies(true)}
                        />
                    </Section>

                    {/* 7. INTERESTS */}
                    <Section title="Interests & Favorites" icon={<FaMusic />} gradientClass="bg-gradient-purple">
                        <Item
                            icon={<FaMusic size={18} />}
                            gradientClass="bg-gradient-purple"
                            mainText={interests.music?.length > 0 ? <span className="ep-bold">{interests.music.join(" · ")}</span> : <span className="ep-muted-text">Music & Artists</span>}
                            chips={interests.music}
                            onClick={() => openInterest("music")}
                        />
                        <Item
                            icon={<FaTv size={18} />}
                            gradientClass="bg-gradient-indigo"
                            mainText={interests.tv?.length > 0 ? <span className="ep-bold">{interests.tv.join(" · ")}</span> : <span className="ep-muted-text">TV Shows & Series</span>}
                            chips={interests.tv}
                            onClick={() => openInterest("tv")}
                        />
                        <Item
                            icon={<FaFilm size={18} />}
                            gradientClass="bg-gradient-rose"
                            mainText={interests.films?.length > 0 ? <span className="ep-bold">{interests.films.join(" · ")}</span> : <span className="ep-muted-text">Films & Cinema</span>}
                            chips={interests.films}
                            onClick={() => openInterest("films")}
                        />
                        <Item
                            icon={<FaGamepad size={18} />}
                            gradientClass="bg-gradient-cyan"
                            mainText={interests.games?.length > 0 ? <span className="ep-bold">{interests.games.join(" · ")}</span> : <span className="ep-muted-text">Games & Esports</span>}
                            chips={interests.games}
                            onClick={() => openInterest("games")}
                        />
                        <Item
                            icon={<FaTshirt size={18} />}
                            gradientClass="bg-gradient-teal"
                            mainText={interests.sports?.length > 0 ? <span className="ep-bold">{interests.sports.join(" · ")}</span> : <span className="ep-muted-text">Sports Teams & Athletes</span>}
                            chips={interests.sports}
                            onClick={() => openInterest("sports")}
                        />
                    </Section>

                    {/* 8. TRAVEL & PLACES */}
                    <Section title="Travel & Visited Places" icon={<BsGeoAlt />} gradientClass="bg-gradient-teal">
                        <Item
                            icon={<BsGeoAlt size={18} />}
                            gradientClass="bg-gradient-teal"
                            mainText={places.length > 0 ? <span className="ep-bold">{places.length} Visited Destinations</span> : <span className="ep-muted-text">Add places visited</span>}
                            subText="Shared Travel Map"
                            chips={places}
                            onClick={() => setShowPlaces(true)}
                        />
                    </Section>

                    {/* 9. COMMUNITIES */}
                    <Section title="Communities & Groups" icon={<FaUsers />} gradientClass="bg-gradient-cyan">
                        <Item
                            icon={<FaUsers size={18} />}
                            gradientClass="bg-gradient-cyan"
                            mainText={communities.length > 0 ? <span className="ep-bold">{communities.map(c => c.name).join(" · ")}</span> : <span className="ep-muted-text">Nexoria groups</span>}
                            subText="Pinned Community Groups"
                            chips={communities.map(c => c.name)}
                            onClick={() => setShowCommunities(true)}
                        />
                    </Section>

                    {/* 10. OFFERS */}
                    <Section title="Offers & Promotions" icon={<FaPercentage />} gradientClass="bg-gradient-amber">
                        <Item
                            icon={<FaPercentage size={18} />}
                            gradientClass="bg-gradient-amber"
                            mainText={offers.length > 0 ? <span className="ep-bold">{offers.map(o => o.title).join(" · ")}</span> : <span className="ep-muted-text">Promotions, discount codes or affiliate links</span>}
                            subText={offers.length > 0 ? `${offers.length} active promotion${offers.length > 1 ? "s" : ""}` : undefined}
                            onClick={() => setShowOffers(true)}
                        />
                    </Section>

                    {/* 11. LINKS */}
                    <Section title="Custom Links" icon={<FaLink />} gradientClass="bg-gradient-blue">
                        <Item
                            icon={<FaLink size={18} />}
                            gradientClass="bg-gradient-blue"
                            mainText={links.length > 0 ? <span className="ep-bold ep-link-text">{links[0]}</span> : <span className="ep-muted-text">Add website links</span>}
                            subText="Website Portfolio Links"
                            privacy={linksPrivacy}
                            chips={links}
                            onClick={() => setShowLinks(true)}
                        />
                    </Section>

                    {/* 12. CONTACT INFO & SOCIALS */}
                    <Section title="Contact Info & Socials" icon={<FaAt />} gradientClass="bg-gradient-indigo">
                        <Item
                            icon={<FaAt size={18} />}
                            gradientClass="bg-gradient-indigo"
                            mainText={Object.keys(socials).length > 0 ? <span className="ep-bold">{Object.entries(socials).filter(([_, v]) => Boolean(v)).map(([k, v]) => `@${v}`).join(" · ")}</span> : <span className="ep-muted-text">Social media handles</span>}
                            subText="Instagram, GitHub, X/Twitter, LinkedIn"
                            onClick={() => setShowSocials(true)}
                        />
                        <Item
                            icon={<FaPhoneAlt size={18} />}
                            gradientClass="bg-gradient-teal"
                            mainText={<span className="ep-bold">{phone}</span>}
                            subText="Phone Number"
                            privacy={phonePrivacy}
                            onClick={() => setShowPhone(true)}
                        />
                        <Item
                            icon={<FaEnvelope size={18} />}
                            gradientClass="bg-gradient-rose"
                            mainText={email ? <span className="ep-bold">{email}</span> : <span className="ep-muted-text">Add email address</span>}
                            subText="Email Address"
                            privacy={emailPrivacy}
                            onClick={() => setShowEmail(true)}
                        />
                        <Item
                            icon={<FaPhotoVideo size={18} />}
                            gradientClass="bg-gradient-purple"
                            mainText={mediaKit?.title ? <span className="ep-bold">{mediaKit.title}</span> : <span className="ep-muted-text">Media kit</span>}
                            subText={mediaKit?.link ? mediaKit.link : "Creator Portfolio Kit"}
                            privacy={mediaKit?.privacy || "Public"}
                            onClick={() => setShowMediaKit(true)}
                        />
                    </Section>

                    {/* 13. BADGES & CREDENTIALS */}
                    <Section title="Badges & Trust Status" icon={<BsShieldCheck />} gradientClass="bg-gradient-blue">
                        <Item
                            icon={<BsShieldCheck size={20} />}
                            gradientClass="bg-gradient-blue"
                            mainText={<span className="ep-bold">{badges.length} Active Verified Badges</span>}
                            subText="Govt ID / Aadhaar · Pioneer Creator · TruthGuard E2E · Top Voice"
                            chips={badges}
                            onClick={() => setShowBadges(true)}
                        />
                    </Section>

                </div>
            </div>

            {/* ===== ALL MODALS & SUB-PAGES ===== */}

            {/* Cover Menu & Adjuster */}
            <CoverBottomSheet
                isOpen={showCoverMenu}
                onClose={() => setShowCoverMenu(false)}
                onSeeCover={() => { setShowCoverMenu(false); setShowFullCover(true); }}
                onUpload={() => { setShowCoverMenu(false); coverFileInputRef.current.click(); }}
                onChoose={() => { setShowCoverMenu(false); setShowChooseCover(true); }}
            />
            {showFullCover && <FullScreenCover coverImg={coverImg} onClose={() => setShowFullCover(false)} />}
            {showChooseCover && (
                <ChooseCoverPhoto
                    onClose={() => setShowChooseCover(false)}
                    onSelect={img => {
                        setCoverImg(img);
                        setUserStorageItem("cover", img, currentUserId);
                        updateCoverUrlApi(img, currentUserId);
                        window.dispatchEvent(new Event("profile-updated"));
                        setShowChooseCover(false);
                    }}
                    profilePic={avatarImg}
                />
            )}
            {dragImage && (
                <DragToAdjust
                    image={dragImage}
                    profilePic={avatarImg}
                    onSave={async (img) => {
                        setCoverImg(img);
                        setUserStorageItem("cover", img, currentUserId);
                        window.dispatchEvent(new Event("profile-updated"));
                        if (selectedCoverFile) {
                            try {
                                const uploadRes = await uploadCoverFileApi(selectedCoverFile, currentUserId);
                                if (uploadRes && uploadRes.cover_photo) {
                                    setCoverImg(uploadRes.cover_photo);
                                    setUserStorageItem("cover", uploadRes.cover_photo, currentUserId);
                                    window.dispatchEvent(new Event("profile-updated"));
                                }
                            } catch (err) {
                                updateCoverUrlApi(img, currentUserId);
                            }
                            setSelectedCoverFile(null);
                        } else {
                            updateCoverUrlApi(img, currentUserId);
                        }
                        setDragImage(null);
                    }}
                    onClose={() => { setDragImage(null); setSelectedCoverFile(null); }}
                />
            )}

            {/* Bio & Intro */}
            {showBioEdit && (
                <BioEditPage
                    initialBio={bio}
                    onClose={() => setShowBioEdit(false)}
                    onSave={b => {
                        setBio(b);
                        setUserStorageItem("bio", b, currentUserId);
                        updateBioApi({ bio: b }, currentUserId);
                        window.dispatchEvent(new Event("profile-updated"));
                        setShowBioEdit(false);
                    }}
                />
            )}
            {showPinnedDetails && (
                <PinnedDetailsPage
                    initialSelected={pinnedDetails}
                    onClose={() => setShowPinnedDetails(false)}
                    onSave={s => {
                        setPinnedDetails(s);
                        setUserStorageItem("pinned_details", s, currentUserId);
                        updatePinnedDetailsApi(s, currentUserId);
                        setShowPinnedDetails(false);
                    }}
                />
            )}

            {/* Category & AI Creator */}
            {showCategoryPage && (
                <CategoryPage
                    initialSelected={categories}
                    onClose={() => setShowCategoryPage(false)}
                    onSave={c => {
                        setCategories(c);
                        setUserStorageItem("categories", c, currentUserId);
                        updateCategoryApi({ categories: c, is_ai_creator: aiCreator === "Yes" }, currentUserId);
                        setShowCategoryPage(false);
                    }}
                />
            )}
            {showAiCreator && (
                <AiCreatorPage
                    initialValue={aiCreator}
                    onClose={() => setShowAiCreator(false)}
                    onSave={v => {
                        setAiCreator(v);
                        setUserStorageItem("ai_creator", v, currentUserId);
                        updateCategoryApi({ categories, is_ai_creator: v === "Yes" }, currentUserId);
                        setShowAiCreator(false);
                    }}
                />
            )}

            {/* Personal Details: Location, Hometown, Education, DOB, Status */}
            {showLocation && (
                <SimpleTextFieldPage
                    title="Location"
                    label="Current City"
                    initialValue={location}
                    initialPrivacy={locationPrivacy}
                    onClose={() => setShowLocation(false)}
                    onSave={(v, p) => {
                        const val = v || "Delhi, India";
                        setLocation(val);
                        setLocationPrivacy(p);
                        setUserStorageItem("location", val, currentUserId);
                        setUserStorageItem("location_privacy", p, currentUserId);
                        updatePersonalDetailsApi({ current_city: val }, currentUserId);
                        window.dispatchEvent(new Event("profile-updated"));
                        setShowLocation(false);
                    }}
                />
            )}
            {showHometown && (
                <SimpleTextFieldPage
                    title="Hometown"
                    label="Hometown"
                    initialValue={hometown}
                    initialPrivacy={hometownPrivacy}
                    onClose={() => setShowHometown(false)}
                    onSave={(v, p) => {
                        const val = v || "Deoria";
                        setHometown(val);
                        setHometownPrivacy(p);
                        setUserStorageItem("hometown", val, currentUserId);
                        setUserStorageItem("hometown_privacy", p, currentUserId);
                        updatePersonalDetailsApi({ hometown: val }, currentUserId);
                        window.dispatchEvent(new Event("profile-updated"));
                        setShowHometown(false);
                    }}
                />
            )}
            {showEducation && (
                <EducationPage
                    onClose={() => setShowEducation(false)}
                    onSave={(school, priv) => {
                        setEducation(school);
                        setEducationPrivacy(priv);
                        setUserStorageItem("education", school, currentUserId);
                        setUserStorageItem("education_privacy", priv, currentUserId);
                        updateEducationApi({ education_college: school, education_privacy: priv }, currentUserId);
                        window.dispatchEvent(new Event("profile-updated"));
                        setShowEducation(false);
                    }}
                />
            )}
            {showDob && (
                <DateOfBirthPage
                    monthDay={dob.monthDay}
                    year={dob.year}
                    initialMonthDayPrivacy={dob.privacy || "Friends"}
                    initialYearPrivacy={dob.privacy || "Friends"}
                    onClose={() => setShowDob(false)}
                    onSave={(mPriv, yPriv) => {
                        const updated = { ...dob, privacy: mPriv };
                        setDob(updated);
                        setUserStorageItem("dob", updated, currentUserId);
                        updatePersonalDetailsApi({ dob_privacy: mPriv }, currentUserId);
                        setShowDob(false);
                    }}
                />
            )}
            {showStatus && (
                <StatusPage
                    initialStatus={status}
                    initialPrivacy={statusPrivacy}
                    onClose={() => setShowStatus(false)}
                    onSave={(s, p) => {
                        setStatus(s);
                        setStatusPrivacy(p);
                        setUserStorageItem("status", s, currentUserId);
                        setUserStorageItem("status_privacy", p, currentUserId);
                        updatePersonalDetailsApi({ relationship_status: s }, currentUserId);
                        window.dispatchEvent(new Event("profile-updated"));
                        setShowStatus(false);
                    }}
                />
            )}

            {/* Family & Pets */}
            <FamilyBottomSheet
                isOpen={showFamilySheet}
                onClose={() => setShowFamilySheet(false)}
                onFamilyMember={() => { setShowFamilySheet(false); setShowFamilyMember(true); }}
                onPet={() => { setShowFamilySheet(false); setShowPet(true); }}
            />
            {showFamilyMember && (
                <FamilyMemberPage
                    onClose={() => setShowFamilyMember(false)}
                    onSave={(item) => {
                        const updated = [...familyMembers, item];
                        setFamilyMembers(updated);
                        setUserStorageItem("family", updated, currentUserId);
                        updateFamilyAndPetsApi({ family_members: updated, pets }, currentUserId);
                        setShowFamilyMember(false);
                    }}
                />
            )}
            {showPet && (
                <PetPage
                    onClose={() => setShowPet(false)}
                    onSave={(item) => {
                        const updated = [...pets, item];
                        setPets(updated);
                        setUserStorageItem("pets", updated, currentUserId);
                        updateFamilyAndPetsApi({ family_members: familyMembers, pets: updated }, currentUserId);
                        setShowPet(false);
                    }}
                />
            )}

            {/* Gender & Languages */}
            {showGender && (
                <GenderPage
                    onClose={() => setShowGender(false)}
                    onSave={({ gender: g, pronouns: pr, systemPronoun: sp }) => {
                        if (g) setGender(g);
                        if (pr) setPronouns(pr);
                        if (sp) setSystemPronoun(sp);
                        setUserStorageItem("gender", g || gender, currentUserId);
                        setUserStorageItem("pronouns", pr || pronouns, currentUserId);
                        setUserStorageItem("sys_pronoun", sp || systemPronoun, currentUserId);
                        updatePersonalDetailsApi({ gender: g, pronouns: pr }, currentUserId);
                        setShowGender(false);
                    }}
                />
            )}
            {showLanguages && (
                <LanguagesPage
                    initialValue={languages}
                    onClose={() => setShowLanguages(false)}
                    onSave={(langs, priv) => {
                        setLanguages(langs);
                        setLanguagesPrivacy(priv);
                        setUserStorageItem("languages", langs, currentUserId);
                        setUserStorageItem("languages_privacy", priv, currentUserId);
                        updatePersonalDetailsApi({ languages: langs ? langs.split(" · ") : [] }, currentUserId);
                        setShowLanguages(false);
                    }}
                />
            )}

            {/* Work */}
            {showWork && (
                <WorkPage
                    onClose={() => setShowWork(false)}
                    onSave={(workData) => {
                        setWork(workData);
                        setUserStorageItem("work", workData, currentUserId);
                        updateWorkApi({
                            work_workplace: workData.company,
                            work_job_title: workData.position,
                            work_privacy: workData.privacy
                        }, currentUserId);
                        window.dispatchEvent(new Event("profile-updated"));
                        setShowWork(false);
                    }}
                />
            )}

            {/* Hobbies */}
            {showHobbies && (
                <HobbiesModal
                    initialSelected={hobbies}
                    onClose={() => setShowHobbies(false)}
                    onSave={(newHobbies) => {
                        setHobbies(newHobbies);
                        setUserStorageItem("hobbies", newHobbies, currentUserId);
                        updateHobbiesApi(newHobbies, currentUserId);
                    }}
                />
            )}

            {/* Interests */}
            {showInterests && (
                <InterestsModal
                    initialType={activeInterestType}
                    initialData={interests}
                    onClose={() => setShowInterests(false)}
                    onSave={(newInterests) => {
                        setInterests(newInterests);
                        setUserStorageItem("interests", newInterests, currentUserId);
                        updateInterestsApi(newInterests, currentUserId);
                    }}
                />
            )}

            {/* Places / Travel */}
            {showPlaces && (
                <PlacesModal
                    initialPlaces={places}
                    onClose={() => setShowPlaces(false)}
                    onSave={(newPlaces) => {
                        setPlaces(newPlaces);
                        setUserStorageItem("places", newPlaces, currentUserId);
                        updatePlacesApi({ visited_places: newPlaces }, currentUserId);
                    }}
                />
            )}

            {/* Communities */}
            {showCommunities && (
                <CommunitiesPage
                    initialSelected={communities.map(c => c.id)}
                    onClose={() => setShowCommunities(false)}
                    onSave={(selectedGroups) => {
                        setCommunities(selectedGroups);
                        setUserStorageItem("communities", selectedGroups, currentUserId);
                        updateCommunitiesApi(selectedGroups, currentUserId);
                    }}
                />
            )}

            {/* Offers */}
            {showOffers && (
                <OffersModal
                    initialOffers={offers}
                    onClose={() => setShowOffers(false)}
                    onSave={(newOffers) => {
                        setOffers(newOffers);
                        setUserStorageItem("offers", newOffers, currentUserId);
                        updateOffersApi(newOffers, currentUserId);
                    }}
                />
            )}

            {/* Links */}
            {showLinks && (
                <LinksPage
                    initialLinks={links}
                    initialPrivacy={linksPrivacy}
                    onClose={() => setShowLinks(false)}
                    onSave={(newLinks, priv) => {
                        setLinks(newLinks);
                        setLinksPrivacy(priv);
                        setUserStorageItem("links", newLinks, currentUserId);
                        setUserStorageItem("links_privacy", priv, currentUserId);
                        updateSocialsApi({ custom_links: newLinks }, currentUserId);
                        setShowLinks(false);
                    }}
                />
            )}

            {/* Social Handles */}
            {showSocials && (
                <SocialLinksModal
                    initialSocials={socials}
                    onClose={() => setShowSocials(false)}
                    onSave={(newSocials) => {
                        setSocials(newSocials);
                        setUserStorageItem("socials", newSocials, currentUserId);
                        updateSocialsApi({ social_handles: newSocials }, currentUserId);
                    }}
                />
            )}

            {/* Contact Info: Phone, Email, Media Kit */}
            {showPhone && (
                <PhonePage
                    onClose={() => setShowPhone(false)}
                    onSave={(ph, priv) => {
                        setPhone(ph);
                        setPhonePrivacy(priv);
                        setUserStorageItem("phone", ph, currentUserId);
                        setUserStorageItem("phone_privacy", priv, currentUserId);
                        updateSocialsApi({ contact_phone: ph, contact_privacy: priv }, currentUserId);
                        setShowPhone(false);
                    }}
                />
            )}
            {showEmail && (
                <EmailPage
                    onClose={() => setShowEmail(false)}
                    onSave={(em, priv) => {
                        setEmail(em);
                        setEmailPrivacy(priv);
                        setUserStorageItem("email", em, currentUserId);
                        setUserStorageItem("email_privacy", priv, currentUserId);
                        updateSocialsApi({ contact_email: em, contact_privacy: priv }, currentUserId);
                        setShowEmail(false);
                    }}
                />
            )}
            {showMediaKit && (
                <MediaKitPage
                    onClose={() => setShowMediaKit(false)}
                    onSave={(mk) => {
                        setMediaKit(mk);
                        setUserStorageItem("media_kit", mk, currentUserId);
                        updateMediaKitApi({
                            media_kit_title: mk.title,
                            media_kit_link: mk.link,
                            media_kit_privacy: mk.privacy
                        }, currentUserId);
                        setShowMediaKit(false);
                    }}
                />
            )}

            {/* Badges */}
            {showBadges && (
                <BadgesModal
                    initialBadges={badges}
                    onClose={() => setShowBadges(false)}
                    onSave={(newBadges) => {
                        setBadges(newBadges);
                        setUserStorageItem("badges", newBadges, currentUserId);
                        updateBadgesApi({ badges: newBadges }, currentUserId);
                    }}
                />
            )}

            {/* NAME & USERNAME EDIT MODAL */}
            {showNameModal && (
                <div className="stf-overlay" onClick={() => setShowNameModal(false)}>
                    <div className="stf-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
                        <div className="stf-header">
                            <button className="stf-close" onClick={() => setShowNameModal(false)} aria-label="Close">✕</button>
                            <h2>Edit Name & Handle</h2>
                            <div style={{ width: 24 }}></div>
                        </div>

                        <form onSubmit={handleSaveName}>
                            <div className="stf-body">
                                <p className="text-muted small mb-3">
                                    Your name and handle help friends and creators identify and tag you across Nexoria.
                                </p>

                                {nameError && (
                                    <div className="alert alert-danger py-2 small mb-3">
                                        {nameError}
                                    </div>
                                )}

                                <div className="stf-input-wrap mb-3">
                                    <span className="stf-floating-label">First name *</span>
                                    <input
                                        type="text"
                                        className="stf-input"
                                        value={editFirstName}
                                        onChange={(e) => setEditFirstName(e.target.value)}
                                        placeholder="e.g. John"
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div className="stf-input-wrap mb-3">
                                    <span className="stf-floating-label">Surname / Last name</span>
                                    <input
                                        type="text"
                                        className="stf-input"
                                        value={editSurname}
                                        onChange={(e) => setEditSurname(e.target.value)}
                                        placeholder="e.g. Doe"
                                    />
                                </div>

                                <div className="stf-input-wrap mb-3">
                                    <span className="stf-floating-label">Username / Handle (@)</span>
                                    <input
                                        type="text"
                                        className="stf-input"
                                        value={editUsername}
                                        onChange={(e) => setEditUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                                        placeholder="e.g. johndoe"
                                    />
                                    <small className="text-muted mt-1 d-block" style={{ fontSize: "0.75rem" }}>
                                        Public profile link: nexoria.io/@{editUsername || "username"}
                                    </small>
                                </div>
                            </div>

                            <div className="stf-footer" style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary rounded-pill px-4"
                                    onClick={() => setShowNameModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="stf-save-btn"
                                    disabled={isSavingName || !editFirstName.trim()}
                                >
                                    {isSavingName ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

export default EditProfile;