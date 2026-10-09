// Curated Social Media Music & Dialogues Library (Meta / Facebook / Reels Style)
// Contains high-quality preview audio tracks, iconic dialogues, album art, lyrics, and genres

export const MUSIC_GENRES = [
  { id: "all", label: "For You 🔥" },
  { id: "dialogues", label: "🎬 Dialogues & Memes" },
  { id: "trending", label: "Trending 📈" },
  { id: "bollywood", label: "Bollywood 🇮🇳" },
  { id: "punjabi", label: "Punjabi Beats ⚡" },
  { id: "lofi", label: "Chill / Lo-Fi 🎧" },
  { id: "viral", label: "Viral Reels 📱" },
  { id: "love", label: "Romantic / Love 💖" },
  { id: "pop", label: "Global Pop 🌟" },
  { id: "edm", label: "EDM / Party 🚀" }
];

export const MUSIC_TRACKS = [
  // --- FAMOUS DIALOGUES & VIRAL CLIPS ---
  {
    id: "dlg-1",
    title: "Pushpa Jhukega Nahi Sala 🔥",
    artist: "Allu Arjun (Pushpa 2)",
    album: "Pushpa: The Rule",
    genre: "dialogues",
    category: "dialogues",
    duration: 15,
    cover: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=300&auto=format&fit=crop&q=80",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=action-bass-drop.mp3",
    lyrics: "Pushpa... Pushpa Raj... Jhukega nahi saala! Fire hai main 🔥",
    trending: true,
    plays: "14.2M"
  },
  {
    id: "dlg-2",
    title: "Violence Likes Me (Rocky Bhai)",
    artist: "Yash (KGF Chapter 2)",
    album: "KGF 2 Iconic Soundboard",
    genre: "dialogues",
    category: "dialogues",
    duration: 18,
    cover: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&auto=format&fit=crop&q=80",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=powerful-beat-121791.mp3",
    lyrics: "Violence... Violence... Violence! I don't like it, I avoid! But violence likes me, I can't avoid! ⚡",
    trending: true,
    plays: "18.9M"
  },
  {
    id: "dlg-3",
    title: "25 Din Me Paisa Double 💰",
    artist: "Akshay Kumar & Babu Bhaiya",
    album: "Phir Hera Pheri Memes",
    genre: "dialogues",
    category: "dialogues",
    duration: 12,
    cover: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=300&auto=format&fit=crop&q=80",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/11/06/audio_c93a0279a0.mp3?filename=groove-party-126261.mp3",
    lyrics: "Zor zor se bolke sabko scheme bata de! 25 din mein paisa double! 🤑",
    trending: true,
    plays: "22.5M"
  },
  {
    id: "dlg-4",
    title: "Don Ko Pakadna Mushkil Hi Nahi 🕶️",
    artist: "Shah Rukh Khan",
    album: "Don: The Chase Begins",
    genre: "dialogues",
    category: "dialogues",
    duration: 15,
    cover: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&auto=format&fit=crop&q=80",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_c350800d1e.mp3?filename=cyberpunk-beat-110375.mp3",
    lyrics: "Don ko pakadna mushkil hi nahi... naamumkin hai! ⚡",
    trending: true,
    plays: "9.8M"
  },
  {
    id: "dlg-5",
    title: "Baap Ka Dada Ka Sabka Badla Faizal",
    artist: "Nawazuddin Siddiqui",
    album: "Gangs of Wasseypur",
    genre: "dialogues",
    category: "dialogues",
    duration: 16,
    cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=powerful-beat-121791.mp3",
    lyrics: "Baap ka, dada ka, bhai ka... sabka badla lega re tera Faizal!",
    trending: false,
    plays: "11.1M"
  },
  {
    id: "dlg-6",
    title: "Sigma Phonk Anthem 🗿",
    artist: "Sigma Beats / Viral Audio",
    album: "Gigachad Phonk",
    genre: "viral",
    category: "viral",
    duration: 25,
    cover: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=300&auto=format&fit=crop&q=80",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_c350800d1e.mp3?filename=cyberpunk-beat-110375.mp3",
    lyrics: "Rule #1: Focus on yourself. Sigma grindset never stops 🗿🔥",
    trending: true,
    plays: "35.4M"
  },
  {
    id: "dlg-7",
    title: "Hindustan Zindabad Tha & Rahega 🇮🇳",
    artist: "Sunny Deol (Tara Singh)",
    album: "Gadar 2",
    genre: "dialogues",
    category: "dialogues",
    duration: 18,
    cover: "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=300&auto=format&fit=crop&q=80",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
    lyrics: "Hamara Hindustan Zindabad tha, Zindabad hai, aur Zindabad rahega! 🇮🇳",
    trending: true,
    plays: "16.8M"
  },

  // --- HIT MUSIC TRACKS ---
  {
    id: "track-1",
    title: "Kesariya (Lo-Fi Chill Mix)",
    artist: "Arijit Singh & Pritam",
    album: "Brahmāstra",
    genre: "bollywood",
    category: "love",
    duration: 30,
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
    lyrics: "Kesariya tera ishq hai piya... Rang jaaun jo main haath lagaun...",
    trending: true,
    plays: "4.2M"
  },
  {
    id: "track-2",
    title: "Starboy Midnight Synthwave",
    artist: "The Weeknd & Daft Punk",
    album: "Starboy Remixed",
    genre: "pop",
    category: "trending",
    duration: 30,
    cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=80",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=electronic-future-beats-117997.mp3",
    lyrics: "I'm tryna put you in the worst mood, ah... Look what you've done...",
    trending: true,
    plays: "8.9M"
  },
  {
    id: "track-3",
    title: "Brown Munde Hype Drill",
    artist: "AP Dhillon & Gurinder Gill",
    album: "Desi Drill EP",
    genre: "punjabi",
    category: "trending",
    duration: 30,
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=powerful-beat-121791.mp3",
    lyrics: "Geetan di machine ban gaye aa munde... Brown Munde!",
    trending: true,
    plays: "6.5M"
  },
  {
    id: "track-4",
    title: "Midnight Rain & Cozy Coffee",
    artist: "Lo-Fi Beats Collective",
    album: "Night Study Sessions",
    genre: "lofi",
    category: "lofi",
    duration: 30,
    cover: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=300&auto=format&fit=crop&q=80",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=chill-abstract-intention-12099.mp3",
    lyrics: "Soft rainy vibes... Quiet night city lights ✨",
    trending: false,
    plays: "2.1M"
  },
  {
    id: "track-5",
    title: "Apna Bana Le Piya",
    artist: "Arijit Singh & Sachin-Jigar",
    album: "Bhediya",
    genre: "bollywood",
    category: "love",
    duration: 30,
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80",
    audioUrl: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_bb630cc098.mp3?filename=romantic-acoustic-guitar-15822.mp3",
    lyrics: "Tu mera koi na hoke bhi kuch laage... Apna bana le piya...",
    trending: true,
    plays: "7.8M"
  },
  {
    id: "track-6",
    title: "Levitating Dancefloor Groove",
    artist: "Dua Lipa & DaBaby",
    album: "Future Nostalgia",
    genre: "pop",
    category: "edm",
    duration: 30,
    cover: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&auto=format&fit=crop&q=80",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/11/06/audio_c93a0279a0.mp3?filename=groove-party-126261.mp3",
    lyrics: "If you wanna run away with me, I know a galaxy... We levitating!",
    trending: true,
    plays: "11.4M"
  },
  {
    id: "track-7",
    title: "Dil Diyan Gallan (Acoustic Unplugged)",
    artist: "Atif Aslam",
    album: "Tiger Zinda Hai",
    genre: "bollywood",
    category: "love",
    duration: 30,
    cover: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=300&auto=format&fit=crop&q=80",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/04/27/audio_03d98cbe02.mp3?filename=acoustic-guitars-ambient-110854.mp3",
    lyrics: "Dil diyan gallan karange naal naal beh ke... Akh naale akh nu mila ke...",
    trending: false,
    plays: "5.1M"
  },
  {
    id: "track-8",
    title: "Cyberpunk Cyber Neon 2077",
    artist: "Electro Pulse DJ",
    album: "Neon Rush",
    genre: "edm",
    category: "edm",
    duration: 30,
    cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_c350800d1e.mp3?filename=cyberpunk-beat-110375.mp3",
    lyrics: "Bass dropping... High energy festival rave ⚡",
    trending: true,
    plays: "3.7M"
  }
];

/**
 * Filter music library by search query and category
 */
export function getFilteredTracks(genre = "all", query = "") {
  let filtered = [...MUSIC_TRACKS];

  if (genre && genre !== "all") {
    filtered = filtered.filter(
      (t) => t.genre === genre || t.category === genre
    );
  }

  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q) ||
        (t.lyrics && t.lyrics.toLowerCase().includes(q))
    );
  }

  return filtered;
}
