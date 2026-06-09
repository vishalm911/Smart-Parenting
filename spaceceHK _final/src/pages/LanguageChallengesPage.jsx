// src/pages/LanguageChallengesPage.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import {
  getSoundMatchData, getObjectRecognitionData, getFluencyPassages, getPhonicsWords,
} from "../firebase/firestoreService";
import {
  soundMatchData as defaultSounds,
  objectRecognitionData as defaultObjects,
  fluencyPassages as defaultPassages,
  challengesData as defaultChallenges,
} from "../data/storiesData";
import s from "./LanguageChallengesPage.module.css";

/* ── TTS with proper animal sound effect ── */
const speak = (text, rate=0.75, onEnd) => {
  if (!window.speechSynthesis) { onEnd?.(); return; }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = rate; u.lang = "en-US"; u.pitch = 1.1;
  if (onEnd) u.onend = onEnd;
  window.speechSynthesis.speak(u);
};
const stopSpeak = () => window.speechSynthesis?.cancel();

/* ── Animal sound: use pitch/rate tricks to make it sound more like the animal ── */
const speakAnimalSound = (soundText, onEnd) => {
  if (!window.speechSynthesis) { onEnd?.(); return; }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(soundText);
  u.lang = "en-US";
  // Adjust pitch/rate based on the sound type
  const low = soundText.toLowerCase();
  if (low.includes("moo"))    { u.pitch = 0.4; u.rate = 0.5; }
  else if (low.includes("roar")) { u.pitch = 0.3; u.rate = 0.4; }
  else if (low.includes("woof") || low.includes("bark")) { u.pitch = 0.7; u.rate = 0.65; }
  else if (low.includes("meow")) { u.pitch = 1.4; u.rate = 0.6; }
  else if (low.includes("cluck")) { u.pitch = 1.5; u.rate = 0.9; }
  else if (low.includes("ribbit")) { u.pitch = 0.6; u.rate = 0.55; }
  else if (low.includes("tweet") || low.includes("chirp")) { u.pitch = 1.8; u.rate = 1.1; }
  else if (low.includes("oink")) { u.pitch = 0.9; u.rate = 0.7; }
  else { u.pitch = 0.8; u.rate = 0.6; }
  if (onEnd) u.onend = onEnd;
  window.speechSynthesis.speak(u);
};

/* ═══════════ SOUND MATCHING ═══════════ */
function SoundMatching({ ageFilter }) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx]         = useState(0);
  const [answered, setAns]    = useState(null);
  const [fb, setFb]           = useState("");
  const [score, setScore]     = useState({c:0,t:0});
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    getSoundMatchData().then(fs => {
      const merged = fs.length ? fs : defaultSounds;
      const filtered = ageFilter === "All" ? merged : merged.filter(x => x.age_group === ageFilter || !x.age_group);
      setData(filtered.length ? filtered : merged);
      setLoading(false);
    });
  }, [ageFilter]);

  const q = data[idx % Math.max(data.length, 1)];

  const playSound = useCallback(() => {
    if (!q) return;
    setSpeaking(true);
    speakAnimalSound(q.sound, () => setSpeaking(false));
  }, [q]);

  useEffect(() => { if (!loading && q) setTimeout(playSound, 500); }, [idx, loading]);
  useEffect(() => () => stopSpeak(), []);

  if (loading) return <div className={s.actBox}><p style={{textAlign:"center",padding:32}}>Loading sounds…</p></div>;
  if (!q) return <div className={s.actBox}><p>No sound questions for this age group.</p></div>;

  const answer = (i) => {
    if (answered !== null) return;
    stopSpeak(); setSpeaking(false);
    const correct = i === Number(q.answer);
    setAns(i);
    setFb(correct ? "🎉 Correct! Great ear!" : "❌ Oops! Listen again next time.");
    setScore(sc => ({ c: sc.c + (correct?1:0), t: sc.t + 1 }));
    setTimeout(() => { setIdx(n => n+1); setAns(null); setFb(""); }, 1600);
  };

  return (
    <div className={s.actBox}>
      <div className={s.actHead}>
        <h3 className={s.actTitle}>🔊 Sound Matching</h3>
        <span className={s.actScore}>✅ {score.c}/{score.t}</span>
      </div>
      <p className={s.actSub}>Listen carefully — which animal makes this sound?</p>
      <div className={s.soundPromptRow}>
        <p className={s.soundPromptText}>{q.prompt}</p>
        <button className={`${s.playBtn} ${speaking?s.playing:""}`} onClick={playSound}>
          {speaking ? "🔇 Stop" : "🔊 Play Sound"}
        </button>
      </div>
      <div className={s.soundGrid}>
        {q.animals?.map((a,i) => (
          <div key={i}
            className={`${s.soundCard} ${answered!==null ? i===Number(q.answer)?s.soundOk : i===answered?s.soundErr : s.soundDim : ""}`}
            onClick={() => answer(i)}>
            <span className={s.soundAnimal}>{a}</span>
            <span className={s.soundLabel}>{q.labels?.[i]}</span>
          </div>
        ))}
      </div>
      {fb && <p className={`${s.gameFb} ${fb.includes("🎉")?s.fbOk:s.fbErr}`}>{fb}</p>}
    </div>
  );
}

/* ═══════════ ALPHABET ADVENTURE ═══════════ */
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
function AlphabetAdventure() {
  const [current, setCurrent] = useState(0);
  const [matched, setMatched] = useState([]);
  const [selected, setSelected] = useState(null);
  const [fb, setFb] = useState("");

  const letter = ALPHABET[current % 26];
  const lower  = letter.toLowerCase();
  const opts   = [lower, ALPHABET[(current+3)%26].toLowerCase(), ALPHABET[(current+7)%26].toLowerCase(), ALPHABET[(current+11)%26].toLowerCase()].sort(()=>Math.random()-.5);

  const pick = (opt) => {
    if (selected) return;
    setSelected(opt);
    if (opt === lower) {
      setFb(`✅ "${letter}" matches "${lower}"! Great!`);
      setMatched(m => [...m, letter]);
      speak(`${letter} says ${lower}`, 0.8);
      setTimeout(() => { setCurrent(c=>c+1); setSelected(null); setFb(""); }, 1400);
    } else {
      speak(opt, 0.8);
      setFb(`❌ Not quite! "${letter}" matches "${lower}"`);
      setTimeout(() => { setSelected(null); setFb(""); }, 1400);
    }
  };

  return (
    <div className={s.actBox}>
      <div className={s.actHead}>
        <h3 className={s.actTitle}>🔤 Alphabet Adventure</h3>
        <span className={s.actScore}>⭐ {matched.length} matched</span>
      </div>
      <p className={s.actSub}>Tap the lowercase letter that matches the uppercase one!</p>
      <div className={s.alphaCard}>
        <span className={s.bigLetter}>{letter}</span>
        <button className={s.playBtn} onClick={() => speak(letter, 0.7)}>🔊 Hear it</button>
      </div>
      <p style={{textAlign:"center",fontWeight:700,fontSize:14,color:"var(--color-text-secondary)",marginBottom:14}}>Which lowercase letter is this?</p>
      <div className={s.alphaOpts}>
        {opts.map((opt,i) => (
          <button key={i}
            className={`${s.alphaBtn} ${selected ? opt===lower?s.alphaOk : opt===selected?s.alphaErr:"" : ""}`}
            onClick={() => pick(opt)}>{opt}</button>
        ))}
      </div>
      {fb && <p className={`${s.gameFb} ${fb.includes("✅")?s.fbOk:s.fbErr}`}>{fb}</p>}
      <div className={s.alphaProgress}>
        {ALPHABET.slice(0,10).map(l=>(
          <div key={l} className={`${s.alphaDot} ${matched.includes(l)?s.alphaDotDone:""}`}>{l}</div>
        ))}
        {matched.length>10 && <span style={{fontSize:12,color:"var(--color-text-secondary)"}}>+{matched.length-10} more</span>}
      </div>
    </div>
  );
}

/* ═══════════ OBJECT RECOGNITION ═══════════ */
function ObjectRecognition({ ageFilter }) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx]         = useState(0);
  const [answered, setAns]    = useState(null);
  const [fb, setFb]           = useState("");
  const [score, setScore]     = useState({c:0,t:0});

  useEffect(() => {
    getObjectRecognitionData().then(fs => {
      const merged = fs.length ? fs : defaultObjects;
      const filtered = ageFilter === "All" ? merged : merged.filter(x => x.age_group === ageFilter || !x.age_group);
      setData(filtered.length ? filtered : merged);
      setLoading(false);
    });
  }, [ageFilter]);

  const q = data[idx % Math.max(data.length, 1)];
  useEffect(() => { if (!loading && q) speak(`Tap the ${q.word}`, 0.8); }, [idx, loading]);
  useEffect(() => () => stopSpeak(), []);

  if (loading) return <div className={s.actBox}><p style={{textAlign:"center",padding:32}}>Loading…</p></div>;
  if (!q) return <div className={s.actBox}><p>No questions for this age group.</p></div>;

  const answer = (i) => {
    if (answered !== null) return;
    const correct = i === Number(q.answer);
    setAns(i); setFb(correct ? "🎉 Correct!" : "❌ Try again!");
    setScore(sc => ({ c:sc.c+(correct?1:0), t:sc.t+1 }));
    setTimeout(() => { setIdx(n=>n+1); setAns(null); setFb(""); }, 1300);
  };

  return (
    <div className={s.actBox}>
      <div className={s.actHead}>
        <h3 className={s.actTitle}>👆 Object Recognition</h3>
        <span className={s.actScore}>✅ {score.c}/{score.t}</span>
      </div>
      <div className={s.objPrompt}>
        <span className={s.objWord}>Tap the: <strong>{q.word}</strong></span>
        <button className={s.playBtn} onClick={() => speak(`Tap the ${q.word}`, 0.8)}>🔊</button>
      </div>
      <div className={s.objGrid}>
        {q.items?.map((item,i) => (
          <div key={i}
            className={`${s.objCard} ${answered!==null ? i===Number(q.answer)?s.soundOk : i===answered?s.soundErr : s.soundDim : ""}`}
            onClick={() => answer(i)}>
            <span className={s.objEmoji}>{item}</span>
          </div>
        ))}
      </div>
      {fb && <p className={`${s.gameFb} ${fb.includes("🎉")?s.fbOk:s.fbErr}`}>{fb}</p>}
    </div>
  );
}

/* ═══════════ READING FLUENCY ═══════════ */
function ReadingFluency({ ageFilter }) {
  const [passages, setPassages] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null); // selected passage object
  const [running, setRunning]   = useState(false);
  const [timeLeft, setTime]     = useState(60);
  const [done, setDone]         = useState(false);
  const timerRef                = useRef(null);

  useEffect(() => {
    getFluencyPassages().then(fs => {
      const merged = fs.length ? fs : defaultPassages;
      const filtered = ageFilter === "All" ? merged : merged.filter(x => x.age_group === ageFilter || !x.age_group);
      const finalList = filtered.length ? filtered : merged;
      setPassages(finalList);
      setLoading(false);
    });
  }, [ageFilter]);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const selectPassage = (p) => {
    clearInterval(timerRef.current);
    setSelected(p); setRunning(false); setDone(false); setTime(p.time_limit || 60);
  };

  const start = () => {
    if (!selected) return;
    setRunning(true); setTime(selected.time_limit || 60); setDone(false);
    timerRef.current = setInterval(() => {
      setTime(t => { if (t <= 1) { clearInterval(timerRef.current); setRunning(false); setDone(true); return 0; } return t - 1; });
    }, 1000);
  };

  const backToList = () => {
    clearInterval(timerRef.current);
    setSelected(null); setRunning(false); setDone(false);
  };

  if (loading) return <div className={s.actBox}><p style={{textAlign:"center",padding:32}}>Loading passages…</p></div>;
  if (!passages.length) return <div className={s.actBox}><p>No passages for this age group.</p></div>;

  /* ── PASSAGE READER VIEW ── */
  if (selected) {
    const wordCount = selected.text?.trim().split(/\s+/).length || 0;
    const timeLimit = selected.time_limit || 60;
    const levelColor = selected.level === "Easy" ? "#2e7d32" : selected.level === "Medium" ? "#e08e00" : "#6a1b9a";
    return (
      <div className={s.actBox}>
        <div className={s.actHead}>
          <h3 className={s.actTitle}>⏱️ {selected.title}</h3>
          <span className={s.actScore} style={{color:timeLeft<15?"var(--color-error)":undefined}}>⏰ {timeLeft}s</span>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10,flexWrap:"wrap"}}>
          <span style={{background:"var(--color-bg-elevated)",border:"2px solid var(--color-border)",borderRadius:20,padding:"3px 12px",fontSize:12,fontWeight:700,color:levelColor}}>{selected.level}</span>
          <span style={{fontSize:13,color:"var(--color-text-secondary)",fontWeight:600}}>{wordCount} words · {timeLimit}s timer</span>
          {!running && <button className="btn btn-ghost" style={{padding:"4px 10px",fontSize:12}} onClick={backToList}>← All Passages</button>}
        </div>
        <div className={s.passCard}>
          <p className={s.passText}>{selected.text}</p>
        </div>
        {!running && !done && (
          <div style={{textAlign:"center",marginTop:16}}>
            <button className="btn btn-primary" onClick={start}>▶ Start Timer ({timeLimit}s)</button>
          </div>
        )}
        {running && (
          <div className={s.fluencyBar}>
            <div className={s.fluencyFill} style={{width:`${(timeLeft/timeLimit)*100}%`, background:timeLeft<15?"var(--color-error)":"var(--gradient-cool)"}} />
          </div>
        )}
        {done && (
          <div className={s.fluencyResult}>
            <div className={s.fluencyScore}>
              <span style={{fontSize:36}}>🏁</span>
              <div>
                <div style={{fontFamily:"var(--font-heading)",fontSize:22,fontWeight:800}}>Time's up!</div>
                <div style={{color:"var(--color-text-secondary)",fontSize:14}}>Passage: {wordCount} words total</div>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:12,flexWrap:"wrap"}}>
              <button className="btn btn-primary" onClick={start}>🔄 Try Again</button>
              <button className="btn btn-ghost" onClick={backToList}>📋 Choose Another Passage</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── PASSAGE SELECTION GRID ── */
  const levelColors = { Easy:"#E8F5E9", Medium:"#FFF3E0", Hard:"#F3E5F5" };
  const levelText   = { Easy:"#2e7d32", Medium:"#e08e00", Hard:"#6a1b9a" };
  return (
    <div className={s.actBox}>
      <div className={s.actHead}>
        <h3 className={s.actTitle}>⏱️ Reading Fluency</h3>
        <span className={s.actScore}>{passages.length} Passages</span>
      </div>
      <p className={s.actSub}>Choose a passage and read it aloud as fast and clearly as you can!</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:14,marginTop:12}}>
        {passages.map((p, i) => {
          const wc = p.text?.trim().split(/\s+/).length || 0;
          return (
            <button key={p.id || i}
              onClick={() => selectPassage(p)}
              style={{
                background:"var(--color-bg-card)",border:"2px solid var(--color-border)",
                borderRadius:"var(--radius)",padding:"16px",cursor:"pointer",textAlign:"left",
                transition:"all .18s",boxShadow:"var(--shadow)"
              }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--color-secondary)";e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--color-border)";e.currentTarget.style.transform="translateY(0)";}}
            >
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8,gap:6}}>
                <strong style={{fontSize:15,fontFamily:"var(--font-heading)",color:"var(--color-text)",lineHeight:1.3}}>{p.title}</strong>
                <span style={{background:levelColors[p.level]||"#eee",color:levelText[p.level]||"#333",padding:"2px 8px",borderRadius:10,fontSize:11,fontWeight:700,flexShrink:0}}>{p.level}</span>
              </div>
              <p style={{fontSize:12,color:"var(--color-text-secondary)",margin:"0 0 10px",lineHeight:1.5,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>
                {p.text}
              </p>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <span style={{fontSize:11,fontWeight:700,color:"var(--color-text-secondary)",background:"var(--color-bg-elevated)",padding:"2px 8px",borderRadius:10}}>{wc} words</span>
                <span style={{fontSize:11,fontWeight:700,color:"var(--color-text-secondary)",background:"var(--color-bg-elevated)",padding:"2px 8px",borderRadius:10}}>⏱ {p.time_limit||60}s</span>
                {p.age_group && <span style={{fontSize:11,fontWeight:700,color:"var(--color-text-secondary)",background:"var(--color-bg-elevated)",padding:"2px 8px",borderRadius:10}}>Age {p.age_group}</span>}
              </div>
              <div style={{marginTop:10,textAlign:"center"}}>
                <span style={{background:"var(--gradient-cool)",color:"#fff",padding:"5px 16px",borderRadius:20,fontSize:12,fontWeight:700}}>▶ Start Reading</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════ PHONICS MODE (distinct from Sound Matching) ═══════════ */
function PhonicsMode({ ageFilter }) {
  const [words, setWords]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [idx, setIdx]           = useState(0);
  const [syllIdx, setSyllIdx]   = useState(-1); // which syllable is highlighted
  const [playing, setPlaying]   = useState(false);
  const [score, setScore]       = useState({c:0,t:0});
  const [quizSel, setQuizSel]   = useState(null);

  useEffect(() => {
    getPhonicsWords().then(fs => {
      // Default phonics words
      const defaults = [
        { id:"dp1", word:"cat",     syllables:["cat"],        emoji:"🐱", age_group:"4-6" },
        { id:"dp2", word:"rabbit",  syllables:["rab","bit"],   emoji:"🐰", age_group:"4-6" },
        { id:"dp3", word:"apple",   syllables:["ap","ple"],    emoji:"🍎", age_group:"4-6" },
        { id:"dp4", word:"banana",  syllables:["ba","na","na"],emoji:"🍌", age_group:"4-6" },
        { id:"dp5", word:"elephant",syllables:["el","e","phant"],emoji:"🐘",age_group:"7-10"},
        { id:"dp6", word:"hat",     syllables:["hat"],         emoji:"🎩", age_group:"1-3" },
        { id:"dp7", word:"sun",     syllables:["sun"],         emoji:"☀️", age_group:"1-3" },
        { id:"dp8", word:"butterfly",syllables:["but","ter","fly"],emoji:"🦋",age_group:"7-10"},
        { id:"dp9", word:"dog",     syllables:["dog"],         emoji:"🐶", age_group:"1-3" },
        { id:"dp10",word:"rainbow", syllables:["rain","bow"],  emoji:"🌈", age_group:"4-6" },
      ];
      const merged   = fs.length ? [...fs, ...defaults.filter(d=>!fs.find(f=>f.word===d.word))] : defaults;
      const filtered = ageFilter==="All" ? merged : merged.filter(x=>x.age_group===ageFilter||!x.age_group);
      setWords(filtered.length ? filtered : merged);
      setLoading(false);
    });
  }, [ageFilter]);

  const w = words[idx % Math.max(words.length,1)];
  useEffect(() => () => stopSpeak(), []);

  if (loading) return <div className={s.actBox}><p style={{textAlign:"center",padding:32}}>Loading phonics…</p></div>;
  if (!w) return <div className={s.actBox}><p>No phonics words for this age group.</p></div>;

  const playSyllables = async () => {
    if (playing) { stopSpeak(); setPlaying(false); setSyllIdx(-1); return; }
    setPlaying(true); setQuizSel(null);
    const sylls = w.syllables || [w.word];
    for (let i=0; i<sylls.length; i++) {
      setSyllIdx(i);
      await new Promise(res => speak(sylls[i], 0.6, res));
      await new Promise(res => setTimeout(res, 200));
    }
    // Finally speak the full word
    await new Promise(res => speak(w.word, 0.75, res));
    setSyllIdx(-1); setPlaying(false);
  };

  // Simple quiz: how many syllables?
  const syllableCount = (w.syllables||[w.word]).length;
  const quizOptions   = [...new Set([syllableCount, syllableCount+1, Math.max(1,syllableCount-1), syllableCount+2])].slice(0,4).sort((a,b)=>a-b);

  const answerQuiz = (n) => {
    if (quizSel!==null) return;
    const correct = n===syllableCount;
    setQuizSel(n);
    setScore(sc=>({c:sc.c+(correct?1:0),t:sc.t+1}));
    speak(correct?"Correct!":"Not quite!", 0.85);
    setTimeout(()=>{ setIdx(i=>(i+1)%words.length); setQuizSel(null); setSyllIdx(-1); }, 1500);
  };

  return (
    <div className={s.actBox}>
      <div className={s.actHead}>
        <h3 className={s.actTitle}>🅰️ Phonics Mode</h3>
        <span className={s.actScore}>✅ {score.c}/{score.t}</span>
      </div>
      <p className={s.actSub}>Listen to each syllable, then count how many syllables the word has!</p>

      {/* Word display with syllable highlighting */}
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{fontSize:48,marginBottom:8}}>{w.emoji}</div>
        <div style={{display:"flex",gap:4,justifyContent:"center",flexWrap:"wrap",marginBottom:12}}>
          {(w.syllables||[w.word]).map((syl,i)=>(
            <span key={i} className={`${s.syllable} ${syllIdx===i?s.syllableActive:""}`}>
              {syl}
            </span>
          ))}
        </div>
        <div style={{fontSize:13,color:"var(--color-text-secondary)",marginBottom:16,fontWeight:600}}>
          {syllIdx>=0 ? `Syllable ${syllIdx+1}: "${(w.syllables||[])[syllIdx]}"` : `Word: "${w.word}"`}
        </div>
        <button className={`${s.playBtn} ${playing?s.playing:""}`} onClick={playSyllables} style={{margin:"0 auto"}}>
          {playing?"⏹ Stop":"▶ Play Syllables"}
        </button>
      </div>

      {/* Quiz */}
      <div style={{background:"var(--color-surface)",borderRadius:16,padding:16,marginTop:8}}>
        <p style={{textAlign:"center",fontWeight:700,fontSize:15,marginBottom:12}}>
          How many syllables does <strong>"{w.word}"</strong> have?
        </p>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          {quizOptions.map((n,i)=>(
            <button key={i}
              className={`${s.alphaBtn} ${quizSel!==null ? n===syllableCount?s.alphaOk : n===quizSel?s.alphaErr:"" : ""}`}
              onClick={()=>answerQuiz(n)}
              style={{minWidth:56,fontSize:20,fontWeight:800}}>
              {n}
            </button>
          ))}
        </div>
      </div>

      <button className="btn btn-ghost" style={{marginTop:16,width:"100%"}}
        onClick={()=>{ setIdx(i=>(i+1)%words.length); setQuizSel(null); setSyllIdx(-1); stopSpeak(); setPlaying(false); }}>
        Skip →
      </button>
    </div>
  );
}

/* ═══════════ MAIN PAGE ═══════════ */
// Challenge card data (no Story Comprehension, Phonics is distinct)
const CHALLENGES = [
  { id:1, icon:"🔤", title:"Alphabet Adventure", type:"alphabet",   desc:"Match uppercase to lowercase letters and hear them spoken!",  ageMin:4, ageMax:6,  color:"#F5A623" },
  { id:2, icon:"🔊", title:"Sound Matching",     type:"sound",      desc:"Hear an animal sound and pick the right animal!",              ageMin:1, ageMax:3,  color:"#2EC4B6" },
  { id:3, icon:"👆", title:"Object Recognition", type:"object",     desc:"Tap the correct object when you hear its name.",              ageMin:1, ageMax:3,  color:"#7C4DFF" },
  { id:4, icon:"⏱️", title:"Reading Fluency",    type:"fluency",    desc:"Read a timed passage aloud — how fast can you read?",         ageMin:7, ageMax:10, color:"#FF6B9D" },
  { id:5, icon:"🅰️", title:"Phonics Mode",       type:"phonics",    desc:"Listen to syllables, see them highlighted, count them!",      ageMin:4, ageMax:6,  color:"#FF8A65" },
];

const AGE_FILTERS = [
  { label:"All Ages", value:"All" },
  { label:"Age 1–3",  value:"1-3" },
  { label:"Age 4–6",  value:"4-6" },
  { label:"Age 7–10", value:"7-10" },
];

export default function LanguageChallengesPage() {
  const [active, setActive]     = useState(null);
  const [ageFilter, setAgeFilter] = useState("All");

  const ageInRange = (c, filter) => {
    if (filter === "All") return true;
    const [min,max] = filter.split("-").map(Number);
    return c.ageMin <= max && c.ageMax >= min;
  };

  const filtered = CHALLENGES.filter(c => ageInRange(c, ageFilter));

  const GAMES = {
    alphabet: <AlphabetAdventure />,
    sound:    <SoundMatching    ageFilter={ageFilter} />,
    object:   <ObjectRecognition ageFilter={ageFilter} />,
    fluency:  <ReadingFluency   ageFilter={ageFilter} />,
    phonics:  <PhonicsMode      ageFilter={ageFilter} />,
  };

  return (
    <div className="page-wrap">
      <div className="hero-banner" style={{background:"var(--gradient-sunset)"}}>
        <h1>Language Challenges 🎯</h1>
        <p>Fun activities for every age — real sounds, alphabets, phonics, reading fluency, and more!</p>
        <div className="hero-badges">
          <span className="hero-badge">🔊 Animal Sounds</span>
          <span className="hero-badge">🔤 Alphabet</span>
          <span className="hero-badge">🅰️ Phonics</span>
          <span className="hero-badge">📖 Fluency Timer</span>
        </div>
        <div className="hero-deco">🎯</div>
      </div>

      {/* Active game */}
      {active && (
        <div style={{marginBottom:24}}>
          <button className="btn btn-ghost" style={{marginBottom:16}} onClick={()=>setActive(null)}>
            ← Back to Challenges
          </button>
          {GAMES[active]}
        </div>
      )}

      {/* Challenge cards */}
      {!active && (
        <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,marginBottom:8}}>
            <h2 className="sec-title" style={{margin:0}}><span>🎯</span> Choose a Challenge</h2>
            {/* Age Filter */}
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {AGE_FILTERS.map(f=>(
                <button key={f.value}
                  onClick={()=>setAgeFilter(f.value)}
                  style={{
                    padding:"6px 14px", borderRadius:20, fontSize:13, fontWeight:700, cursor:"pointer",
                    border: ageFilter===f.value ? "2px solid var(--color-primary)" : "2px solid var(--color-border)",
                    background: ageFilter===f.value ? "var(--color-primary)" : "var(--color-surface)",
                    color: ageFilter===f.value ? "#fff" : "var(--color-text-primary)",
                    transition:"all 0.2s",
                  }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{textAlign:"center",padding:48,color:"var(--color-text-secondary)"}}>
              <span style={{fontSize:48}}>🔍</span>
              <p style={{marginTop:12,fontWeight:600}}>No challenges for this age group.</p>
              <button className="btn btn-ghost" style={{marginTop:8}} onClick={()=>setAgeFilter("All")}>Show All</button>
            </div>
          ) : (
            <div className={s.challengeGrid}>
              {filtered.map(c=>(
                <div key={c.id}
                  className={s.challengeCard}
                  style={{"--accent":c.color}}
                  onClick={()=>setActive(c.type)}>
                  <span className={s.chIcon}>{c.icon}</span>
                  <div className={s.chTitle}>{c.title}</div>
                  <div className={s.chDesc}>{c.desc}</div>
                  <div className={s.chFoot}>
                    <span className="tag tag-age">Age {c.ageMin}–{c.ageMax}</span>
                    <span className={s.chPlay}>▶ Play</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
