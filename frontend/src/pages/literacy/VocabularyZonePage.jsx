// src/pages/VocabularyZonePage.jsx
import { useState, useCallback, useEffect } from "react";
import { getVocabularyGames, getWordBuilderList, getPictureMatchItems } from '../../api/literacyService';
import { vocabData as defaultVocab, wordBuilderList as defaultWB } from '../../data/storiesData';
import { speakText } from '../../utils/helpers';
import s from "./VocabularyZonePage.module.css";

/* ── TTS ── */
const speakWord = (word) => speakText(word);

/* ── DEFAULT PICTURE MATCH ITEMS ── */
const DEFAULT_MATCH_ITEMS = [
  {id:"pm1", word:"Dog",   emoji:"🐶"}, {id:"pm2", word:"Cat",   emoji:"🐱"},
  {id:"pm3", word:"Bird",  emoji:"🐦"}, {id:"pm4", word:"Fish",  emoji:"🐠"},
  {id:"pm5", word:"Tree",  emoji:"🌳"}, {id:"pm6", word:"Sun",   emoji:"☀️"},
  {id:"pm7", word:"Moon",  emoji:"🌙"}, {id:"pm8", word:"Apple", emoji:"🍎"},
  {id:"pm9", word:"House", emoji:"🏠"}, {id:"pm10",word:"Flower",emoji:"🌸"},
];

/* ── PICTURE MATCH GAME ── */
function PictureMatchGame({ items }) {
  const pick = () => {
    const pool = items.length >= 4 ? items : DEFAULT_MATCH_ITEMS;
    const shuffled = [...pool].sort(()=>Math.random()-.5).slice(0,4);
    const target   = shuffled[Math.floor(Math.random()*4)];
    return { items: shuffled.sort(()=>Math.random()-.5), target };
  };
  const [q, setQ]         = useState(pick);
  const [answered, setAns]= useState(null);
  const [fb, setFb]       = useState("");
  const [score, setScore] = useState({ correct:0, total:0 });

  // Refresh when items change
  useEffect(() => { setQ(pick()); setAns(null); setFb(""); }, [items.length]);

  const answer = (i) => {
    if (answered !== null) return;
    const correct = q.items[i].word === q.target.word;
    setAns(i);
    setFb(correct ? "🎉 Correct!" : "❌ Wrong!");
    setScore(prev => ({ correct: prev.correct + (correct?1:0), total: prev.total + 1 }));
    setTimeout(() => { setQ(pick()); setAns(null); setFb(""); }, 1200);
  };

  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

  return (
    <div className={s.gameBox}>
      <h3 className={s.gameTitle}>🎯 Picture Match</h3>
      <p style={{fontSize:13,color:"var(--color-text-secondary)",marginBottom:8,fontWeight:600}}>
        Listen to the word and tap the correct picture!
      </p>
      <div style={{display:"flex",gap:16,justifyContent:"center",marginBottom:16,fontSize:13,fontWeight:700}}>
        <span>✅ {score.correct}/{score.total}</span>
        <span>📊 {accuracy}%</span>
      </div>
      <div className={s.targetWord}>
        <span className={s.targetText}>{q.target.word}</span>
        <button className={s.speakBtn} onClick={()=>speakWord(q.target.word)} title="Hear the word">🔊 Hear it</button>
      </div>
      <div className={s.pictureGrid}>
        {q.items.map((item,i)=>(
          <div key={i}
            className={`${s.pictureCard} ${
              answered!==null
                ? item.word===q.target.word ? s.picCorrect
                : i===answered ? s.picWrong : s.picDim
                : ""
            }`}
            onClick={()=>answer(i)}>
            <span className={s.picEmoji}>{item.emoji}</span>
            <span className={s.picLabel}>{item.word}</span>
          </div>
        ))}
      </div>
      {fb && <p className={`${s.gameFb} ${fb.includes("🎉")?s.fbOk:s.fbErr}`}>{fb}</p>}
    </div>
  );
}

/* ── WORD BUILDER GAME ── */
function WordBuilderGame({ wordList }) {
  const make = useCallback(() => {
    if (!wordList.length) return null;
    const w = wordList[Math.floor(Math.random()*wordList.length)];
    return { ...w, shuffled: w.word.split("").sort(()=>Math.random()-.5), placed: Array(w.word.length).fill(null), usedIdx:[] };
  }, [wordList]);

  const [wb, setWb] = useState(null);
  const [fb, setFb] = useState("");
  const [score, setScore] = useState({ correct:0, total:0 });

  useEffect(() => { if (wordList.length) setWb(make()); }, [wordList, make]);

  const addLetter = (i) => {
    if (!wb || wb.usedIdx.includes(i)) return;
    const slot = wb.placed.indexOf(null);
    if (slot === -1) return;
    setWb(p => { const placed=[...p.placed]; placed[slot]=p.shuffled[i]; return {...p,placed,usedIdx:[...p.usedIdx,i]}; });
    setFb("");
  };
  const removeSlot = (i) => {
    if (!wb || !wb.placed[i]) return;
    setWb(p => {
      const letter = p.placed[i];
      const srcIdx = p.shuffled.findIndex((l,idx)=>l===letter&&p.usedIdx.includes(idx));
      const placed = [...p.placed]; placed[i]=null;
      return {...p,placed,usedIdx:p.usedIdx.filter(x=>x!==srcIdx)};
    });
    setFb("");
  };
  const check = () => {
    if (!wb) return;
    if (wb.placed.includes(null)) { setFb("⚠️ Fill all letters first!"); return; }
    const correct = wb.placed.join("") === wb.word;
    setScore(prev => ({ correct: prev.correct + (correct?1:0), total: prev.total + 1 }));
    setFb(correct ? "🎉 Correct! Great job!" : "❌ Not quite! Try again.");
    if (correct) setTimeout(() => { setWb(make()); setFb(""); }, 1400);
  };
  const reset = () => { setWb(make()); setFb(""); };

  if (!wb) return <p style={{textAlign:"center",padding:32,color:"var(--color-text-secondary)"}}>Loading words…</p>;

  const accuracy = wb && score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

  return (
    <div className={s.gameBox}>
      <h3 className={s.gameTitle}>🔡 Word Builder</h3>
      <p style={{fontSize:13,color:"var(--color-text-secondary)",marginBottom:8,fontWeight:600}}>
        Tap letters in the right order to build the word!
      </p>
      <div style={{display:"flex",gap:16,justifyContent:"center",marginBottom:16,fontSize:13,fontWeight:700}}>
        <span>✅ {score.correct}/{score.total}</span>
        <span>📊 {accuracy}%</span>
      </div>
      <div className={s.wbTarget}>
        <span className={s.wbEmoji}>{wb.emoji}</span>
        <p className={s.wbHint}>{wb.hint}</p>
        <button className={s.speakBtn} onClick={()=>speakWord(wb.word.toLowerCase())}>🔊 Hear it</button>
      </div>
      <div className={s.wbSlots}>
        {wb.placed.map((l,i)=>(
          <div key={i}
            className={`${s.wbSlot} ${l?s.slotFilled:""} ${fb.includes("🎉")?s.slotCorrect:""}`}
            onClick={()=>removeSlot(i)}>
            {l}
          </div>
        ))}
      </div>
      <div className={s.wbLetters}>
        {wb.shuffled.map((l,i)=>(
          <div key={i}
            className={`${s.wbLetter} ${wb.usedIdx.includes(i)?s.letterUsed:""}`}
            onClick={()=>addLetter(i)}>
            {l}
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:16,flexWrap:"wrap"}}>
        <button className="btn btn-ghost" onClick={reset}>🔄 New Word</button>
        <button className="btn btn-primary" onClick={check}>✅ Check!</button>
      </div>
      {fb && <p className={`${s.gameFb} ${fb.includes("🎉")?s.fbOk:fb.includes("❌")?s.fbErr:s.fbWarn}`}>{fb}</p>}
    </div>
  );
}

/* ── PAGE ── */
export default function VocabularyZonePage() {
  const [vocabList, setVocabList]       = useState([]);
  const [wbList, setWbList]             = useState([]);
  const [matchItems, setMatchItems]     = useState([]);
  const [loadingVocab, setLoadingV]     = useState(true);
  const [loadingWB, setLoadingWB]       = useState(true);
  const [loadingMatch, setLoadingMatch] = useState(true);
  const [flipped, setFlipped]           = useState({});
  const [tab, setTab]                   = useState("match");

  useEffect(() => {
    getVocabularyGames().then(fs => {
      setVocabList(fs.length ? fs : defaultVocab);
      setLoadingV(false);
    });
    getWordBuilderList().then(fs => {
      setWbList(fs.length ? fs : defaultWB);
      setLoadingWB(false);
    });
    getPictureMatchItems().then(fs => {
      setMatchItems(fs.length ? fs : DEFAULT_MATCH_ITEMS);
      setLoadingMatch(false);
    });
  }, []);

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Banner */}
      <div style={{
        background: 'var(--gradient-cosmic)',
        padding: '32px 40px 28px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-10px', fontSize: '120px', opacity: 0.1, transform: 'rotate(15deg)', pointerEvents: 'none' }}>🔤</div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2rem',
          fontWeight: 800,
          color: 'white',
          marginBottom: 6,
          textShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}>
          Vocabulary Zone 🔤
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.9)',
          fontSize: '0.95rem',
          fontWeight: 600,
          marginBottom: 16,
        }}>
          Learn new words, play matching games, and build your vocabulary!
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
            borderRadius: 999, padding: '6px 16px',
            color: 'white', fontSize: 13, fontWeight: 700,
          }}>🎯 Picture Match</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
            borderRadius: 999, padding: '6px 16px',
            color: 'white', fontSize: 13, fontWeight: 700,
          }}>🔡 Word Builder</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
            borderRadius: 999, padding: '6px 16px',
            color: 'white', fontSize: 13, fontWeight: 700,
          }}>🃏 Flashcards</span>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, padding: '28px 32px 40px', display: 'flex', flexDirection: 'column' }}>

      {/* Tabs */}
      <div className={s.tabs}>
        {[["match","🎯 Picture Match"],["builder","🔡 Word Builder"],["flashcards","🃏 Flashcards"]].map(([id,label])=>(
          <button key={id} className={`${s.tab} ${tab===id?s.tabActive:""}`} onClick={()=>setTab(id)}>{label}</button>
        ))}
      </div>

      {/* PICTURE MATCH */}
      {tab==="match" && (
        loadingMatch
          ? <div className={s.gameBox}><p style={{textAlign:"center",padding:32,color:"var(--color-text-secondary)"}}>Loading…</p></div>
          : <PictureMatchGame items={matchItems} />
      )}

      {/* WORD BUILDER */}
      {tab==="builder" && (
        loadingWB
          ? <div className={s.gameBox}><p style={{textAlign:"center",padding:32,color:"var(--color-text-secondary)"}}>Loading words…</p></div>
          : <WordBuilderGame wordList={wbList} />
      )}

      {/* FLASHCARDS */}
      {tab==="flashcards" && (
        <div className={s.gameBox}>
          <h3 className={s.gameTitle}>🃏 Vocabulary Flashcards</h3>
          <p style={{fontSize:13,color:"var(--color-text-secondary)",marginBottom:18,fontWeight:600}}>
            Tap a card to flip it and see the meaning. Click 🔊 to hear the word!
          </p>
          {loadingVocab ? (
            <p style={{textAlign:"center",padding:32,color:"var(--color-text-secondary)"}}>Loading flashcards…</p>
          ) : (
            <div className={s.flashGrid}>
              {vocabList.map((v,idx)=>(
                <div key={v.id||idx}
                  className={`${s.flashCard} ${flipped[v.id||idx]?s.flipped:""}`}
                  onClick={()=>setFlipped(p=>({...p,[v.id||idx]:!p[v.id||idx]}))}>
                  {!flipped[v.id||idx] ? (
                    <>
                      <span className={s.flashEmoji}>{v.emoji}</span>
                      <div className={s.flashWord}>{v.word}</div>
                      <button className={s.flashSpeak} onClick={e=>{e.stopPropagation();speakWord(v.word);}}>🔊</button>
                    </>
                  ) : (
                    <>
                      <span className={s.flashEmoji} style={{fontSize:32}}>{v.emoji}</span>
                      <div className={s.flashMeaning}>{v.meaning}</div>
                      <span className="tag tag-age" style={{marginTop:8}}>Age {v.age_group}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      </div>
    </div>
  );
}
