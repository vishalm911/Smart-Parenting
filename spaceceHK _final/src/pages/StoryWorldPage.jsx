// src/pages/StoryWorldPage.jsx
import { useState, useEffect } from "react";
import StoryCard from "../components/StoryCard";
import StoryReader from "../components/StoryReader";
import { getStories } from "../firebase/firestoreService";
import { storiesData as defaultStories } from "../data/storiesData";
import s from "./StoryWorldPage.module.css";

const PROGRESS_KEY = "storyProgress"; // { [storyId]: { page, completed } }

function getProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}"); } catch { return {}; }
}
function setProgress(storyId, data) {
  const all = getProgress();
  all[storyId] = { ...all[storyId], ...data };
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
}

export default function StoryWorldPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive]   = useState(null);
  const [activeStartPage, setActiveStartPage] = useState(0);
  const [progress, setProgressState] = useState(getProgress());

  useEffect(() => {
    getStories().then(fs => {
      setStories(fs.length ? fs : defaultStories);
      setLoading(false);
    });
  }, []);

  // Refresh progress from localStorage when a story closes
  const handleClose = () => {
    setActiveStartPage(0);
    setActive(null);
    setProgressState(getProgress());
  };

  const openStory = (story, startPage = 0) => {
    setActiveStartPage(startPage);
    setActive(story);
  };

  if (loading) return (
    <div className="page-wrap">
      <div style={{textAlign:"center",padding:80,color:"var(--color-text-secondary)"}}>
        <span style={{fontSize:48}}>📚</span>
        <p style={{marginTop:16,fontWeight:600}}>Loading stories…</p>
      </div>
    </div>
  );

  const prog = getProgress();

  // In-progress: has a saved page > 0 and not completed
  const inProgressStory = stories.find(st => {
    const p = prog[st.id];
    return p && p.page > 0 && !p.completed;
  }) || stories.find(st => prog[st.id]?.completed === false) || null;

  // Completed stories
  const completedStories = stories.filter(st => prog[st.id]?.completed);

  // All stories sorted: in-progress first, then rest
  const allStories = stories;

  return (
    <div className="page-wrap">
      <div className="hero-banner" style={{ background:"var(--gradient-warm)" }}>
        <h1>Story World 🌟</h1>
        <p>Read with audio, answer questions, and earn stars for every story you finish!</p>
        <div className="hero-badges">
          <span className="hero-badge">🔊 Audio Ready</span>
          <span className="hero-badge">❓ Comprehension Quiz</span>
          <span className="hero-badge">⭐ Earn Stars</span>
        </div>
        <div className="hero-deco">🌟</div>
      </div>

      {/* Continue Reading */}
      {inProgressStory && (() => {
        const p = prog[inProgressStory.id];
        const resumePage = p?.page || 0;
        const total = inProgressStory.pages?.length || 1;
        const pct = Math.round(((resumePage) / total) * 100);
        return (
          <>
            <h2 className="sec-title"><span>▶️</span> Continue Reading</h2>
            <div className={s.continueCard}>
              <div className={s.continueCover} style={{ background: inProgressStory.cover_gradient }}>
                {inProgressStory.emoji}
              </div>
              <div className={s.continueInfo}>
                <h3>{inProgressStory.title}</h3>
                <p>{total} pages · Age {inProgressStory.age_group} · {inProgressStory.difficulty}</p>
                <div className={s.progWrap}>
                  <div className={s.progBar} style={{ width:`${pct}%` }} />
                </div>
                <p className={s.progLabel}>{pct}% completed · Page {resumePage + 1} of {total}</p>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginTop:4 }}>
                  <button className="btn btn-primary" onClick={() => openStory(inProgressStory, resumePage)}>
                    ▶ Continue
                  </button>
                  <button className="btn btn-ghost" onClick={() => openStory(inProgressStory, 0)}>
                    🔄 Restart
                  </button>
                </div>
              </div>
            </div>
          </>
        );
      })()}

      {/* Completed Stories */}
      {completedStories.length > 0 && (
        <>
          <h2 className="sec-title" style={{ marginTop:32 }}><span>🏆</span> Completed Stories</h2>
          <div className={s.grid}>
            {completedStories.map(story => (
              <div key={story.id} style={{ position:"relative" }}>
                <StoryCard story={story} onClick={() => openStory(story, 0)} />
                <div className={s.completedBadge}>✅ Completed</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* All Stories */}
      <h2 className="sec-title" style={{ marginTop:32 }}><span>📚</span> All Stories</h2>
      <div className={s.grid}>
        {allStories.map(story => (
          <StoryCard key={story.id} story={story} onClick={() => openStory(story, 0)} />
        ))}
      </div>

      {active && (
        <StoryReader
          story={active}
          startPage={activeStartPage}
          onPageChange={(page) => setProgress(active.id, { page, completed: false })}
          onComplete={() => setProgress(active.id, { completed: true })}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
