// src/pages/StoryWorldPage.jsx
import { useState, useEffect } from "react";
import StoryCard from '../../components/literacy/StoryCard';
import StoryReader from '../../components/literacy/StoryReader';
import MilestoneCatalogActivities from '../../components/child/MilestoneCatalogActivities';
import { getStories } from '../../api/literacyService';
import { storiesData as defaultStories } from '../../data/storiesData';
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
    <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '40px' }}>
      <span style={{ fontSize: 56, marginBottom: 16, animation: 'float 2s ease-in-out infinite' }}>📚</span>
      <p style={{ fontWeight: 700, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Loading stories…</p>
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
    <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Banner */}
      <div style={{
        background: 'var(--gradient-warm)',
        padding: '32px 40px 28px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-10px', fontSize: '120px', opacity: 0.1, transform: 'rotate(15deg)', pointerEvents: 'none' }}>🌟</div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2rem',
          fontWeight: 800,
          color: 'white',
          marginBottom: 6,
          textShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}>
          Story World 🌟
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.9)',
          fontSize: '0.95rem',
          fontWeight: 600,
          marginBottom: 16,
        }}>
          Read with audio, answer questions, and earn stars for every story you finish!
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
            borderRadius: 999, padding: '6px 16px',
            color: 'white', fontSize: 13, fontWeight: 700,
          }}>🔊 Audio Ready</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
            borderRadius: 999, padding: '6px 16px',
            color: 'white', fontSize: 13, fontWeight: 700,
          }}>❓ Comprehension Quiz</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
            borderRadius: 999, padding: '6px 16px',
            color: 'white', fontSize: 13, fontWeight: 700,
          }}>⭐ Earn Stars</span>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, padding: '28px 32px 40px', display: 'flex', flexDirection: 'column' }}>

        {/* Milestone Catalog Activities - Comprehensive catalog for ages 0-36 months */}
        <MilestoneCatalogActivities />

        {/* Continue Reading */}
      {inProgressStory && (() => {
        const p = prog[inProgressStory.id];
        const resumePage = p?.page || 0;
        const total = inProgressStory.pages?.length || 1;
        const pct = Math.round(((resumePage) / total) * 100);
        return (
          <>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>▶️</span> Continue Reading
            </h2>
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
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)', marginTop: 32, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🏆</span> Completed Stories
          </h2>
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
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)', marginTop: 32, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>📚</span> All Stories
      </h2>
      <div className={s.grid}>
        {allStories.map(story => (
          <StoryCard key={story.id} story={story} onClick={() => openStory(story, 0)} />
        ))}
      </div>

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
