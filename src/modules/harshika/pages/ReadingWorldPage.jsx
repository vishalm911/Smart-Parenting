// src/pages/ReadingWorldPage.jsx
import { useState, useEffect } from "react";
import StoryCard   from "../components/StoryCard";
import StoryReader from "../components/StoryReader";
import { getStories } from "../firebase/firestoreService";
import { storiesData as defaultStories } from "../data/storiesData";
import { useStreak }   from "../hooks/useStreak";
import s from "./ReadingWorldPage.module.css";

const AGE_FILTERS  = ["All","1-3","4-6","7-10"];
const LANG_FILTERS = ["All","English","हिंदी","मराठी"];
const TOPIC_FILTERS= ["All","Courage","Nature","Bedtime","Adventure","Kindness","Friendship"];
const DAY_LABELS   = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

export default function ReadingWorldPage() {
  const [stories, setStories]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [ageFilter, setAgeFilter] = useState("All");
  const [langFilter, setLangFilter] = useState("All");
  const [topicFilter, setTopicFilter] = useState("All");
  const [active, setActive]       = useState(null);
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("bookmarks")||"[]"); } catch { return []; }
  });
  const { streakDays, streakCount, loading: streakLoading } = useStreak();

  const todayIdx = (new Date().getDay() + 6) % 7;

  // Load stories from Firestore (same source as Story World)
  useEffect(() => {
    getStories().then(fs => {
      setStories(fs.length ? fs : defaultStories);
      setLoading(false);
    });
  }, []);

  const toggleBookmark = (id, e) => {
    e.stopPropagation();
    setBookmarks(prev => {
      const next = prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id];
      localStorage.setItem("bookmarks", JSON.stringify(next));
      return next;
    });
  };

  const featured  = stories.filter(st => st.is_featured);
  const filtered  = stories.filter(story => {
    const matchAge   = ageFilter==="All"  || story.age_group===ageFilter;
    const matchLang  = langFilter==="All" || story.language===langFilter;
    const matchTopic = topicFilter==="All"|| story.topic===topicFilter;
    const matchSearch= story.title.toLowerCase().includes(search.toLowerCase()) ||
                       (story.author||"").toLowerCase().includes(search.toLowerCase()) ||
                       (story.topic||"").toLowerCase().includes(search.toLowerCase());
    return matchAge && matchLang && matchTopic && matchSearch;
  });

  const bookmarkedStories = stories.filter(st => bookmarks.includes(st.id));

  if (loading) return (
    <div className="page-wrap">
      <div style={{textAlign:"center",padding:80,color:"var(--color-text-secondary)"}}>
        <span style={{fontSize:48}}>📖</span>
        <p style={{marginTop:16,fontWeight:600}}>Loading stories…</p>
      </div>
    </div>
  );

  return (
    <div className="page-wrap">
      {/* Hero */}
      <div className="hero-banner" style={{background:"var(--gradient-cool)"}}>
        <h1>Reading World 📖</h1>
        <p>Explore magical stories, discover new worlds, and grow your reading skills!</p>
        <div className="hero-badges">
          <span className="hero-badge">📚 {stories.length} Stories</span>
          <span className="hero-badge">🌍 English · हिंदी · मराठी</span>
          <span className="hero-badge">⭐ 3 Difficulty Levels</span>
        </div>
        <div className="hero-deco">📖</div>
      </div>

      {/* Streak */}
      <div className={s.streak}>
        <span className={s.streakLabel}>📅 This Week:</span>
        {DAY_LABELS.map((d,i) => (
          <div key={i} className={`${s.day} ${streakDays[i]&&i<todayIdx?s.done:i===todayIdx?s.today:streakDays[i]&&i>todayIdx?s.future:""}`} title={d}>{d[0]}</div>
        ))}
        {streakLoading
          ? <span className={s.streakCount}>…</span>
          : <span className={s.streakCount}>{streakCount>0?`🔥 ${streakCount} day${streakCount>1?"s":""}!`:"Start today!"}</span>
        }
      </div>

      {/* Featured Carousel */}
      {featured.length > 0 && (
        <>
          <h2 className="sec-title"><span>⭐</span> Featured Stories</h2>
          <div className={s.carousel}>
            {featured.map(story => (
              <div key={story.id} className={s.featCard} onClick={()=>setActive(story)}>
                <div className={s.featCover} style={{background:story.cover_gradient}}>
                  {story.emoji}
                  <button className={`${s.bmBtn} ${bookmarks.includes(story.id)?s.bmActive:""}`}
                    onClick={e=>toggleBookmark(story.id,e)} title="Bookmark">
                    {bookmarks.includes(story.id)?"🔖":"🏷️"}
                  </button>
                </div>
                <div className={s.featInfo}>
                  <h3>{story.title}</h3>
                  <p className={s.author}>✍️ {story.author||"SpacECE Team"}</p>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:6}}>
                    <span className="tag tag-age">Age {story.age_group}</span>
                    <span className="tag tag-diff">{story.difficulty}</span>
                  </div>
                  <p className={s.featTime}>⏱ {story.estimated_time}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Bookmarks row */}
      {bookmarkedStories.length > 0 && (
        <>
          <h2 className="sec-title"><span>🔖</span> Bookmarked</h2>
          <div className={s.grid} style={{marginBottom:28}}>
            {bookmarkedStories.map(story => (
              <StoryCard key={story.id} story={story} onClick={setActive}
                bookmarked={bookmarks.includes(story.id)}
                onBookmark={e=>toggleBookmark(story.id,e)} />
            ))}
          </div>
        </>
      )}

      {/* Search + Filters */}
      <div className={s.filterBox}>
        <input className={`form-input ${s.searchInput}`} type="text"
          placeholder="🔍 Search by title, author, topic..."
          value={search} onChange={e=>setSearch(e.target.value)} />
        <div className={s.filterRow}>
          <span className={s.filterLabel}>Age:</span>
          {AGE_FILTERS.map(f=>(
            <button key={f} className={`${s.chip} ${ageFilter===f?s.chipActive:""}`}
              onClick={()=>setAgeFilter(f)}>{f==="All"?"All":f}</button>
          ))}
        </div>
        <div className={s.filterRow}>
          <span className={s.filterLabel}>Language:</span>
          {LANG_FILTERS.map(f=>(
            <button key={f} className={`${s.chip} ${langFilter===f?s.chipActive:""}`}
              onClick={()=>setLangFilter(f)}>{f}</button>
          ))}
        </div>
        <div className={s.filterRow}>
          <span className={s.filterLabel}>Topic:</span>
          {TOPIC_FILTERS.map(f=>(
            <button key={f} className={`${s.chip} ${topicFilter===f?s.chipActive:""}`}
              onClick={()=>setTopicFilter(f)}>{f}</button>
          ))}
        </div>
      </div>

      {/* Story Grid */}
      <h2 className="sec-title"><span>📚</span> All Stories
        <span style={{fontSize:14,fontWeight:600,color:"var(--color-text-secondary)",marginLeft:8}}>
          ({filtered.length} found)
        </span>
      </h2>
      {filtered.length===0
        ? <div className={s.empty}><span>📭</span><p>No stories match your filters. Try changing the search!</p></div>
        : <div className={s.grid}>
            {filtered.map(story=>(
              <StoryCard key={story.id} story={story} onClick={setActive}
                bookmarked={bookmarks.includes(story.id)}
                onBookmark={e=>toggleBookmark(story.id,e)} />
            ))}
          </div>
      }

      {active && <StoryReader story={active} onClose={()=>setActive(null)} />}
    </div>
  );
}
