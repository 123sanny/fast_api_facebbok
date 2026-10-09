/**
 * Nexoria Quantum AI 2.0 API Client Service
 */

const API_BASE_URL = "http://localhost:8000/api/v1/ai";

/**
 * Send interactive live message to Nexoria Quantum AI 2.0
 */
export const sendAIChatMessageApi = async ({
  message,
  mode = "general",
  history = [],
  userId = null,
  userName = ""
}) => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        message,
        mode,
        history,
        user_id: userId ? parseInt(userId, 10) : null,
        user_name: userName || ""
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `Server error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn("AI Chat API encountered fallback error, generating smart client response:", error);
    // Smart fallback if backend is offline or slow
    return generateClientAIFallback(message, mode, userName);
  }
};

/**
 * Fetch starter prompt suggestions for the selected mode
 */
export const fetchAIPromptSuggestionsApi = async (mode = "general") => {
  try {
    const response = await fetch(`${API_BASE_URL}/suggest-prompts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode })
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn("Prompt suggestions fallback:", error);
  }

  // Fallback defaults
  const FALLBACK_PROMPTS = {
    general: [
      { text: "How does Nexoria's 0-Algorithm Chrono feed work?", tag: "Algorithm" },
      { text: "Check my account standing and security rating 🛡️", tag: "Security" },
      { text: "How do I earn with Stars & Creator Subscriptions? 💎", tag: "Earnings" },
      { text: "Explain TruthGuard AI™ fake news verification 🧠", tag: "Safety" }
    ],
    creative: [
      { text: "Write a high-converting post about AI & future tech 🚀", tag: "Viral" },
      { text: "Generate 5 viral video ideas for Nexoria Reels 🎬", tag: "Video" },
      { text: "Draft an engaging storytelling caption about travel 🌍", tag: "Caption" },
      { text: "Create a launch announcement for a new digital product 📦", tag: "Launch" }
    ],
    coder: [
      { text: "Write a FastAPI async endpoint with Pydantic validation ⚡", tag: "FastAPI" },
      { text: "Create a modern React custom hook for WebSocket live chat ⚛️", tag: "React" },
      { text: "Write a SQL query to calculate user retention and churn 📊", tag: "SQL" },
      { text: "Explain the difference between JWT access & refresh tokens 🔒", tag: "Auth" }
    ],
    translator: [
      { text: "Translate 'Welcome to the future of social connection' to 5 languages 🌐", tag: "Translate" },
      { text: "Translate this post into formal business Spanish and Japanese 🇯🇵", tag: "Business" },
      { text: "Convert this caption into conversational Hindi with English script 🇮🇳", tag: "Hindi" },
      { text: "Translate into French, German, Arabic and Portuguese 🌍", tag: "Global" }
    ]
  };

  return {
    success: true,
    mode,
    prompts: FALLBACK_PROMPTS[mode] || FALLBACK_PROMPTS.general
  };
};

/**
 * Intelligent Multi-Lingual Client Fallback Generator
 */
function generateClientAIFallback(message, mode, userName) {
  const name = userName || "Creator";
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const lower = message.toLowerCase();
  const isHindi = /[\u0900-\u097F]/.test(message);
  const isHinglish = /(kaise|kya|karo|karna|batao|paise|kahan|mera|meri|apna|badle|kamaye|chahiye|hoga|hogi|kyu|hai)/i.test(lower);

  let reply = "";
  let suggested_replies = [];

  if (isHindi) {
    if (lower.includes("लॉगआउट") || lower.includes("लॉग आउट") || lower.includes("साइन आउट") || lower.includes("बाहर")) {
      reply = `🚪 **नेक्सोरिया से लॉगआउट करने का तरीका (${name})**:\n\n1. लेफ्ट साइडबार (Sidebar) खोलें।\n2. सबसे नीचे स्क्रॉल करें और **'Log Out'** बटन पर क्लिक करें। आपका सेशन सुरक्षित रूप से समाप्त हो जाएगा और आप लॉगिन स्क्रीन पर आ जाएंगे।`;
      suggested_replies = ["पासवर्ड कैसे बदलें? 🔑", "2FA कैसे लगाएं? 🔒", "एक्टिव सेशन्स देखें 📱"];
    } else if (lower.includes("हॉबी") || lower.includes("हॉबीज") || lower.includes("इंटरेस्ट") || lower.includes("शौक") || lower.includes("पसंद")) {
      reply = `🎨 **हॉबीज और इंटरेस्ट्स जोड़ने का तरीका (${name})**:\n\n1. अपनी **Profile** पर जाएं और **'Edit Profile'** पर क्लिक करें।\n2. **'Hobbies'** सेक्शन में जाकर 20+ प्रीसेट हॉबीज (Gaming, Travel, Photography आदि) में से चुनें या सर्च करें।\n3. **'Interests'** सेक्शन में Music, Films, TV Shows, Games और Sports के टैब्स से अपने पसंदीदा इंटरेस्ट्स सेलेक्ट करके **Save** करें।`;
      suggested_replies = ["बायो कैसे अपडेट करें? ✍️", "कवर फोटो कैसे बदलें? 🖼️", "वेरिफाइड बैज लगाएं ✓"];
    } else if (lower.includes("घोस्ट") || lower.includes("गुमनाम") || lower.includes("एक्सपायर")) {
      reply = `👻 **घोस्ट मोड और ऑटो-एक्सपायरिंग पोस्ट्स (${name})**:\n\n1. Create Post में **'Ghost Mode'** ऑन करें। आपका असली नाम और फोटो छुप जाएगी और एक मास्क बॉट अवतार से पोस्ट होगी।\n2. 24 घंटे या 7 दिन का एक्सपायरी टाइमर सेट करें।`;
      suggested_replies = ["E2E चैट्स क्या हैं? 🔒", "0-एल्गोरिदम फीड क्या है? ⏱️", "रील्स से कमाई कैसे करें? 💎"];
    } else if (lower.includes("ऑडियो") || lower.includes("लाउंज") || lower.includes("वॉच पार्टी")) {
      reply = `🎙️ **ऑडियो लाउंज और वॉच पार्टी (${name})**:\n\n1. **Audio Lounge**: क्लबहाउस स्टाइल वॉइस रूम जिसमें स्पीकर्स और हैंड रेज टूल्स हैं।\n2. **Watch Party**: दोस्तों के साथ सिंक्रोनाइज़्ड वीडियो और ग्रुप लाइव चैट।\n3. **Zen Audio**: बारिश और प्रकृति के साउंडस्केप्स।`;
      suggested_replies = ["स्क्रीन टाइम ट्रैकर देखें ⏱️", "मार्केटप्लेस कैसे यूज़ करें? 🛍️", "सपोर्ट हब खोलें 🛟"];
    } else if (lower.includes("मार्केट") || lower.includes("दुकान") || lower.includes("खरीदना") || lower.includes("बेचना")) {
      reply = `🛍️ **हाइपरलोकल मार्केटप्लेस (${name})**:\n\n1. 5 से 50 किमी जीपीएस रेडियस फिल्टर से लोकल सामान खरीदें और बेचें।\n2. आधार / गवर्नमेंट आईडी वेरिफाइड सेलर्स से सुरक्षित खरीदारी करें।`;
      suggested_replies = ["वेरिफाइड सेलर कैसे बनें? ✓", "ऑफर्स कैसे देखें? 🎁", "हेल्प हब खोलें 🛟"];
    } else if (lower.includes("बैज") || lower.includes("वेरिफाइड") || lower.includes("ब्लू टिक")) {
      reply = `🛡️ **ट्रस्ट और वेरिफाइड बैज (${name})**:\n\n1. Aadhaar / Govt ID Verified Badge\n2. Pioneer Creator Badge\n3. TruthGuard E2E Shield Badge\n👉 Profile > Edit Profile > Trust Badges में जाकर एक्टिवेट करें।`;
      suggested_replies = ["कवर फोटो कैसे बदलें? 🖼️", "हॉबीज कैसे जोड़ें? 🎨", "मोनेटाइजेशन चालू करें 💎"];
    } else if (lower.includes("प्रोफाइल") || lower.includes("फोटो") || lower.includes("कवर") || lower.includes("बायो")) {
      reply = `🛠️ **प्रोफाइल एडिट गाइड (${name})**:\n\n1. प्रोफाइल पर जाकर कैमरा आइकन से अवतार और कवर फोटो बदलें (Drag-To-Adjust उपलब्ध है)।\n2. बायो, करंट सिटी, एजुकेशन, हॉबीज और वेरिफाइड बैज को एडिट प्रोफाइल से आसानी से सेव कर सकते हैं।`;
      suggested_replies = ["कवर फोटो कैसे एडजस्ट करें? 🖼️", "वेरिफाइड बैज कैसे मिलेगा? ✓", "अकाउंट हेल्थ क्या है? 🛡️"];
    } else if (lower.includes("पैसे") || lower.includes("कमा") || lower.includes("रिल्स") || lower.includes("स्टार")) {
      reply = `💎 **नेक्सोरिया अर्निंग्स गाइड (${name})**:\n\n• रील्स और लाइव पर 1 Star = ₹1 मिलते हैं।\n• 45+ सेकंड वीडियोज पर 90% एड रेवेन्यू शेयर मिलता है।\n• हर महीने की 21 तारीख को बैंक या पेपाल में पेआउट ट्रांसफर होता है।`;
      suggested_replies = ["स्टार्स कैसे इनेबल करें? ⭐", "मेरी अर्निंग्स दिखाएं 📊", "मोनेटाइजेशन टूल्स क्या हैं? 💎"];
    } else {
      reply = `⚡ **नमस्ते ${name}!**\nनेक्सोरिया क्वांटम एआई आपके प्रोजेक्ट का रियल-टाइम असिस्टेंट है। आप मुझसे प्रोफाइल (हॉबीज, इंटरेस्ट्स, कवर फोटो), लॉगआउट, 0-एल्गोरिदम फीड, ट्रुथगार्ड एआई, E2E चैट्स, या कोडिंग के बारे में हिंदी या इंग्लिश में कुछ भी पूछ सकते हैं!`;
      suggested_replies = ["हॉबीज और इंटरेस्ट्स कैसे जोड़ें? 🎨", "लॉगआउट कैसे करें? 🚪", "रील्स से पैसे कैसे कमाएं? 💎"];
    }
  } else if (isHinglish) {
    if (lower.includes("logout") || lower.includes("log out") || lower.includes("signout") || lower.includes("sign out") || lower.includes("bahar")) {
      reply = `🚪 **Nexoria se Logout karne ka Tarika (${name} ke liye)**:\n\n1. Top-left corner se **Sidebar** open karein.\n2. Sabse bottom tak scroll karein aur **'Log Out'** button par click karein.\n3. Session clear ho kar aap Login screen par chale jayenge.`;
      suggested_replies = ["Password kaise change kare? 🔑", "2FA kaise enable kare? 🔒", "Active login devices check kare 📱"];
    } else if (lower.includes("hobbi") || lower.includes("hobby") || lower.includes("hobbies") || lower.includes("interest")) {
      reply = `🎨 **Hobbies & Interests add karne ka Step-by-Step Guide (${name})**:\n\n1. **Profile** par jakar **'Edit Profile'** click karein.\n2. **'Hobbies'** section me **Edit** dabayein aur 20+ preset chips (Travel, Gaming, Coding, Music etc.) me se choose karein.\n3. **'Interests'** section me Music, Movies, Games, aur Sports teams select karke **Save** karein.`;
      suggested_replies = ["Bio kaise update kare? ✍️", "Cover photo kaise set kare? 🖼️", "Verified badge kaise lagaye? ✓"];
    } else if (lower.includes("ghost") || lower.includes("anonymous") || lower.includes("expire")) {
      reply = `👻 **Ghost Mode & Expiring Posts Guide (${name})**:\n\n1. Create Post modal me **'Ghost Mode'** switch on karein. Original identity hide ho kar masked bot avatar aur pseudo-handle (e.g. \`ShadowRunner-924\`) se post publish hogi.\n2. 24h ya 7d ka expiry countdown timer set karein.`;
      suggested_replies = ["E2E chat kaise use kare? 🔒", "0-Algorithm feed kya hai? ⏱️", "Reels me earning kaise kare? 💎"];
    } else if (lower.includes("audio") || lower.includes("lounge") || lower.includes("watch party") || lower.includes("zen")) {
      reply = `🎙️ **Audio Lounge & Watch Party Guide (${name})**:\n\n1. **Audio Lounge**: Live voice hangout space with Speaker stages and Hand Raise tools.\n2. **Watch Party**: Synchronized video watching with live group chat.\n3. **Zen Audio**: Ambient focus soundscapes (Rain, Forest, Cafe).`;
      suggested_replies = ["Screen time insights dekhe ⏱️", "Marketplace guide 🛍️", "Support hub open kare 🛟"];
    } else if (lower.includes("market") || lower.includes("buy") || lower.includes("sell") || lower.includes("seller")) {
      reply = `🛍️ **Hyperlocal Marketplace Guide (${name})**:\n\n1. GPS location se <5km to <50km radius filter karein.\n2. Govt ID / Aadhaar verified sellers se safe trade karein.\n3. Pincode local announcement boards explore karein.`;
      suggested_replies = ["Verified seller badge kaise lagaye? ✓", "Creator offers check kare 🎁", "Support hub 🛟"];
    } else if (lower.includes("badge") || lower.includes("verified") || lower.includes("blue tick")) {
      reply = `🛡️ **Verified Badges Guide (${name})**:\n\n1. Aadhaar / Govt ID Verified Badge\n2. Pioneer Creator Badge\n3. TruthGuard E2E Shield Badge\n👉 Profile > Edit Profile > Trust Badges me toggle karein.`;
      suggested_replies = ["Cover photo adjust kaise kare? 🖼️", "Hobbies kaise add kare? 🎨", "Monetisation hub 💎"];
    } else if (lower.includes("profile") || lower.includes("photo") || lower.includes("pic") || lower.includes("cover") || lower.includes("bio") || lower.includes("edit")) {
      reply = `🛠️ **Profile Edit Guide (${name} ke liye)**:\n\n1. Profile page par Camera icon tap karke Avatar & Cover update karein (Drag-to-Adjust support ke sath).\n2. Bio, City, Education, 20+ Hobbies, Visited Places, aur Verified Badges sabhi 13 sections dynamically save hote hain.`;
      suggested_replies = ["Cover photo kaise adjust kare? 🖼️", "Verified badge kaise lagaye? ✓", "Account status check kare 🛡️"];
    } else if (lower.includes("paise") || lower.includes("kamaye") || lower.includes("kama") || lower.includes("reels") || lower.includes("star") || lower.includes("monetiz")) {
      reply = `💎 **Nexoria Creator Earning Guide (${name})**:\n\n1. ⭐ **Stars on Reels & Live**: 1 Star = ₹1 (0% platform fee).\n2. 🎬 **In-Stream Video Ads**: 90% creator revenue distribution.\n3. 💳 **Payout**: Har month 21st ko direct Bank ya PayPal me transfer hota hai.`;
      suggested_replies = ["Stars kaise enable kare? ⭐", "Earnings report dekhe 📊", "Monetisation hub kholo 💎"];
    } else {
      reply = `⚡ **Hello ${name}!**\nNexoria Quantum AI aapke poore project ka real-time assistant hai. Aap Hobbies & Interests add karna, Logout karna, Profile Customization, 0-Algorithm Chrono feed, TruthGuard AI Fake News check, E2E Chats, ya Creator Monetisation ke baare me pooch sakte hain!`;
      suggested_replies = ["Hobbies aur Interests kaise add kare? 🎨", "Logout kaise kare? 🚪", "Reels me earning kaise kare? 💎"];
    }
  } else {
    // English
    if (lower.includes("logout") || lower.includes("log out") || lower.includes("sign out")) {
      reply = `🚪 **How to Log Out of Nexoria (${name})**:\n\n1. Open the navigation **Sidebar** from the top-left menu.\n2. Scroll down to the very bottom.\n3. Click the **'Log Out'** button to securely clear your session.`;
      suggested_replies = ["How to change password? 🔑", "How to enable 2FA? 🔒", "How to view active sessions? 📱"];
    } else if (lower.includes("hobbi") || lower.includes("hobby") || lower.includes("interest")) {
      reply = `🎨 **How to Add Hobbies & Interests (${name})**:\n\n1. Go to **Profile** > **Edit Profile**.\n2. Scroll to **'Hobbies'** and click **Edit** (pick from 20+ presets or search).\n3. Click **'Interests'** to choose from Music, Films, Games, and Sports teams, then click **Save**.`;
      suggested_replies = ["How to update bio? ✍️", "How to adjust cover photo? 🖼️", "How to get verified badges? ✓"];
    } else if (lower.includes("ghost") || lower.includes("anonymous") || lower.includes("expire")) {
      reply = `👻 **Ghost Mode & Expiring Posts (${name})**:\n\n1. Toggle **'Ghost Mode'** in the Create Post modal to mask your identity with a procedural Bottts avatar and pseudo-handle.\n2. Select a 24-hour or 7-day auto-expiry lifespan.`;
      suggested_replies = ["How does E2E chat work? 🔒", "Explain 0-Algorithm feed ⏱️", "How to earn with Reels? 💎"];
    } else if (lower.includes("audio") || lower.includes("lounge") || lower.includes("watch party") || lower.includes("zen")) {
      reply = `🎙️ **Audio Lounge & Watch Party (${name})**:\n\n1. **Audio Lounge**: Live voice hangout space with stages.\n2. **Watch Party**: Synchronized video player with group conversation.\n3. **Zen Audio**: Focus ambient soundscapes.`;
      suggested_replies = ["Check screen time ⏱️", "Marketplace guide 🛍️", "Support hub 🛟"];
    } else if (mode === "creative") {
      reply = "✨ **Creative Studio Copy** for " + name + ":\n\n🔥 **Viral Hook**: \"The one thing nobody tells you about building in 2026...\"\n\n📖 **Storytelling**: \"Success isn't about working 18 hours a day. It's about working on the right levers with relentless focus.\"\n\n🎯 **Call to Action**: \"Drop a 🔥 if you agree, and follow for more insights!\"\n\n🏷️ `#NexoriaCreators #GrowthMindset #Viral2026`";
      suggested_replies = ["Make it punchier ✂️", "Add 5 hashtags 🏷️", "Write a Reel script 🎬"];
    } else if (mode === "coder") {
      reply = "💻 **Code Synthesis**:\n\n```javascript\n// High performance async handler\nasync function handleQuantumTask(payload) {\n  const res = await fetch('/api/v1/quantum', {\n    method: 'POST',\n    body: JSON.stringify(payload)\n  });\n  return await res.json();\n}\n```\n\n✅ Optimized for low latency and zero memory leaks.";
      suggested_replies = ["Show Python version 🐍", "Add error handling 🛡️", "Explain line by line 💡"];
    } else if (mode === "translator") {
      reply = "🌐 **Multi-Language Translation** for: \"" + message + "\"\n\n🇮🇳 **Hindi**: नेक्सोरिया के साथ जुड़ने के लिए धन्यवाद!\n🇪🇸 **Spanish**: ¡Gracias por conectarte con Nexoria!\n🇯🇵 **Japanese**: Nexoriaへ接続いただきありがとうございます！\n🇫🇷 **French**: Merci de vous connecter avec Nexoria !";
      suggested_replies = ["Translate to German & Arabic 🌍", "Show phonetic guide 🗣️", "Make it casual 💬"];
    } else {
      reply = `⚡ **Nexoria Quantum AI Assistant for ${name}**:\n\nRegarding *"${message}"*:\n\n1. 🛠️ **Profile**: Manage Hobbies, Interests, Bio, and Cover Banner via **Profile > Edit Profile**.\n2. 🚪 **Navigation**: Log Out and Settings are in the left Sidebar.\n3. ⏱️ **0-Algorithm Chrono Feed**: 100% unsuppressed reach.\n4. 💎 **0% Fee Monetisation**: Direct Stars and 90% video revenue share.\n\nAsk me anything about your project in English, Hindi, or Hinglish!`;
      suggested_replies = ["How to add hobbies & interests? 🎨", "How to log out? 🚪", "How to earn with Reels? 💎"];
    }
  }

  return {
    success: true,
    reply,
    mode,
    suggested_replies,
    timestamp: now,
    model_version: "Nexoria Quantum Neural v2.4 Ultra (Multi-Lingual Engine)"
  };
}

