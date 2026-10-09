import re
import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from models.user import User
from models.support import AccountHealth


MODE_PROMPTS = {
    "general": [
        {"text": "How does Nexoria's 0-Algorithm Chrono feed work?", "tag": "Algorithm"},
        {"text": "Check my account standing and security rating 🛡️", "tag": "Security"},
        {"text": "How do I earn with Stars & Creator Subscriptions? 💎", "tag": "Earnings"},
        {"text": "Explain TruthGuard AI™ fake news verification 🧠", "tag": "Safety"}
    ],
    "creative": [
        {"text": "Write a high-converting post about AI & future tech 🚀", "tag": "Viral"},
        {"text": "Generate 5 viral video ideas for Nexoria Reels 🎬", "tag": "Video"},
        {"text": "Draft an engaging storytelling caption about travel 🌍", "tag": "Caption"},
        {"text": "Create a launch announcement for a new digital product 📦", "tag": "Launch"}
    ],
    "coder": [
        {"text": "Write a FastAPI async endpoint with Pydantic validation ⚡", "tag": "FastAPI"},
        {"text": "Create a modern React custom hook for WebSocket live chat ⚛️", "tag": "React"},
        {"text": "Write a SQL query to calculate user retention and churn 📊", "tag": "SQL"},
        {"text": "Explain the difference between JWT access & refresh tokens 🔒", "tag": "Auth"}
    ],
    "translator": [
        {"text": "Translate 'Welcome to the future of social connection' to 5 languages 🌐", "tag": "Translate"},
        {"text": "Translate this post into formal business Spanish and Japanese 🇯🇵", "tag": "Business"},
        {"text": "Convert this caption into conversational Hindi with English script 🇮🇳", "tag": "Hindi"},
        {"text": "Translate into French, German, Arabic and Portuguese 🌍", "tag": "Global"}
    ]
}


def detect_language(text: str) -> str:
    """
    Detect whether text is Hindi (Devanagari), Hinglish (Romanized Hindi), or English.
    """
    if re.search(r'[\u0900-\u097F]', text):
        return "hindi"

    lower = text.lower()
    hinglish_words = [
        "kaise", "kase", "kya", "karna", "karo", "kare", "karege", "karega", "mera", "meri", "mere",
        "mujhe", "batao", "bata", "bataiye", "paise", "paisa", "kaha", "kahan", "hai", "hain",
        "hoga", "hogi", "badle", "badalna", "bheje", "bhejna", "chahiye", "kuch", "puchi", "pooche",
        "apna", "apne", "apni", "kaam", "karta", "karti", "dekhna", "dekhe", "seekho", "sikhao",
        "kab", "milta", "milega", "karu", "karun", "kar", "rakha", "rakhe", "dikh", "dikhao",
        "sahi", "nahi", "nhi", "kyu", "kyun", "wala", "wali", "wale", "ye", "yeh", "wo", "woh",
        "isko", "usko", "jode", "jodna", "dale", "dalna", "lagaye", "lagana", "hatao", "hatana",
        "logout", "signout", "login", "profile", "feed", "reels", "setting", "kamaye", "kamao"
    ]

    tokens = re.findall(r'\b[a-zA-Z0-9]+\b', lower)
    hinglish_match_count = sum(1 for t in tokens if t in hinglish_words)

    if hinglish_match_count >= 1:
        return "hinglish"

    return "english"


def get_mode_suggestions(mode: str) -> List[Dict[str, str]]:
    """Retrieve mode-specific suggested prompt chips."""
    return MODE_PROMPTS.get(mode, MODE_PROMPTS["general"])


def has_any(text: str, keywords: List[str]) -> bool:
    """Check if text contains any of the given keywords or substrings."""
    lower = text.lower()
    return any(kw.lower() in lower for kw in keywords)


def generate_ai_response(
    message: str,
    mode: str = "general",
    user_id: Optional[int] = None,
    user_name: Optional[str] = None,
    history: Optional[List[Dict[str, Any]]] = None,
    db: Optional[Session] = None
) -> Dict[str, Any]:
    """
    Universal Knowledge & Multi-Lingual Intelligence Engine for Nexoria Quantum AI 2.0.
    Provides complete, encyclopedic step-by-step guidance across EVERY component, button,
    setting, and feature of the Nexoria Social Platform in Hindi, Hinglish, and English.
    """
    cleaned = message.strip()
    lang = detect_language(cleaned)
    now_str = datetime.datetime.now().strftime("%I:%M %p")

    # Resolve User Context
    display_name = user_name or ("User" if lang == "english" else "Creator")
    user_health_score = 100
    user_standing = "Good Standing"

    if db and user_id:
        try:
            usr = db.query(User).filter(User.id == user_id).first()
            if usr and usr.first_name:
                display_name = usr.first_name
            health = db.query(AccountHealth).filter(AccountHealth.user_id == user_id).first()
            if health:
                user_health_score = health.health_score
                user_standing = f"Score {health.health_score}% · {health.security_rating.capitalize()}"
        except Exception:
            pass

    suggested_replies = []
    reply = ""

    # =========================================================================
    # 1. LOGOUT & SIGN OUT (लॉगआउट / बाहर निकलना)
    # =========================================================================
    if has_any(cleaned, [
        "logout", "log out", "signout", "sign out", "bahar kaise", "bahar nikalna",
        "लॉगआउट", "लॉग आउट", "साइन आउट", "साइनआउट", "बाहर कैसे", "अकाउंट लॉगआउट",
        "account logout", "session end", "exit", "logout kase", "logout kaise", "logout kaise kare"
    ]):
        if lang == "hindi":
            reply = (
                f"🚪 **नेक्सोरिया से लॉगआउट (Log Out) करने का तरीका ({display_name})**:\n\n"
                "1. स्क्रीन के टॉप-लेफ्ट में दिए गए **Sidebar / Menu Icon** पर क्लिक करके साइडबार खोलें।\n"
                "2. साइडबार में सबसे नीचे (Bottom) स्क्रॉल करें।\n"
                "3. लाल/ग्रे रंग के **'Log Out'** बटन पर क्लिक करें।\n"
                "4. आपका एक्टिव ऑथेंटिकेशन टोकन (`access_token`) सुरक्षित रूप से क्लियर हो जाएगा और आप लॉगिन स्क्रीन पर रीडायरेक्ट हो जाएंगे।\n\n"
                "🔒 **सुरक्षा टिप**: पब्लिक या शेयर किए गए डिवाइस पर इस्तेमाल करने के बाद हमेशा लॉगआउट करें।"
            )
            suggested_replies = ["पासवर्ड कैसे बदलें? 🔑", "2FA सिक्योरिटी कैसे लगाएं? 🔒", "एक्टिव सेशन्स कैसे देखें? 📱"]
        elif lang == "hinglish":
            reply = (
                f"🚪 **Nexoria se Logout karne ka Simple Tarika ({display_name} ke liye)**:\n\n"
                "1. Top-left corner me **Sidebar Menu** icon par click karke Sidebar open karein.\n"
                "2. Sidebar me sabse neeche (bottom) tak scroll karein.\n"
                "3. Wahan **'Log Out'** button par click karein.\n"
                "4. Aapka session token aur storage clear ho kar aap turant Login screen par chale jayenge.\n\n"
                "🔒 **Security Note**: Public ya shared device use karne ke baad hamesha logout karein."
            )
            suggested_replies = ["Password kaise change kare? 🔑", "2FA security kaise lagaye? 🔒", "Active login devices kaise check kare? 📱"]
        else:
            reply = (
                f"🚪 **How to Log Out of Nexoria ({display_name})**:\n\n"
                "1. Open the navigation **Sidebar** from the top-left menu icon.\n"
                "2. Scroll to the very bottom of the sidebar drawer.\n"
                "3. Click the **'Log Out'** button.\n"
                "4. Your authentication tokens (`access_token` & session memory) will be safely purged, redirecting you to the Login screen.\n\n"
                "💡 You can log back in securely at any time using your credentials."
            )
            suggested_replies = ["How to change password? 🔑", "How to enable 2FA? 🔒", "How to view active login sessions? 📱"]

    # =========================================================================
    # 2. HOBBIES & INTERESTS (हॉबीज और इंटरेस्ट्स)
    # =========================================================================
    elif has_any(cleaned, [
        "hobbi", "hobby", "hobbies", "interest", "interests",
        "हॉबी", "हॉबीज", "शौक", "पसंद", "रुचि", "इंटरेस्ट", "इंटरेस्ट्स", "हॉबीज और इंटरेस्ट्स",
        "music interest", "sports interest", "gaming interest", "hobbies kaise", "interest kaise"
    ]):
        if lang == "hindi":
            reply = (
                f"🎨 **प्रोफाइल में हॉबीज और इंटरेस्ट्स जोड़ने का तरीका ({display_name})**:\n\n"
                "आप अपनी प्रोफाइल में हॉबीज और इंटरेस्ट्स बहुत आसानी से जोड़ सकते हैं:\n\n"
                "1. **Edit Profile खोलें**: अपनी **Profile** पेज पर जाएं और **'Edit Profile'** बटन पर क्लिक करें।\n"
                "2. **Hobbies सेक्शन**: नीचे स्क्रॉल करके **'Hobbies'** सेक्शन में जाएं और **Edit** पर क्लिक करें। यहाँ 20+ प्रीसेट हॉबीज (जैसे Photography, Gaming, Traveling, Reading, Cooking आदि) में से अपनी पसंद चुनें या सर्च बार से खोजें।\n"
                "3. **Interests सेक्शन**: हॉबीज के ठीक नीचे **'Interests'** सेक्शन पर क्लिक करें। यहाँ 5 अलग-अलग कैटेगरी टैब्स हैं:\n"
                "   - 🎵 **Music** (पसंदीदा कलाकार और शैलियाँ)\n"
                "   - 🎬 **Films / Movies**\n"
                "   - 📺 **TV Programmes / Shows**\n"
                "   - 🎮 **Video Games**\n"
                "   - ⚽ **Sports Teams**\n"
                "4. अपने पसंदीदा आइटम्स सेलेक्ट करें और **'Save'** पर क्लिक करें। यह तुरंत आपकी प्रोफाइल पर लाइव दिखने लगेगा!"
            )
            suggested_replies = ["बायो और पिन्ड टैग्स कैसे जोड़ें? ✍️", "घूमी हुई जगहें (Visited Places) कैसे जोड़ें? 🌍", "वेरिफाइड बैज कैसे लगाएं? ✓"]
        elif lang == "hinglish":
            reply = (
                f"🎨 **Profile me Hobbies aur Interests add karne ka Step-by-Step Guide ({display_name} ke liye)**:\n\n"
                "1. **Edit Profile open karein**: Apni **Profile** page par jaakar **'Edit Profile'** button tap karein.\n"
                "2. **Hobbies Modal**: Scroll karke **'Hobbies'** section me **Edit** dabayein. Wahan 20+ ready-made hobby chips (Gaming, Travel, Music, Fitness, Cooking etc.) me se select karein ya search karke custom hobby add karein.\n"
                "3. **Interests Modal**: Hobbies ke niche **'Interests'** section par click karein. Isme 5 dynamic tabs milte hain:\n"
                "   - 🎵 **Music**\n"
                "   - 🎬 **Films**\n"
                "   - 📺 **TV programmes**\n"
                "   - 🎮 **Games**\n"
                "   - ⚽ **Sports teams**\n"
                "4. Apne pasandeeda interests select karke **'Save'** karein. Data instant database me sync ho jayega!"
            )
            suggested_replies = ["Bio aur pinned tags kaise set kare? ✍️", "Visited Places kaise add kare? 🌍", "Verified badges kaise lagaye? ✓"]
        else:
            reply = (
                f"🎨 **How to Add Hobbies & Interests on Nexoria ({display_name})**:\n\n"
                "1. Navigate to your **Profile** and click **'Edit Profile'**.\n"
                "2. **Hobbies Section**: Scroll to **'Hobbies'** and click **Edit**. Choose from 20+ preset popular hobbies (Photography, Gaming, Travel, Fitness, Coding) or use the search filter.\n"
                "3. **Interests Section**: Click **'Interests'** to open the multi-tab selector:\n"
                "   - 🎵 **Music**\n"
                "   - 🎬 **Films**\n"
                "   - 📺 **TV programmes**\n"
                "   - 🎮 **Games**\n"
                "   - ⚽ **Sports teams**\n"
                "4. Select your favorites and click **'Save'** to update your public profile instantly!"
            )
            suggested_replies = ["How to update bio & pinned details? ✍️", "How to add visited places? 🌍", "How to get verified badges? ✓"]

    # =========================================================================
    # 3. PROFILE PICTURE & COVER PHOTO (अवतार और कवर फोटो)
    # =========================================================================
    elif has_any(cleaned, [
        "profile pic", "profile photo", "avatar", "cover photo", "cover pic", "cover", "dp",
        "photo", "pic", "image", "तस्वीर", "प्रोफाइल फोटो", "कवर फोटो", "डीपी", "फोटो बदले",
        "photo kaise change", "photo kaise lagaye", "cover kaise", "drag adjust", "drag to adjust",
        "fullscreen cover", "full cover"
    ]):
        if lang == "hindi":
            reply = (
                f"🖼️ **प्रोफाइल फोटो और कवर फोटो बदलने व एडजस्ट करने का तरीका ({display_name})**:\n\n"
                "1. **प्रोफाइल फोटो (Avatar)**: अपनी **Profile** पेज पर जाएं। अवतार पर दिए गए **Camera Icon** पर क्लिक करें और नई फोटो अपलोड करें।\n"
                "2. **कवर फोटो (Cover Photo)**: कवर एरिया के कोने में दिए गए **Camera Icon** पर क्लिक करें:\n"
                "   - **Select Photo**: नई इमेज अपलोड करें।\n"
                "   - **Drag to Adjust**: फोटो की वर्टिकल पोजीशन को ड्रैग करके परफेक्ट सेट करें।\n"
                "   - **View Full Screen**: कवर फोटो को फुल स्क्रीन प्रीव्यू में देखें।\n"
                "3. **सेव करें**: पोजीशन सेट करने के बाद **'Save'** दबाएं।\n\n"
                "🔒 **सुरक्षा**: आपकी फोटो डेटाबेस में केवल आपकी यूजर आईडी के साथ आइसोलेटेड रूप से स्टोर होती है।"
            )
            suggested_replies = ["हॉबीज और इंटरेस्ट्स कैसे जोड़ें? 🎨", "बायो कैसे अपडेट करें? ✍️", "वेरिफाइड बैज कैसे लगाएं? ✓"]
        elif lang == "hinglish":
            reply = (
                f"🖼️ **Profile Picture aur Cover Photo update karne ka Tarika ({display_name})**:\n\n"
                "1. **Profile Avatar**: Profile page par avatar ke upar bane **Camera Icon** par click karke nayi image select karein.\n"
                "2. **Cover Photo**: Cover photo ke corner me **Camera Icon** dabayein:\n"
                "   - **Upload Photo**: Nayi cover image choose karein.\n"
                "   - **Drag to Adjust**: Cover image ko upar/neeche drag karke perfect fit adjust karein.\n"
                "   - **Full Screen Preview**: Full cover view check karein.\n"
                "3. **Save**: Save button dabayein. Image instant backend API aur database me store ho jayegi!"
            )
            suggested_replies = ["Hobbies & Interests kaise add kare? 🎨", "Bio kaise likhein? ✍️", "Verified badge kaise lagaye? ✓"]
        else:
            reply = (
                f"🖼️ **How to Update Profile Avatar & Cover Photo ({display_name})**:\n\n"
                "1. **Profile Avatar**: Go to your **Profile** and click the **Camera Icon** over your avatar to upload a new picture.\n"
                "2. **Cover Photo**: Click the **Camera Icon** on your banner:\n"
                "   - Upload your new banner image.\n"
                "   - Use **Drag to Adjust** to align vertical positioning.\n"
                "   - Preview using **View Full Screen**.\n"
                "3. Click **Save** to persist changes directly to the database."
            )
            suggested_replies = ["How to add hobbies & interests? 🎨", "How to edit bio? ✍️", "How to get verified badges? ✓"]

    # =========================================================================
    # 4. GHOST / ANONYMOUS MODE & EXPIRING POSTS (घोस्ट मोड और एक्सपायरिंग पोस्ट्स)
    # =========================================================================
    elif has_any(cleaned, [
        "ghost", "anonymous", "gupt", "gumnaam", "expire", "expiring", "timer", "ghost mode",
        "घोस्ट", "घोस्ट मोड", "गुमनाम", "एक्सपायर", "ऑटो डिलीट", "गुप्त पोस्ट"
    ]):
        if lang == "hindi":
            reply = (
                f"👻 **नेक्सोरिया घोस्ट मोड और ऑटो-एक्सपायरिंग पोस्ट्स गाइड ({display_name})**:\n\n"
                "1. 👻 **घोस्ट / एनॉनिमस मोड क्या है?**:\n"
                "   - Create Post modal खोलें और **'Ghost / Anonymous Mode'** का टॉगल ऑन करें।\n"
                "   - आपकी असली प्रोफाइल और नाम पूरी तरह छुप जाएगा।\n"
                "   - सिस्टम आपको एक प्रोसीजरल बॉट अवतार और रैंडम स्यूडोनेम (जैसे `ShadowRunner-924`) देगा।\n"
                "   - घोस्ट पोस्ट पर पर्पल ऑरा ग्लो और प्राइवेसी शील्ड बैज दिखाई देता है।\n\n"
                "2. ⏳ **ऑटो-एक्सपायरिंग टाइमर**:\n"
                "   - पोस्ट बनाते समय **24 Hours**, **7 Days**, या **Permanent** का लाइफस्पैन सेट करें।\n"
                "   - टाइम पूरा होते ही पोस्ट ऑटोमैटिकली डेटाबेस और फीड से डिलीट हो जाएगी।"
            )
            suggested_replies = ["E2E एन्क्रिप्टेड चैट्स कैसे काम करती हैं? 🔒", "0-एल्गोरिदम फीड क्या है? ⏱️", "पोस्ट कैसे बनाएं? ✍️"]
        elif lang == "hinglish":
            reply = (
                f"👻 **Nexoria Ghost Mode & Auto-Expiring Posts Guide ({display_name})**:\n\n"
                "1. 👻 **Ghost / Anonymous Discussion Mode**:\n"
                "   - Home feed par Create Post box open karein aur **'Ghost Mode'** switch on karein.\n"
                "   - Aapka real name aur avatar hide ho jayega aur masked avatar + pseudo-handle (e.g. `ShadowRunner-924`) se post live hogi.\n"
                "   - Ghost post par distinct purple aura effect aur privacy badge show hota hai.\n\n"
                "2. ⏳ **Auto-Expiring Post Timer**:\n"
                "   - Post create karte waqt **24 Hours** ya **7 Days** ka countdown timer select karein.\n"
                "   - Timer expire hote hi post automatically permanently purge ho jayegi."
            )
            suggested_replies = ["E2E encrypted chat kaise kaam karti hai? 🔒", "0-Algorithm Chrono feed kya hai? ⏱️", "Post create kaise kare? ✍️"]
        else:
            reply = (
                f"👻 **Nexoria Ghost Mode & Auto-Expiring Posts for {display_name}**:\n\n"
                "1. 👻 **Ghost / Anonymous Mode**:\n"
                "   - Toggle **'Ghost Mode'** in the Create Post modal.\n"
                "   - Masks your identity using procedural Bottts avatars and pseudo-handles (e.g., `ShadowRunner-924`).\n"
                "   - Disables profile click tracking and renders with a glowing purple aura.\n\n"
                "2. ⏳ **Auto-Expiring Posts**:\n"
                "   - Choose a 24-hour, 7-day, or permanent lifespan.\n"
                "   - Features live countdown badges and automatic garbage collection upon expiry."
            )
            suggested_replies = ["How does E2E chat encryption work? 🔒", "Explain 0-Algorithm Chrono feed ⏱️", "How to create a post? ✍️"]

    # =========================================================================
    # 5. CREATOR MONETISATION, STARS, REELS & PAYOUTS (कमाई और पेआउट)
    # =========================================================================
    elif has_any(cleaned, [
        "money", "earn", "monetiz", "monetis", "kamaye", "kama", "kamana", "paisa", "paise",
        "payout", "star", "stars", "subscription", "bonus", "revenue", "tip", "upi", "bank",
        "पैसे", "कमाई", "पेआउट", "स्टार्स", "सब्सक्रिप्शन", "पैसे कैसे कमाए", "reels se paise",
        "creator vault", "wallet", "वॉलेट", "पैसे निकालना"
    ]):
        if lang == "hindi":
            reply = (
                f"💎 **नेक्सोरिया क्रिएटर मोनेटाइजेशन और कमाई की पूरी गाइड ({display_name})**:\n\n"
                "नेक्सोरिया पर क्रिएटर्स को **0% प्लेटफॉर्म फीस** और **90% वीडियो रेवेन्यू शेयर** मिलता है!\n\n"
                "🔥 **4 इनकम सोर्सेस (Revenue Streams)**:\n"
                "1. ⭐ **Stars on Reels & Live**: दर्शक रील्स और लाइव पर आपको स्टार्स भेजते हैं (1 Star = ₹1 / $0.01)।\n"
                "2. 💎 **सपोर्टर सब्सक्रिप्शन्स**: एक्सक्लूसिव बैज और प्राइवेट कम्युनिटी के लिए मंथली फीस।\n"
                "3. 🎬 **इन-स्ट्रीम वीडियो एड्स**: 45+ सेकंड के वीडियोज पर व्यूज के हिसाब से 90% एड रेवेन्यू।\n"
                "4. 🔥 **रील्स क्रिएटर बोनस**: वायरल रील्स के माइलस्टोन्स पूरा करने पर हर महीने कैश बोनस।\n\n"
                "💳 **पेआउट कब मिलता है?**: हर महीने की **21 तारीख** को आपके बैंक अकाउंट (Wire Transfer) या PayPal में ऑटोमैटिकली ट्रांसफर हो जाता है।"
            )
            suggested_replies = ["मोनेटाइजेशन हब कैसे खोलें? 📊", "स्टार्स कैसे इनेबल करें? ⭐", "रील्स वायरल करने के टिप्स 🎬"]
        elif lang == "hinglish":
            reply = (
                f"💎 **Nexoria Creator Monetisation & Earning Complete Guide ({display_name})**:\n\n"
                "Nexoria creators ko 0% commission micro-tipping aur 90% video ad revenue deta hai:\n\n"
                "🔥 **4 Earning Methods**:\n"
                "1. ⭐ **Stars on Reels & Live**: Viewers direct Stars donate karte hain (1 Star = ₹1), 100% creator ko milta hai.\n"
                "2. 💎 **Supporter Subscriptions**: Monthly recurring membership for exclusive badges.\n"
                "3. 🎬 **In-Stream Video Ads**: 90% revenue distribution on monetised views.\n"
                "4. 🔥 **Reels Creator Bonus**: Viral retention target hit karne par monthly bounty bonuses.\n\n"
                "💳 **Payout Schedule**: Har month ki **21st date** ko direct linked Bank Account ya PayPal me payout credit hota hai."
            )
            suggested_replies = ["Monetisation hub kaise check kare? 📊", "Stars feature kaise enable kare? ⭐", "Reels viral kaise kare? 🎬"]
        else:
            reply = (
                f"💎 **Nexoria Creator Monetisation & Payout Masterclass ({display_name})**:\n\n"
                "Nexoria offers **0% platform fee micro-tipping** and **90% creator revenue share** on video ads!\n\n"
                "🔥 **4 Revenue Streams**:\n"
                "1. ⭐ **Stars on Reels & Live**: Direct viewer tips (1 Star = $0.01 / ₹1).\n"
                "2. 💎 **Supporter Subscriptions**: Monthly recurring memberships.\n"
                "3. 🎬 **In-Stream Video Ads**: 90% creator revenue share on eligible video views.\n"
                "4. 🔥 **Reels Creator Bonus**: Milestone bounties for viral retention.\n\n"
                "💳 **Payout Schedule**: Processed on the 21st of every month to your linked Bank Account or PayPal."
            )
            suggested_replies = ["How to check monetisation hub? 📊", "How to enable Stars? ⭐", "Tips to create viral reels 🎬"]

    # =========================================================================
    # 6. FEED & TRUTHGUARD AI™ (0-एल्गोरिदम और फेक न्यूज शील्ड)
    # =========================================================================
    elif has_any(cleaned, [
        "feed", "algorithm", "chrono", "truthguard", "fake news", "fact check", "spam",
        "digest", "catch up", "toxicity", "ranking", "shadowban", "reach",
        "फीड", "एल्गोरिदम", "ट्रुथगार्ड", "फेक न्यूज", "कैच अप", "feed kaise", "truthguard kya"
    ]):
        if lang == "hindi":
            reply = (
                f"🧠 **नेक्सोरिया 0-एल्गोरिदम फीड और TruthGuard AI™ सिस्टम ({display_name})**:\n\n"
                "1. ⏱️ **0-एल्गोरिदम क्रोनोलॉजिकल फीड**: बिना किसी सीक्रेट एल्गोरिदम के टाइमस्टैम्प अनुसार सीधी फीड। आपके हर फॉलोअर को आपकी पोस्ट बिना रीच सप्रेशन के दिखाई देती है।\n"
                "2. 🧠 **AI स्मार्ट फीड**: उच्च-एंगेजमेंट और ऑथेंटिक बातचीत वाली पोस्ट्स को प्राथमिकता देता है।\n"
                "3. 👥 **फ्रेंड्स ओनली फीड**: केवल आपके क्लोज़ फ्रेंड्स की पोस्ट्स दिखाता है।\n"
                "4. 🛡️ **TruthGuard AI™**: पोस्ट्स पर 99.8% फेक न्यूज़ ऑडिट चिप और कम्युनिटी ट्रस्ट स्कोर दिखाता है।\n"
                "5. ⚡ **2-Min AI Catch-Up**: पूरे दिन के टॉप अपडेट्स को 2 मिनट में बुलेट पॉइंट्स में समराइज़ करता है।"
            )
            suggested_replies = ["फीड कैसे बदलें? ⏱️", "ट्रुथगार्ड स्कोर कैसे देखें? 🛡️", "पोस्ट रीच कैसे बढ़ाएं? 🚀"]
        elif lang == "hinglish":
            reply = (
                f"🧠 **Nexoria 0-Algorithm Chrono Feed & TruthGuard AI ({display_name})**:\n\n"
                "1. ⏱️ **0-Algorithm Chrono Mode**: Strictly chronological order. Follower reach 100% unsuppressed rehti hai bina kisi shadow-ranking ke.\n"
                "2. 🧠 **AI Smart Mode**: Authentic discussions aur real community engagement ko priority deta hai.\n"
                "3. 👥 **Friends Only**: Sirf mutual friends ki posts filter karke dikhata hai.\n"
                "4. 🛡️ **TruthGuard AI™**: Misinformation ko flag karta hai aur 99.8% authentic fact-check audit breakdown deta hai.\n"
                "5. ⚡ **2-Min AI Catch-Up**: Network updates ko instant 2-minute bullet digest me summarize karta hai."
            )
            suggested_replies = ["Feed switch kaise kare? ⏱️", "TruthGuard score kaise check kare? 🛡️", "Post reach kaise badhaye? 🚀"]
        else:
            reply = (
                f"🧠 **Nexoria 0-Algorithm Chrono Feed & TruthGuard AI™ ({display_name})**:\n\n"
                "1. ⏱️ **Zero-Algorithm Chrono**: Timestamp-based delivery ensuring 100% unsuppressed follower reach.\n"
                "2. 🧠 **AI Smart Feed**: Signals authentic creator engagement and quality discussions.\n"
                "3. 👥 **Friends Only**: Clean feed strictly scoped to mutual connections.\n"
                "4. 🛡️ **TruthGuard AI™**: 99.8% authentic verification badge with transparent audit consensus.\n"
                "5. ⚡ **2-Min AI Digest**: Quick bullet summaries of network activities."
            )
            suggested_replies = ["How to switch feeds? ⏱️", "How does TruthGuard work? 🛡️", "How to increase post reach? 🚀"]

    # =========================================================================
    # 7. AUDIO LOUNGE, PULSE & WATCH PARTY (ऑडियो लाउंज और वॉच पार्टी)
    # =========================================================================
    elif has_any(cleaned, [
        "audio lounge", "hangout", "pulse lounge", "voice room", "watch party", "zen audio",
        "zen sound", "ambient", "ऑडियो लाउंज", "वॉच पार्टी", "वॉयस रूम", "जेन ऑडियो", "soundscape"
    ]):
        if lang == "hindi":
            reply = (
                f"🎙️ **नेक्सोरिया ऑडियो लाउंज, पल्स रूम और वॉच पार्टी ({display_name})**:\n\n"
                "1. 🎙️ **Micro-Community Audio Lounge**: क्लबहाउस/डिस्कॉर्ड स्टाइल वॉइस लाउंज जिसमें Mute, Raise Hand, और Speaker Stages उपलब्ध हैं।\n"
                "2. 🍿 **Watch Party Lounge**: अपने दोस्तों के साथ सिंक्रोनाइज़्ड वीडियो देखें और रियल-टाइम ग्रुप चैट करें।\n"
                "3. 🍃 **Zen Audio & Ambient Soundscapes**: Rain, Forest, Coffee Shop, और White Noise के साथ फोकस मोड में सोशल ब्राउज़िंग करें।"
            )
            suggested_replies = ["स्क्रीन टाइम ट्रैकर कैसे देखें? ⏱️", "E2E एन्क्रिप्टेड चैट्स कैसे करें? 🔒", "मार्केटप्लेस कैसे यूज़ करें? 🛍️"]
        elif lang == "hinglish":
            reply = (
                f"🎙️ **Nexoria Audio Lounge, Pulse Room & Watch Party ({display_name})**:\n\n"
                "1. 🎙️ **Micro-Community Audio Lounge**: Clubhouse/Discord-style live voice hangouts with Stage Speakers, Listeners, and Raise Hand tools.\n"
                "2. 🍿 **Synchronized Watch Party**: Friends ke sath synchronized reels/videos dekhein aur sath me live chat karein.\n"
                "3. 🍃 **Zen Soundscapes**: Ambient background sounds (Rain, Cafe, Nature) focus ke sath reading aur browsing ke liye."
            )
            suggested_replies = ["Screen time tracker kaise dekhe? ⏱️", "E2E chat kaise use kare? 🔒", "Marketplace guide do 🛍️"]
        else:
            reply = (
                f"🎙️ **Nexoria Audio Hangout & Watch Party Lounges ({display_name})**:\n\n"
                "1. 🎙️ **Audio Lounge**: Live voice hangout spaces with Mute controls, Stage Speakers, and Raise Hand mechanics.\n"
                "2. 🍿 **Watch Party**: Synchronized video player with group conversation sidebars.\n"
                "3. 🍃 **Zen Sound Player**: Ambient background audio (Rain, Forest, Binaural focus) for mindful social browsing."
            )
            suggested_replies = ["How to check screen time? ⏱️", "How to use E2E chats? 🔒", "Marketplace guide 🛍️"]

    # =========================================================================
    # 8. MARKETPLACE & HYPERLOCAL SHOPPING (लोकल मार्केटप्लेस)
    # =========================================================================
    elif has_any(cleaned, [
        "market", "marketplace", "buy", "sell", "seller", "radius", "pincode",
        "मार्केट", "मार्केटप्लेस", "खरीदना", "बेचना", "सेलर", "लोकल", "aadhaar seller", "verified seller"
    ]):
        if lang == "hindi":
            reply = (
                f"🛍️ **नेक्सोरिया हाइपरलोकल मार्केटप्लेस गाइड ({display_name})**:\n\n"
                "1. 📍 **GPS रेडियस फिल्टर**: अपने शहर से <5 किमी, <15 किमी, <30 किमी, या <50 किमी के दायरे में सामान खरीदें और बेचें।\n"
                "2. 🛡️ **आधार / गवर्नमेंट आईडी वेरिफाइड सेलर्स**: **'Verified Sellers Only'** टॉगल ऑन करके सिर्फ वेरिफाइड सेलर्स से सुरक्षित खरीदारी करें।\n"
                "3. 📮 **पिनकोड कम्युनिटी स्पेसेस**: अपने पिनकोड (जैसे `110001`, `560038`) के लोकल बुलेटिन बोर्ड्स पर डील्स देखें।"
            )
            suggested_replies = ["क्रिएटर ऑफर्स कैसे देखें? 🎁", "वेरिफाइड सेलर कैसे बनें? ✓", "सपोर्ट हब कैसे खोलें? 🛟"]
        elif lang == "hinglish":
            reply = (
                f"🛍️ **Nexoria Hyperlocal Marketplace Guide ({display_name})**:\n\n"
                "1. 📍 **Hyperlocal Radius Filter**: Apne GPS location se <5km se lekar <50km tak products explore karein.\n"
                "2. 🛡️ **Govt ID / Aadhaar Verified Sellers**: Verified Seller badge ke sath safe local shopping karein.\n"
                "3. 📮 **Pincode Local Spaces**: Pincode-scoped neighborhood announcement boards par deals search karein."
            )
            suggested_replies = ["Creator offers kaise check kare? 🎁", "Verified seller badge kaise lagaye? ✓", "Support hub open kare 🛟"]
        else:
            reply = (
                f"🛍️ **Nexoria Hyperlocal Community Marketplace ({display_name})**:\n\n"
                "1. 📍 **Haversine GPS Radius**: Filter listings from <5 km up to <50 km around your location.\n"
                "2. 🛡️ **Aadhaar / Govt ID Verified Sellers**: Shop safely from identity-confirmed sellers.\n"
                "3. 📮 **Pincode Neighborhood Spaces**: Local pin-code boards for authentic community trade."
            )
            suggested_replies = ["How to check creator offers? 🎁", "How to get verified seller badge? ✓", "Open support hub 🛟"]

    # =========================================================================
    # 9. HELP, SUPPORT, TICKETS & ACCOUNT HEALTH (हेल्प और सपोर्ट)
    # =========================================================================
    elif has_any(cleaned, [
        "support", "help", "ticket", "problem", "bug", "report", "health", "score",
        "standing", "violation", "strike", "review", "appeal", "shikayat", "madad",
        "सपोर्ट", "हेल्प", "टिकट", "शिकायत", "हेल्थ स्कोर", "स्ट्राइक", "अपील",
        "support ticket", "bug report", "ticket kaise", "help kaise"
    ]):
        if lang == "hindi":
            reply = (
                f"🛟 **नेक्सोरिया हेल्प, सपोर्ट और अकाउंट हेल्थ सिस्टम ({display_name})**:\n\n"
                f"• **अकाउंट हेल्थ स्कोर**: `{user_health_score}/100` ({user_standing})\n"
                "• **सिक्योरिटी रेटिंग**: सुरक्षित (100% रिकमेंडेबल)\n\n"
                "🌟 **सपोर्ट हब के 4 मुख्य सेक्शन्स (/support)**:\n"
                "1. 🛡️ **सिक्योरिटी स्कैन**: **'Run Security Scan'** बटन से अपनी प्रोफाइल का लाइव टेस्ट करें।\n"
                "2. 📬 **सपोर्ट इनबॉक्स (3 टैब्स)**: आपके दर्ज किए गए रिपोर्ट्स, कम्युनिटी स्ट्राइक्स, और सपोर्ट टिकट्स।\n"
                "3. ⚖️ **ह्यूमन रिव्यू अपील**: किसी भी स्ट्राइक पर **'Request Human Review'** से अपील करें।\n"
                "4. 🐛 **टेक्निकल प्रॉब्लम रिपोर्ट**: स्क्रीनशॉट और सिस्टम डायग्नोस्टिक्स के साथ तुरंत `#NX-REP-XXXXX` टिकट बनाएं।"
            )
            suggested_replies = ["सिक्योरिटी स्कैन अभी चलाएं 🔍", "सपोर्ट टिकट कैसे खोलें? 📬", "बग रिपोर्ट कैसे करें? 🐛"]
        elif lang == "hinglish":
            reply = (
                f"🛟 **Nexoria Help, Support & Account Health System ({display_name})**:\n\n"
                f"• **Account Health Score**: `{user_health_score}/100` ({user_standing})\n"
                "• **Policy Violations**: `0 Active Strikes`\n"
                "• **Feed Recommendability**: `100% Eligible`\n\n"
                "🌟 **Support Hub ke 4 Modules (/support)**:\n"
                "1. 🛡️ **Account Health & Security Scanner**: On-demand security scan run karein.\n"
                "2. 📬 **Support Inbox (3 Tabs)**: Reports Filed, Violations Review Appeals, aur Support Tickets (with conversation thread replies).\n"
                "3. 🐛 **Report a Technical Problem**: Screenshot aur diagnostic logs attach karke `#NX-REP-XXXXX` ticket banayein.\n"
                "4. 📚 **Knowledge Base**: Searchable articles read karein aur feedback vote karein."
            )
            suggested_replies = ["Security scan abhi run kare 🔍", "Support ticket kaise check kare? 📬", "Bug report kaise kare? 🐛"]
        else:
            reply = (
                f"🛟 **Nexoria Support, Tickets & Account Health Hub ({display_name})**:\n\n"
                f"• **Account Health Score**: `{user_health_score}/100` ({user_standing})\n"
                "• **Policy Standing**: `0 Active Strikes (Good Standing)`\n\n"
                "🌟 **Support Hub Modules (/support)**:\n"
                "1. 🛡️ **Profile Quality & Security Scan**: Run on-demand diagnostic audits.\n"
                "2. 📬 **Support Inbox**: 3 dynamic tabs for Reports Filed, Violations Appeals, and Ticket Reply Threads.\n"
                "3. 🐛 **Report Technical Issue**: Submit bug reports with diagnostic telemetry and screenshots.\n"
                "4. 📚 **Knowledge Base**: Searchable articles with live feedback voting."
            )
            suggested_replies = ["Run security scan now 🔍", "How to open support ticket? 📬", "Check account standing 🛡️"]

    # =========================================================================
    # 10. SECURITY, 2FA & PASSWORD RESET (सुरक्षा और पासवर्ड)
    # =========================================================================
    elif has_any(cleaned, [
        "security", "2fa", "two factor", "password", "hack", "otp", "login",
        "suraksha", "badalna", "auth", "device", "session", "पासवर्ड", "सुरक्षा",
        "टू फैक्टर", "password kaise", "2fa kaise", "forgot password"
    ]):
        if lang == "hindi":
            reply = (
                f"🔒 **नेक्सोरिया अकाउंट सिक्योरिटी और 2FA गाइड ({display_name})**:\n\n"
                "1. 🔑 **Two-Factor Authentication (2FA)**: Settings > Privacy Checkup > Two-Factor Auth में जाकर Google Authenticator या SMS OTP चालू करें।\n"
                "2. 📱 **एक्टिव डिवाइसेज चेक**: Settings में जाकर देखें कि आपका अकाउंट किन-किन फोन या कंप्यूटर पर खुला है और अनचाहे डिवाइसेज को लॉगआउट करें।\n"
                "3. 🛡️ **पासवर्ड रीसेट**: Forgot Password पेज पर रजिस्टर्ड ईमेल डालकर सुरक्षित OTP से पासवर्ड बदलें।"
            )
            suggested_replies = ["2FA कैसे ऑन करें? 🔒", "एक्टिव सेशन्स कैसे देखें? 📱", "पासवर्ड कैसे बदलें? 🔑"]
        elif lang == "hinglish":
            reply = (
                f"🔒 **Nexoria Account Security & 2FA Setup Guide ({display_name})**:\n\n"
                "1. 🔑 **Two-Factor Authentication (2FA)**: Settings > Privacy Checkup > Two-Factor Auth me jakar Authenticator app ya SMS OTP enable karein.\n"
                "2. 📱 **Active Login Sessions**: Check karein kin devices par login hai, aur unknown sessions ko sign out karein.\n"
                "3. 🛡️ **Password Reset**: Forgot Password page par jakar email OTP se new password set karein."
            )
            suggested_replies = ["2FA kaise on kare? 🔒", "Active sessions kaise check kare? 📱", "Password kaise change kare? 🔑"]
        else:
            reply = (
                f"🔒 **Nexoria Account Security & 2FA Guide ({display_name})**:\n\n"
                "1. 🔑 **Two-Factor Authentication (2FA)**: Enable Authenticator App or SMS OTP in Settings > Account Security.\n"
                "2. 📱 **Active Sessions**: Monitor connected devices and terminate unauthorized logins instantly.\n"
                "3. 🛡️ **Password Recovery**: Secure password reset flow using tokenized email verification."
            )
            suggested_replies = ["How to enable 2FA? 🔒", "How to view active sessions? 📱", "How to reset password? 🔑"]

    # =========================================================================
    # 11. TRUST BADGES / VERIFICATION (वेरिफाइड बैज)
    # =========================================================================
    elif has_any(cleaned, [
        "badge", "badges", "verified", "blue tick", "blue badge", "aadhaar", "govt id",
        "बैज", "वेरिफाइड", "ब्लू टिक", "पहचान", "verified kaise"
    ]):
        if lang == "hindi":
            reply = (
                f"🛡️ **नेक्सोरिया ट्रस्ट और वेरिफाइड बैज गाइड ({display_name})**:\n\n"
                "1. 🛡️ **Aadhaar / Govt ID Verified Badge**: अपनी सरकारी पहचान वेरिफाई करके प्रोफाइल पर लीगल ट्रस्ट बैज पाएं।\n"
                "2. 🚀 **Pioneer Creator Badge**: नेक्सोरिया के अर्ली ओरिजिनल क्रिएटर्स को मिलने वाला प्रेस्टीज बैज।\n"
                "3. 🔒 **TruthGuard E2E Shield**: प्राइवेसी और ऑथेंटिसिटी वेरिफाइड अकाउंट्स को दिया जाता है।\n\n"
                "👉 इसे मैनेज करने के लिए: **Profile > Edit Profile > Trust Badges** में जाएं।"
            )
            suggested_replies = ["हॉबीज और इंटरेस्ट्स कैसे जोड़ें? 🎨", "कवर फोटो कैसे बदलें? 🖼️", "मोनेटाइजेशन कैसे चालू करें? 💎"]
        elif lang == "hinglish":
            reply = (
                f"🛡️ **Nexoria Trust & Verified Badges Guide ({display_name})**:\n\n"
                "1. 🛡️ **Aadhaar / Govt ID Verified**: Official identity confirmation badge for marketplace & creators.\n"
                "2. 🚀 **Pioneer Creator**: Early adopter verified creator badge.\n"
                "3. 🔒 **TruthGuard E2E Shield**: End-to-end security and authentic signal badge.\n\n"
                "👉 Toggle karne ke liye: **Profile > Edit Profile > Trust Badges** me jayein."
            )
            suggested_replies = ["Hobbies & Interests kaise add kare? 🎨", "Cover photo kaise update kare? 🖼️", "Monetisation kaise enable kare? 💎"]
        else:
            reply = (
                f"🛡️ **Nexoria Trust Badges & Verification for {display_name}**:\n\n"
                "1. 🛡️ **Aadhaar / Govt ID Verified**: Legal identity badge for trusted trade and creator verification.\n"
                "2. 🚀 **Pioneer Creator**: Exclusive badge for verified high-impact creators.\n"
                "3. 🔒 **TruthGuard E2E Shield**: Verified authenticity and Signal encryption status.\n\n"
                "👉 Manage via **Profile > Edit Profile > Trust Badges**."
            )
            suggested_replies = ["How to add hobbies & interests? 🎨", "How to update cover photo? 🖼️", "How to enable monetisation? 💎"]

    # =========================================================================
    # 12. PROJECT OVERVIEW & ALL FEATURES (पूरा प्रोजेक्ट और फीचर्स)
    # =========================================================================
    elif has_any(cleaned, [
        "project", "kya hai", "kya feature", "project kya", "about project", "nexoria kya",
        "all features", "kya kya hai", "kya kaam", "batao project", "project details",
        "overview", "what is nexoria", "what is this project", "features of nexoria",
        "प्रोजेक्ट", "फीचर्स", "नेक्सोरिया", "सभी फीचर्स", "प्रोजेक्ट क्या है", "sab features"
    ]):
        if lang == "hindi":
            reply = (
                f"🚀 **नेक्सोरिया (Nexoria Social Cosmos) प्रोजेक्ट का पूरा विवरण ({display_name})**:\n\n"
                "नेक्सोरिया एक नेक्स्ट-जेनरेशन सोशल मीडिया प्लेटफॉर्म है जिसके 7 मुख्य इनोवेशन पिलर्स हैं:\n\n"
                "1. 🧠 **0-एल्गोरिदम और TruthGuard AI™**: बिना किसी शैडो-रैंकिंग के शुद्ध क्रोनोलॉजिकल फीड और 99.8% फेक न्यूज़ ऑथेंटिसिटी चेक।\n"
                "2. 🔒 **E2E एन्क्रिप्टेड चैट्स और घोस्ट मोड**: सिग्नल प्रोटोकॉल एन्क्रिप्शन और गुमनाम चर्चा के लिए घोस्ट मोड।\n"
                "3. 💎 **क्रिएटर मोनेटाइजेशन (0% फीस)**: 1-क्लिक यूपीआई/एनएक्स कॉइन टिप्स और वीडियो/रील्स पर 90% रेवेन्यू शेयर।\n"
                "4. 📍 **हाइपरलोकल कम्युनिटी और मार्केटप्लेस**: 5 से 50 किमी रेडियस में आधार/गवर्नमेंट आईडी वेरिफाइड लोकल सेलर्स।\n"
                "5. 🛠️ **13-सेक्शन एडिट प्रोफाइल**: बायो, पिन, हॉबीज, इंटरेस्ट्स, ट्रेवल, लिंक्स और वेरिफाइड बैज का पूरा कंट्रोल।\n"
                "6. 🛟 **डायनामिक हेल्प एंड सपोर्ट हब**: रियल-टाइम अकाउंट हेल्थ स्कोर, सिक्योरिटी स्कैनर, सपोर्ट टिकट्स और अपील सिस्टम।\n"
                "7. 🤖 **नेक्सोरिया क्वांटम एआई 2.0**: लाइव न्यूरल असिस्टेंट जो हिंदी, हिंग्लिश और इंग्लिश में रियल-टाइम सहायता देता है।"
            )
            suggested_replies = ["हॉबीज और इंटरेस्ट्स कैसे जोड़ें? 🎨", "लॉगआउट कैसे करें? 🚪", "रील्स से पैसे कैसे कमाएं? 💎"]
        elif lang == "hinglish":
            reply = (
                f"🚀 **Nexoria Project Complete Architecture & Features ({display_name} ke liye)**:\n\n"
                "Nexoria ek next-gen **Privacy-First & Creator-Centric** social ecosystem hai:\n\n"
                "🌟 **7 Flagship Innovation Pillars**:\n"
                "1. ⏱️ **0-Algorithm Chrono Feed**: Strictly chronological delivery without reach suppression.\n"
                "2. 🧠 **TruthGuard AI™ Fake News Shield**: 99.8% authentic verification badge.\n"
                "3. 🔒 **Signal Protocol E2E Messaging & Ghost Mode**: Private chats aur anonymous discussion posts.\n"
                "4. 💎 **0% Platform Fee Creator Monetisation**: Stars on Reels, Subscriptions, In-stream Video Ads, aur 90% rev share.\n"
                "5. 📍 **Hyperlocal Marketplace**: Pincode spaces aur Govt ID / Aadhaar verified sellers (<5km to <50km).\n"
                "6. 🛠️ **13-Section Complete Profile Suite**: Avatar, Cover drag adjust, Bio, City, Education, Hobbies, Interests, Visited Places, Badges.\n"
                "7. 🛟 **Live Dynamic Support & Security Hub**: Real-time Account Health scoring, on-demand security scan, aur ticket thread replies."
            )
            suggested_replies = ["Hobbies aur Interests kaise add kare? 🎨", "Logout kaise kare? 🚪", "Reels me earning kaise kare? 💎"]
        else:
            reply = (
                f"🚀 **Nexoria Social Cosmos — Complete Project Architecture ({display_name})**:\n\n"
                "Nexoria is engineered across 7 Flagship Innovation Pillars:\n\n"
                "1. ⏱️ **Zero-Algorithm Chrono Feed**: 100% unsuppressed follower reach.\n"
                "2. 🧠 **TruthGuard AI™**: 99.8% authenticity verification and fake news shielding.\n"
                "3. 🔒 **Signal Protocol E2E Chats & Ghost Mode**: Zero-data selling and anonymous posts.\n"
                "4. 💎 **Creator Monetisation (0% Platform Fee)**: Micro-tipping, Stars, and 90% video ad rev share.\n"
                "5. 📍 **Hyperlocal Marketplace**: Aadhaar/Govt ID verified sellers and GPS radius neighborhood spaces.\n"
                "6. 🛠️ **13-Section Dynamic Profile Suite**: Avatar, Cover drag adjust, Bio, Hobbies, Interests, Visited Places, Badges.\n"
                "7. 🛟 **Dynamic Support & Security Hub**: Real-time AccountHealth scoring, support tickets, and telemetry bug reporting."
            )
            suggested_replies = ["How to add hobbies & interests? 🎨", "How to log out? 🚪", "How to earn with Reels? 💎"]

    # =========================================================================
    # 13. GREETINGS (नमस्ते / हेलो)
    # =========================================================================
    elif has_any(cleaned, ["hi", "hello", "hey", "namaste", "pranam", "kese ho", "kaise ho", "help", "madad", "bhai", "नमस्ते", "प्रणाम"]):
        if lang == "hindi":
            reply = (
                f"🙏 **नमस्ते {display_name}! मैं नेक्सोरिया क्वांटम एआई 2.0 हूँ**।\n\n"
                "मैं आपके पूरे प्रोजेक्ट और अकाउंट का रियल-टाइम को-पायलट हूँ। आप मुझसे प्रोफाइल (हॉबीज, इंटरेस्ट्स, कवर फोटो), लॉगआउट, 0-एल्गोरिदम फीड, रील्स से कमाई, कोडिंग, या सिक्योरिटी के बारे में हिंदी या इंग्लिश में कुछ भी पूछ सकते हैं!\n\n"
                "बताइए, आज मैं आपकी क्या मदद करूँ?"
            )
            suggested_replies = ["हॉबीज और इंटरेस्ट्स कैसे जोड़ें? 🎨", "लॉगआउट कैसे करें? 🚪", "रील्स से पैसे कैसे कमाएं? 💎"]
        elif lang == "hinglish":
            reply = (
                f"⚡ **Hello {display_name}! Main Nexoria Quantum AI 2.0 Assistant hoon**.\n\n"
                "Aap apne Nexoria project ke kisi bhi feature ke baare me Hindi, Hinglish ya English me pooch sakte hain — jaise Hobbies & Interests add karna, Logout karna, Profile Avatar & Cover update karna, 0-Algorithm Feed, Stars & Creator Earnings, ya Code Logic!\n\n"
                "Aap kya explore karna chahte hain?"
            )
            suggested_replies = ["Hobbies aur Interests kaise add kare? 🎨", "Logout kaise kare? 🚪", "Reels me earning kaise kare? 💎"]
        else:
            reply = (
                f"⚡ **Hello {display_name}! I am Nexoria Quantum AI 2.0 (v2.4 Ultra)**.\n\n"
                "I am your real-time social co-pilot and project assistant. You can ask me anything about Nexoria features, profile customization (Hobbies & Interests, Cover Photo, Bio), Logout, algorithm mechanics, monetization, or code in English, Hindi, or Hinglish!\n\n"
                "What would you like to explore today?"
            )
            suggested_replies = ["How to add hobbies & interests? 🎨", "How to log out? 🚪", "How to earn with Reels? 💎"]

    # =========================================================================
    # 14. UNIVERSAL CONTEXTUAL FALLBACK
    # =========================================================================
    else:
        if lang == "hindi":
            reply = (
                f"⚡ **नेक्सोरिया न्यूरल रिस्पॉन्स ({display_name} के लिए)**:\n\n"
                f"आपके सवाल *\"{cleaned}\"* का समाधान:\n\n"
                "1. 🛠️ **प्रोफाइल और सेटिंग्स**: प्रोफाइल में हॉबीज, इंटरेस्ट्स, बायो, और कवर फोटो बदलने के लिए **Profile > Edit Profile** में जाएं।\n"
                "2. 🚪 **लॉगआउट और नेविगेशन**: साइडबार खोलकर सबसे नीचे 'Log Out' से कभी भी लॉगआउट कर सकते हैं।\n"
                "3. 💎 **क्रिएटर अर्निंग्स**: रील्स पर स्टार्स (1 Star = ₹1) और 90% वीडियो रेवेन्यू शेयर से कमाई होती है।\n"
                "4. 🛟 **सपोर्ट**: किसी भी सहायता के लिए **/support** पेज पर जाएं।\n\n"
                "आप मुझसे इस बारे में कोई भी सीधा सवाल पूछ सकते हैं!"
            )
            suggested_replies = ["हॉबीज और इंटरेस्ट्स कैसे जोड़ें? 🎨", "लॉगआउट कैसे करें? 🚪", "रील्स से पैसे कैसे कमाएं? 💎"]
        elif lang == "hinglish":
            reply = (
                f"⚡ **Nexoria Neural Response ({display_name} ke liye)**:\n\n"
                f"Aapke question *\"{cleaned}\"* ke liye project guide:\n\n"
                "1. 🛠️ **Profile Customization**: Hobbies, Interests, Bio, aur Cover photo update karne ke liye **Profile > Edit Profile** me jayein.\n"
                "2. 🚪 **Logout**: Left Sidebar open karke bottom me **'Log Out'** button dabayein.\n"
                "3. 💎 **Creator Earnings**: Stars on Reels (1 Star = ₹1) aur 90% video ad revenue share se earn karein.\n"
                "4. 🛟 **Help & Support**: Live account health check karne ya ticket banane ke liye **/support** page par jayein.\n\n"
                "Aap is feature ke baare me detail me pooch sakte hain!"
            )
            suggested_replies = ["Hobbies & Interests kaise add kare? 🎨", "Logout kaise kare? 🚪", "Reels me earning kaise kare? 💎"]
        else:
            reply = (
                f"⚡ **Nexoria Neural Synthesis for {display_name}**:\n\n"
                f"Regarding *\"{cleaned}\"*:\n\n"
                "1. 🛠️ **Profile Suite**: Customize Hobbies, Interests, Bio, and Cover Banner via **Profile > Edit Profile**.\n"
                "2. 🚪 **Navigation**: Access Log Out and Identity Settings directly from the left Sidebar.\n"
                "3. 💎 **Creator Hub**: Earn via Stars on Reels & 90% Video Ad revenue share.\n"
                "4. 🛟 **Support**: Manage account health and support tickets at **/support**.\n\n"
                "Feel free to ask for specific step-by-step guidance on any Nexoria feature!"
            )
            suggested_replies = ["How to add hobbies & interests? 🎨", "How to log out? 🚪", "How to earn with Reels? 💎"]

    return {
        "success": True,
        "reply": reply,
        "mode": mode,
        "suggested_replies": suggested_replies,
        "timestamp": now_str,
        "model_version": "Nexoria Quantum Neural v2.4 Ultra"
    }
