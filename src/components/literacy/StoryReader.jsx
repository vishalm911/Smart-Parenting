// src/components/StoryReader.jsx
// Full-screen reader: TTS narration, highlighting, multiple quiz support, completion screen
import { useState, useEffect, useRef } from "react";
import { useUser } from '../../context/UserContext';
import { saveLanguageScore, getStories } from '../../firebase/literacyService';
import { storiesData as defaultStories } from '../../data/storiesData';
import s from "./StoryReader.module.css";

/* TTS helper */
const speak = (text, onEnd) => {
  if (!window.speechSynthesis) { onEnd?.(); return; }
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text.replace(/<[^>]+>/g,""));
  utt.rate  = 0.85;
  utt.pitch = 1.1;
  utt.lang  = "en-US";
  utt.onend = () => onEnd?.();
  window.speechSynthesis.speak(utt);
};
const stopSpeak = () => window.speechSynthesis?.cancel();

export default function StoryReader({ story, startPage = 0, onPageChange, onComplete, onClose }) {
  const { user }     = useUser();
  const [page, setPage]         = useState(startPage);
  const [speaking, setSpeaking] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);       // which quiz question we're on
  const [showQuiz, setShowQuiz] = useState(false);
  const [selected, setSelected] = useState(null);
  const [quizResults, setQuizResults] = useState([]);  // array of {correct, selected}
  const [showComplete, setShowComplete] = useState(false);
  const [stars, setStars]       = useState(0);
  const [saved, setSaved]       = useState(false);
  const [allStories, setAllStories] = useState([]);
  const startTime               = useRef(Date.now());

  if (!story) return null;

  // Support both old `quiz` (single) and new `quizzes` (array)
  const allQuizzes = story.quizzes?.length
    ? story.quizzes
    : story.quiz?.question
    ? [story.quiz]
    : [];

  const hasQuiz = allQuizzes.length > 0;
  const currentQuiz = allQuizzes[quizIndex];

  const total   = story.pages.length;
  const isLast  = page === total - 1;
  const progress= Math.round(((page+1)/total)*100);

  useEffect(() => {
    getStories().then(fs => setAllStories(fs.length ? fs : defaultStories));
  }, []);

  useEffect(() => () => stopSpeak(), []);

  const goToPage = (newPage) => {
    setPage(newPage);
    onPageChange?.(newPage);
  };

  const handleSpeak = () => {
    if (speaking) { stopSpeak(); setSpeaking(false); return; }
    setSpeaking(true);
    speak(story.pages[page], () => setSpeaking(false));
  };

  const handleNext = () => {
    stopSpeak(); setSpeaking(false);
    if (isLast) {
      if (hasQuiz) setShowQuiz(true);
      else finishWithoutQuiz();
    }
    else { goToPage(page + 1); }
  };

  const finishWithoutQuiz = () => {
    onComplete?.();
    setStars(1);
    setShowComplete(true);
  };

  const handleAnswer = async (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === currentQuiz.correct;
    const newResults = [...quizResults, { correct, selected: idx }];
    setQuizResults(newResults);

    // After delay, move to next quiz or finish
    setTimeout(async () => {
      if (quizIndex < allQuizzes.length - 1) {
        // More quiz questions
        setQuizIndex(qi => qi + 1);
        setSelected(null);
      } else {
        // All quizzes done — calculate score
        const totalCorrect = newResults.filter(r=>r.correct).length;
        const pct = Math.round((totalCorrect / newResults.length) * 100);
        const earnedStars = pct === 100 ? 3 : pct >= 50 ? 2 : 1;
        setStars(earnedStars);

        if (user && !saved) {
          const timeTaken = Math.round((Date.now()-startTime.current)/1000);
          await saveLanguageScore(user.uid, story.id, {
            score: pct, accuracy: pct===100?1:0, time_taken: timeTaken,
            username: user.displayName || null,
          });
          setSaved(true);
        }
        onComplete?.();
        setShowComplete(true);
      }
    }, 1200);
  };

  const nextStory = allStories.find(
    st => st.id!==story.id && st.age_group===story.age_group
  );

  const onBackdrop = e => { if(e.target===e.currentTarget){ stopSpeak(); onClose(); } };

  const correctCount = quizResults.filter(r=>r.correct).length;
  const finalPct = quizResults.length ? Math.round((correctCount/quizResults.length)*100) : (stars===3?100:50);

  /* COMPLETION SCREEN */
  if (showComplete) return (
    <div className={s.overlay} onClick={onBackdrop}>
      <div className={s.box}>
        <div className={s.completeScreen}>
          <div className={s.completeEmoji}>🎉</div>
          <h2 className={s.completeTitle}>Story Complete!</h2>
          <div className={s.starsRow}>
            {[1,2,3].map(i=>(
              <span key={i} className={`${s.star} ${i<=stars?s.starOn:""}`}>⭐</span>
            ))}
          </div>
          <p className={s.completeSub}>
            {stars===3?"Perfect score! You're a reading champion! 🏆"
            :stars===2?"Great job! Keep reading to get a perfect score! 🌟"
            :"Good try! Keep reading to improve your score!"}
          </p>

          <div className={s.scoreCard}>
            <div className={s.scoreItem}>
              <span className={s.scoreNum}>{finalPct}%</span>
              <span className={s.scoreLabel}>Comprehension</span>
            </div>
            <div className={s.scoreItem}>
              <span className={s.scoreNum}>{story.pages.length}</span>
              <span className={s.scoreLabel}>Pages Read</span>
            </div>
            <div className={s.scoreItem}>
              <span className={s.scoreNum}>{stars}⭐</span>
              <span className={s.scoreLabel}>Stars Earned</span>
            </div>
            {allQuizzes.length > 1 && (
              <div className={s.scoreItem}>
                <span className={s.scoreNum}>{correctCount}/{quizResults.length}</span>
                <span className={s.scoreLabel}>Correct Answers</span>
              </div>
            )}
          </div>

          {nextStory && (
            <div className={s.nextStory}>
              <p className={s.nextLabel}>📖 Read Next:</p>
              <div className={s.nextCard} onClick={()=>{ onClose(); }}>
                <span style={{fontSize:32}}>{nextStory.emoji}</span>
                <div>
                  <div style={{fontWeight:800,fontSize:15}}>{nextStory.title}</div>
                  <div style={{fontSize:12,color:"var(--color-text-secondary)"}}>{nextStory.difficulty} · {nextStory.estimated_time}</div>
                </div>
                <span style={{marginLeft:"auto",fontSize:20}}>→</span>
              </div>
            </div>
          )}

          <button className="btn btn-primary" style={{marginTop:16,width:"100%",justifyContent:"center"}}
            onClick={()=>{ stopSpeak(); onClose(); }}>
            ✅ Done Reading
          </button>
        </div>
      </div>
    </div>
  );

  /* QUIZ SCREEN */
  if (showQuiz && currentQuiz) return (
    <div className={s.overlay} onClick={onBackdrop}>
      <div className={s.box}>
        <button className={s.closeBtn} onClick={()=>{ stopSpeak(); onClose(); }}>✕</button>
        <div className={s.quizHeader}>
          <span style={{fontSize:48}}>{story.emoji}</span>
          <h2 className={s.title}>{story.title}</h2>
          <p style={{fontSize:13,color:"var(--color-text-secondary)",fontWeight:600}}>
            📝 Question {quizIndex+1} of {allQuizzes.length}
          </p>
          {allQuizzes.length > 1 && (
            <div style={{display:"flex",gap:6,justifyContent:"center",marginTop:4}}>
              {allQuizzes.map((_,i)=>(
                <div key={i} style={{
                  width:10,height:10,borderRadius:"50%",
                  background: i<quizIndex
                    ? (quizResults[i]?.correct ? "var(--color-success)" : "var(--color-error)")
                    : i===quizIndex ? "var(--color-secondary)" : "var(--color-border)"
                }}/>
              ))}
            </div>
          )}
        </div>
        <div className={s.quizBox}>
          <h4 className={s.quizQ}>{currentQuiz.question}</h4>
          <div className={s.opts}>
            {currentQuiz.options.map((opt,i)=>(
              <button key={i}
                className={`${s.opt} ${selected!==null?i===currentQuiz.correct?s.correct:i===selected?s.wrong:""  :""}`}
                onClick={()=>handleAnswer(i)} disabled={selected!==null}>
                <span className={s.optLetter}>{["A","B","C","D"][i]}</span>
                {opt}
              </button>
            ))}
          </div>
          {selected!==null && (
            <p className={s.fb}>
              {selected===currentQuiz.correct
                ? quizIndex<allQuizzes.length-1 ? "🎉 Correct! Next question..." : "🎉 Correct! Calculating your score..."
                : "❌ Not quite — the correct answer is highlighted green!"}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  /* MAIN READER */
  return (
    <div className={s.overlay} onClick={onBackdrop}>
      <div className={s.box}>
        <button className={s.closeBtn} onClick={()=>{ stopSpeak(); onClose(); }}>✕</button>

        <div className={s.readerHeader}>
          <span className={s.emoji}>{story.emoji}</span>
          <div>
            <h2 className={s.title}>{story.title}</h2>
            <p className={s.subtitle}>✍️ {story.author||"SpacECE Team"} · {story.estimated_time}</p>
          </div>
        </div>

        <div className={s.tags}>
          <span className="tag tag-age">Age {story.age_group}</span>
          <span className="tag tag-diff">{story.difficulty}</span>
          <span className="tag tag-lang">{story.language}</span>
        </div>

        <div className={s.progWrap}>
          <div className={s.progBar} style={{width:`${progress}%`}} />
        </div>
        <div className={s.progMeta}>
          <span>Page {page+1} of {total}</span>
          <span>{progress}% complete</span>
        </div>

        <button className={`${s.ttsBtn} ${speaking?s.ttsSpeaking:""}`} onClick={handleSpeak}>
          {speaking?"🔇 Stop":"🔊 Read Aloud"}
        </button>

        <div className={`${s.text} ${speaking?s.textHighlighted:""}`}
          dangerouslySetInnerHTML={{__html:story.pages[page]}} />

        <div className={s.actions}>
          {page>0 && (
            <button className="btn btn-ghost" onClick={()=>{stopSpeak();setSpeaking(false);goToPage(page-1);}}>
              ← Previous
            </button>
          )}
          <button className="btn btn-primary" onClick={handleNext}>
            {isLast ? (hasQuiz ? "Take Quiz ❓" : "Finish ✅") : "Next Page →"}
          </button>
        </div>

        <div className={s.dots}>
          {Array.from({length:total}).map((_,i)=>(
            <div key={i} className={`${s.dot} ${i===page?s.dotActive:i<page?s.dotDone:""}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
