// src/pages/ReadingWorldPage.jsx
import { useState, useEffect } from "react";
import StoryCard   from '../../components/literacy/StoryCard';
import StoryReader from '../../components/literacy/StoryReader';
import MilestoneActivities from '../../components/child/MilestoneActivities';
import MilestoneCatalogActivities from '../../components/child/MilestoneCatalogActivities';
import { getStories } from '../../firebase/literacyService';
import { storiesData as defaultStories } from '../../data/storiesData';
import { useStreak }   from '../../hooks/useStreak';
import { useUser }     from '../../context/UserContext';
import s from "./ReadingWorldPage.module.css";

const AGE_FILTERS  = ["All","1-3","4-6","7-10"];
const LANG_FILTERS = ["All","English","हिंदी","मराठी"];
const TOPIC_FILTERS= ["All","Courage","Nature","Bedtime","Adventure","Kindness","Friendship"];
const DAY_LABELS   = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

export default function ReadingWorldPage() {
  const { profile } = useUser();
  const [stories, setStories]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [ageFilter, setAgeFilter] = useState("All");
  const [langFilter, setLangFilter] = useState(profile?.language || "English");
  const [topicFilter, setTopicFilter] = useState("All");
  const [active, setActive]       = useState(null);
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("bookmarks")||"[]"); } catch { return []; }
  });

  useEffect(() => {
    if (profile?.language) {
      setLangFilter(profile.language);
    }
  }, [profile?.language]);
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
    <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '40px' }}>
      <span style={{ fontSize: 56, marginBottom: 16, animation: 'float 2s ease-in-out infinite' }}>📖</span>
      <p style={{ fontWeight: 700, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Loading stories…</p>
    </div>
  );

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #6FBF73 0%, #4FC3F7 50%, #87CEEB 100%)',
        padding: '32px 40px 28px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-10px', fontSize: '120px', opacity: 0.1, transform: 'rotate(15deg)', pointerEvents: 'none' }}>📖</div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2rem',
          fontWeight: 800,
          color: 'white',
          marginBottom: 6,
          textShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}>
          Reading World 📖
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.9)',
          fontSize: '0.95rem',
          fontWeight: 600,
          marginBottom: 16,
        }}>
          Explore magical stories, discover new worlds, and grow your reading skills!
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
            borderRadius: 999, padding: '6px 16px',
            color: 'white', fontSize: 13, fontWeight: 700,
          }}>📚 {stories.length} Stories</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
            borderRadius: 999, padding: '6px 16px',
            color: 'white', fontSize: 13, fontWeight: 700,
          }}>🌍 English · हिंदी · मराठी</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
            borderRadius: 999, padding: '6px 16px',
            color: 'white', fontSize: 13, fontWeight: 700,
          }}>⭐ 3 Difficulty Levels</span>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, padding: '28px 32px 40px', display: 'flex', flexDirection: 'column' }}>
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
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--color-text)',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span>⭐</span> Featured Stories
            </h2>
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
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>
                      <span style={{
                        display:'inline-block', padding:'3px 10px', borderRadius:999,
                        fontSize:11, fontWeight:700,
                        background:'rgba(111,191,115,0.15)', color:'#4E9F52',
                      }}>Age {story.age_group}</span>
                      <span style={{
                        display:'inline-block', padding:'3px 10px', borderRadius:999,
                        fontSize:11, fontWeight:700,
                        background:'rgba(124,77,255,0.1)', color:'#7C4DFF',
                      }}>{story.difficulty}</span>
                    </div>
                    <p className={s.featTime}>⏱ {story.estimated_time}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Milestone Activities Section - Only for age 0-3 */}
        <MilestoneActivities />

        {/* Milestone Catalog Activities - Comprehensive catalog for ages 0-36 months */}
        <MilestoneCatalogActivities />

        {/* Bookmarks row */}
        {bookmarkedStories.length > 0 && (
          <>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--color-text)',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span>🔖</span> Bookmarked
            </h2>
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
          <input className={s.searchInput} type="text"
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
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.25rem',
          fontWeight: 800,
          color: 'var(--color-text)',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span>📚</span> All Stories
          <span style={{fontSize:13,fontWeight:600,color:"var(--color-text-secondary)",marginLeft:4}}>
            ({filtered.length} found)
          </span>
        </h2>
        {filtered.length===0
          ? <div className={s.empty}><span>📭</span><p>No stories match your filters. Try changing the search!</p></div>
          : <div className={s.grid} style={{ flex: 1 }}>
              {filtered.map(story=>(
                <StoryCard key={story.id} story={story} onClick={setActive}
                  bookmarked={bookmarks.includes(story.id)}
                  onBookmark={e=>toggleBookmark(story.id,e)} />
              ))}
            </div>
        }
      </div>

      {active && <StoryReader story={active} onClose={()=>setActive(null)} />}
    </div>
  );
}
