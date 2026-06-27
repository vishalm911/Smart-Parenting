/**
 * AssessmentModule.jsx — Age-Based, Randomized Child Assessment
 *
 * Detects the child's age group from their profile (date_of_birth → months,
 * or falls back to age_group string). Pulls 7 randomized questions from the
 * correct pool, excludes already-seen questions, and saves seen-IDs to
 * Firestore after completion.
 *
 * Supported question types:
 *   caregiver  — Yes/No caregiver-observed (0–12 months)
 *   numeracy   — Count floating items
 *   logic      — Pattern completion (what comes next?)
 *   literacy   — First letter / word identification
 *   emotion    — Identify emotion from emoji faces
 *   sort       — Odd-one-out in a set
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Confetti from 'react-confetti';
import { useUser } from '../../context/UserContext';
import {
  updateUserProfile,
  awardProgress,
  getAssessmentSeenIds,
  saveAssessmentSeenIds,
  saveMilestoneAssessmentResult,
} from '../../firebase/services';
import { getAgeGroupKey, selectRandomQuestions, updateSeenIds, isMilestoneAgeGroup } from '../../utils/assessmentUtils';
import { AGE_GROUP_LABELS, DOMAIN_ICONS } from '../../data/assessmentQuestions';
import './AssessmentModule.css';

const TOTAL_QUESTIONS = 7;

/* ──────────────────────────────────────────────────────────────
   COMPONENT
   ────────────────────────────────────────────────────────────── */
export default function AssessmentModule() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, refreshProfile } = useUser();

  const queryParams = new URLSearchParams(location.search);
  const isManualStart = queryParams.get('start') === 'true';

  /* ── Age & Question State ── */
  const [ageGroupKey, setAgeGroupKey]   = useState(null);   // e.g. '2-2.5y'
  const [questions, setQuestions]       = useState([]);     // 7 selected questions
  const [seenIds, setSeenIds]           = useState([]);     // IDs seen before this session
  const [loadingQs, setLoadingQs]       = useState(true);   // fetching seen IDs

  /* ── Screen & Answer State ── */
  // Screens: 0 = welcome, 1–7 = questions, 8 = score
  const [screen, setScreen]     = useState(isManualStart ? 1 : 0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [answers, setAnswers]   = useState([]); // boolean per question (interactive) or {questionId,selectedAnswer,score} (milestone)
  const [showConfetti, setShowConfetti] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [milestoneFeedback, setMilestoneFeedback] = useState(null); // { type: 'Yes'|'Sometimes'|'Not Yet', msg: string }

  /* ── Window dims for Confetti ── */
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const onResize = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* ── Redirect if already completed (unless manual start) ── */
  useEffect(() => {
    if (profile && profile.assessmentCompleted && !isManualStart) {
      navigate('/child/dashboard', { replace: true });
    }
  }, [profile, navigate, isManualStart]);

  /* ── Load age group + question pool on mount ── */
  useEffect(() => {
    if (!profile) return;

    const load = async () => {
      setLoadingQs(true);
      const key = getAgeGroupKey(profile);
      setAgeGroupKey(key);

      // Fetch seen IDs from Firestore
      const uid = user?.uid;
      const existingSeenIds = uid ? await getAssessmentSeenIds(uid) : [];
      setSeenIds(existingSeenIds);

      // Select randomized questions
      const { questions: selected } = selectRandomQuestions(key, existingSeenIds, TOTAL_QUESTIONS);
      setQuestions(selected);
      setLoadingQs(false);
    };

    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  /* ── Current question (screen 1–7 → index 0–6) ── */
  const currentQ = screen >= 1 && screen <= TOTAL_QUESTIONS ? questions[screen - 1] : null;

  /* ── Score ── */
  const isMilestone = isMilestoneAgeGroup(ageGroupKey);

  const score = useMemo(() => {
    if (isMilestone) {
      // Milestone mode: score based on Yes=2, Sometimes=1, Not Yet=0
      if (answers.length === 0) return 0;
      const totalEarned = answers.reduce((sum, a) => sum + (a.score ?? 0), 0);
      const maxPossible = answers.length * 2;
      return Math.round((totalEarned / maxPossible) * 100);
    }
    // Interactive mode: correct/wrong boolean
    const correct = answers.filter(Boolean).length;
    const total = questions.length || TOTAL_QUESTIONS;
    return Math.round((correct / total) * 100);
  }, [answers, questions.length, isMilestone]);

  /* ── Handlers ── */
  const handleSelect = useCallback((value) => {
    if (answered) return;
    setSelected(value);
  }, [answered]);

  /* ── Milestone feedback messages ── */
  const MILESTONE_FEEDBACK = useMemo(() => ({
    'Yes': [
      { icon: '🌟', msg: 'Wonderful! Your child is doing great with this skill!' },
      { icon: '🎉', msg: 'Fantastic! This milestone is right on track!' },
      { icon: '💪', msg: 'Amazing progress! Keep up the great work!' },
      { icon: '⭐', msg: 'Your little one is shining bright with this ability!' },
      { icon: '🏆', msg: 'Superb! This developmental milestone is well achieved!' },
    ],
    'Sometimes': [
      { icon: '🌱', msg: 'Growing beautifully! This skill is developing nicely.' },
      { icon: '💫', msg: 'Almost there! A little more practice and they\'ll master it.' },
      { icon: '🔄', msg: 'Good progress! Every child develops at their own pace.' },
      { icon: '🌈', msg: 'On the right path! Keep encouraging this skill.' },
      { icon: '✨', msg: 'Budding talent! This skill is blossoming day by day.' },
    ],
    'Not Yet': [
      { icon: '💛', msg: 'No worries! Every child blooms in their own time.' },
      { icon: '🤗', msg: 'That\'s perfectly okay! There\'s plenty of time to develop this skill.' },
      { icon: '🌻', msg: 'Every little step counts. This skill will come with time and love!' },
      { icon: '💝', msg: 'Your support matters most. Keep creating opportunities to practice!' },
      { icon: '🕊️', msg: 'All children grow differently. This is completely normal!' },
    ],
  }), []);

  const getRandomFeedback = useCallback((answerType) => {
    const options = MILESTONE_FEEDBACK[answerType] || MILESTONE_FEEDBACK['Not Yet'];
    return options[Math.floor(Math.random() * options.length)];
  }, [MILESTONE_FEEDBACK]);

  const handleSubmitAnswer = useCallback(() => {
    if (selected === null || !currentQ) return;
    if (isMilestone) {
      // Milestone: record the score, show feedback (don't auto-advance)
      const questionScore = currentQ.scoring?.[selected] ?? 0;
      setAnswers(prev => [...prev, { questionId: currentQ.id, selectedAnswer: selected, score: questionScore }]);
      const fb = getRandomFeedback(selected);
      setMilestoneFeedback({ type: selected, ...fb });
      setAnswered(true);
    } else {
      // Interactive: check correct/wrong
      const correct = selected === currentQ.answer;
      setIsCorrect(correct);
      setAnswered(true);
      setAnswers(prev => [...prev, correct]);
    }
  }, [selected, currentQ, isMilestone, getRandomFeedback]);

  const handleNext = useCallback(() => {
    if (screen < TOTAL_QUESTIONS) {
      setScreen(prev => prev + 1);
      setSelected(null);
      setAnswered(false);
      setIsCorrect(false);
      setMilestoneFeedback(null);
    } else {
      setScreen(TOTAL_QUESTIONS + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 8000);
    }
  }, [screen]);

  const handleFinish = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    try {
      const uid = user?.uid;
      if (uid) {
        // 1. Save assessment completion & score
        await updateUserProfile(uid, {
          assessmentCompleted: true,
          assessmentScore: score,
          assessmentAgeGroup: ageGroupKey,
        });

        // 2. Persist newly seen question IDs
        const newSeenIds = updateSeenIds(seenIds, questions.map(q => q.id));
        await saveAssessmentSeenIds(uid, newSeenIds);

        // 3. Award bonus XP / stars / coins
        await awardProgress(uid, {
          xp: 30,
          stars: 3,
          coins: 10,
          module: 'assessment',
        });

        // 4. Save to milestone_assessments collection so the scheduler
        //    knows the assessment was completed (prevents repeat popup)
        const domainScores = {};
        questions.forEach((q, i) => {
          const domain = q.domain || 'general';
          if (!domainScores[domain]) {
            domainScores[domain] = { earned: 0, maxPossible: 0, percentage: 0 };
          }
          domainScores[domain].maxPossible += 2;
          if (isMilestone) {
            domainScores[domain].earned += (answers[i]?.score ?? 0);
          } else {
            domainScores[domain].earned += (answers[i] ? 2 : 0);
          }
        });
        // Compute percentages
        for (const d of Object.keys(domainScores)) {
          const ds = domainScores[d];
          ds.percentage = ds.maxPossible > 0 ? Math.round((ds.earned / ds.maxPossible) * 100) : 0;
        }

        const responses = questions.map((q, i) => ({
          questionId: q.id,
          selectedAnswer: isMilestone ? (answers[i]?.selectedAnswer ?? null) : (answers[i] ? 'correct' : 'wrong'),
          score: isMilestone ? (answers[i]?.score ?? 0) : (answers[i] ? 2 : 0),
        }));

        await saveMilestoneAssessmentResult({
          childId: uid,
          milestone_level: profile?.milestone_level ?? null,
          totalScore: score,
          maxPossible: questions.length * 2,
          domainScores,
          responses,
        });

        await refreshProfile();
      }
    } catch (e) {
      console.error('Failed to save assessment results:', e);
    }
    navigate('/child/dashboard', { replace: true });
  }, [saving, user, score, ageGroupKey, seenIds, questions, answers, isMilestone, profile, refreshProfile, navigate]);

  /* ── Domain label for current question ── */
  const domainIcon = currentQ ? (DOMAIN_ICONS[currentQ.domain] || '🧠') : '';

  /* ── Age group display label ── */
  const ageLabel = ageGroupKey ? (AGE_GROUP_LABELS[ageGroupKey] || ageGroupKey) : '';

  /* ── Welcome screen domain features (based on age) ── */
  const welcomeFeatures = useMemo(() => {
    if (!ageGroupKey) return [];
    const isInfant = ageGroupKey === '0-6m' || ageGroupKey === '6-12m';
    if (isInfant) {
      return [
        { icon: '🏃', label: 'Movement' },
        { icon: '❤️', label: 'Bonding' },
        { icon: '🎨', label: 'Senses' },
      ];
    }
    if (isMilestoneAgeGroup(ageGroupKey)) {
      return [
        { icon: '🏃', label: 'Physical' },
        { icon: '🧠', label: 'Cognitive' },
        { icon: '❤️', label: 'Emotional' },
      ];
    }
    return [
      { icon: '🔢', label: 'Counting' },
      { icon: '🧠', label: 'Patterns' },
      { icon: '❤️', label: 'Emotions' },
    ];
  }, [ageGroupKey]);

  /* ────────────────────
     LOADING STATE
  ──────────────────── */
  if (loadingQs && screen !== 0) {
    return (
      <div className="assessment-page">
        <div className="assessment-card loading-card">
          <span className="loading-spinner">🔄</span>
          <p className="loading-text">Preparing your questions…</p>
        </div>
      </div>
    );
  }

  /* ── Render ── */
  return (
    <div className="assessment-page">
      {/* Confetti celebration */}
      {showConfetti && (
        <Confetti
          width={dims.w}
          height={dims.h}
          numberOfPieces={280}
          recycle={false}
          colors={['#F4A300', '#7C4DFF', '#FF6B9D', '#66BB6A', '#4FC3F7', '#FFD54F']}
        />
      )}

      {/* Animated background stars */}
      <div className="assessment-bg-decor">
        <span className="bg-star">⭐</span>
        <span className="bg-star">🌟</span>
        <span className="bg-star">✨</span>
        <span className="bg-star">💫</span>
        <span className="bg-star">🪐</span>
        <span className="bg-star">🌙</span>
        <span className="bg-star">☀️</span>
        <span className="bg-star">🌈</span>
      </div>

      <div className="assessment-card">
        {/* ── Progress Stepper (visible during questions) ── */}
        {screen >= 1 && screen <= TOTAL_QUESTIONS && questions.length > 0 && (
          <div className="assessment-stepper">
            {questions.map((q, i) => {
              const stepNum = i + 1;
              const isActive = screen === stepNum;
              const isDone = screen > stepNum;
              return (
                <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div
                    className={`stepper-dot ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}`}
                  />
                  {i < questions.length - 1 && (
                    <div className={`stepper-connector ${isDone ? 'completed' : ''}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ═══════════════════════════════════
            SCREEN 0: Welcome
        ═══════════════════════════════════ */}
        {screen === 0 && (
          <div>
            <span className="assessment-welcome-emoji">🧑‍🚀</span>
            <h1 className="assessment-welcome-title">Welcome, Explorer!</h1>

            {/* Age group badge */}
            {ageLabel && !loadingQs && (
              <div className="age-group-badge">
                <span className="age-group-badge-icon">🎂</span>
                <span className="age-group-badge-text">{ageLabel}</span>
              </div>
            )}

            <p className="assessment-welcome-subtitle">
              {isMilestone
                ? <>Let's observe your little one's development milestones. Complete <strong>{TOTAL_QUESTIONS} quick activities</strong> — it only takes a minute.</>
                : <>Before we explore the universe, let's see what you already know! Complete <strong>{TOTAL_QUESTIONS} quick activities</strong> — it only takes a minute.</>
              }
            </p>
            <div className="assessment-welcome-features">
              {welcomeFeatures.map((f) => (
                <div key={f.label} className="welcome-feature">
                  <span className="welcome-feature-icon">{f.icon}</span>
                  <span className="welcome-feature-label">{f.label}</span>
                </div>
              ))}
            </div>

            {loadingQs ? (
              <div className="loading-pill">⏳ Preparing questions…</div>
            ) : (
              <button
                className="assessment-btn primary"
                onClick={() => setScreen(1)}
                disabled={questions.length === 0}
              >
                🚀 Start Assessment
              </button>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════
            SCREENS 1–7: Questions
        ═══════════════════════════════════ */}
        {currentQ && (
          <div>
            {/* Question label: domain icon + type */}
            <span className={`assessment-question-label ${currentQ.type === 'milestone' ? 'milestone' : currentQ.type === 'caregiver' ? 'caregiver' : currentQ.type === 'emotion' ? 'emotion' : currentQ.type === 'sort' ? 'sort' : currentQ.type}`}>
              {domainIcon} {currentQ.label} — Question {screen} of {TOTAL_QUESTIONS}
            </span>

            <h2 className="assessment-question-title">{currentQ.title}</h2>
            <p className="assessment-question-hint">{currentQ.hint}</p>

            {/* ── Visual Area ── */}
            <div className={`assessment-visual-area ${currentQ.type === 'milestone' ? 'milestone-visual' : currentQ.type === 'caregiver' ? 'caregiver-visual' : ''} ${currentQ.type === 'emotion' ? 'emotion-visual' : ''}`}>

              {/* Milestone: show domain badge prominently */}
              {currentQ.type === 'milestone' && currentQ.visual && (
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '0.4rem' }}>
                    {currentQ.visual.emoji}
                  </span>
                  <span style={{
                    fontSize: '0.8rem', fontWeight: 700, color: '#6B7280',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>
                    {currentQ.visual.domain}
                  </span>
                </div>
              )}

              {/* Caregiver: show the question text prominently */}
              {currentQ.type === 'caregiver' && currentQ.question && (
                <p className="caregiver-question-text">"{currentQ.question}"</p>
              )}

              {/* Numeracy: floating count items */}
              {currentQ.items && currentQ.type === 'numeracy' && currentQ.items.map((item, i) => (
                <span key={i} className="floating-item">{item}</span>
              ))}

              {/* Logic: pattern sequence */}
              {currentQ.pattern && (
                <>
                  {currentQ.pattern.map((p, i) => (
                    <span key={i} className="pattern-item">{p}</span>
                  ))}
                  <span className="pattern-item mystery">❓</span>
                </>
              )}

              {/* Literacy: word visual */}
              {currentQ.word && (
                <div className="word-visual">
                  <span className="word-visual-emoji">{currentQ.word.emoji}</span>
                  <span className="word-visual-underline">
                    <span className="highlight-letter">{currentQ.word.text[0]}</span>
                    <span className="dim-letter">{currentQ.word.text.slice(1)}</span>
                  </span>
                </div>
              )}

              {/* Sort: items row with odd-one-out */}
              {currentQ.type === 'sort' && currentQ.items && (
                <div className="sort-items-row">
                  {currentQ.items.map((item, i) => (
                    <span
                      key={i}
                      className={`sort-item ${i === currentQ.oddIndex ? 'sort-item-odd' : ''}`}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}

              {/* Emotion: decorative face strip in visual area */}
              {currentQ.type === 'emotion' && (
                <div className="emotion-prompt">
                  <span className="emotion-big-icon">🤔</span>
                  <p className="emotion-prompt-text">Choose the right feeling below!</p>
                </div>
              )}
            </div>

            {/* ── Answer Options ── */}
            <div className={`assessment-options ${currentQ.type === 'milestone' ? 'milestone-options' : ''} ${currentQ.type === 'caregiver' ? 'caregiver-options' : ''} ${currentQ.type === 'emotion' ? 'emotion-options' : ''}`}>
              {currentQ.options.map((opt) => {
                let cls = 'option-card';
                if (isMilestone) {
                  // Milestone: highlight selected, lock after answered
                  if (selected === opt.value) cls += ' selected';
                  if (answered && selected === opt.value) {
                    cls += opt.value === 'Yes' ? ' correct' : opt.value === 'Sometimes' ? ' milestone-sometimes' : ' milestone-notyet';
                  }
                } else {
                  // Interactive: show correct/wrong
                  if (answered && selected === opt.value) {
                    cls += isCorrect ? ' correct' : ' wrong';
                  } else if (selected === opt.value) {
                    cls += ' selected';
                  }
                  if (answered && !isCorrect && opt.value === currentQ.answer) {
                    cls += ' correct-hint';
                  }
                }
                return (
                  <div
                    key={opt.value}
                    className={cls}
                    onClick={() => handleSelect(opt.value)}
                  >
                    <span className="option-card-emoji">{opt.emoji}</span>
                    <span className="option-card-text">{opt.text}</span>
                  </div>
                );
              })}
            </div>

            {/* Feedback (interactive mode) */}
            {!isMilestone && answered && (
              <div className={`assessment-feedback ${isCorrect ? 'correct' : 'wrong'}`}>
                <span className="assessment-feedback-icon">
                  {isCorrect ? '✅' : '❌'}
                </span>
                {isCorrect ? currentQ.correctMsg : currentQ.wrongMsg}
              </div>
            )}

            {/* Feedback (milestone mode) */}
            {isMilestone && answered && milestoneFeedback && (
              <div className={`assessment-feedback milestone-feedback milestone-feedback-${milestoneFeedback.type === 'Yes' ? 'yes' : milestoneFeedback.type === 'Sometimes' ? 'sometimes' : 'notyet'}`}>
                <span className="assessment-feedback-icon">
                  {milestoneFeedback.icon}
                </span>
                {milestoneFeedback.msg}
              </div>
            )}

            {/* Submit / Next */}
            {!answered ? (
              <button
                className="assessment-btn primary"
                disabled={selected === null}
                onClick={handleSubmitAnswer}
              >
                {isMilestone ? '📋 Submit Response' : '✨ Check Answer'}
              </button>
            ) : (
              <button className="assessment-btn cosmic" onClick={handleNext}>
                {screen < TOTAL_QUESTIONS ? 'Next Question →' : '🎉 See My Score!'}
              </button>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════
            SCORE SCREEN
        ═══════════════════════════════════ */}
        {screen === TOTAL_QUESTIONS + 1 && (
          <div className="score-screen">
            <span className="score-trophy">🏆</span>
            <h2 className="score-title">Assessment Complete!</h2>
            <p className="score-subtitle">
              {isMilestone
                ? (score === 100
                    ? "Outstanding! Your child is hitting all milestones! 🌟"
                    : score >= 66
                      ? 'Great progress! Your child is developing well!'
                      : 'Every child grows at their own pace. Keep encouraging them!')
                : (score === 100
                    ? 'Perfect score — you\'re a superstar! 🌟'
                    : score >= 66
                      ? 'Great job, Explorer! You\'re ready for the adventure!'
                      : 'Nice try! Every explorer starts somewhere. Let\'s learn together!')}
            </p>

            {ageLabel && (
              <div className="age-group-badge score-age-badge">
                <span className="age-group-badge-icon">🎂</span>
                <span className="age-group-badge-text">{ageLabel}</span>
              </div>
            )}

            {/* Score Ring */}
            <div className="score-display">
              <div className="score-ring">
                <svg width="130" height="130" viewBox="0 0 130 130">
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#7C4DFF" />
                      <stop offset="100%" stopColor="#FF6B9D" />
                    </linearGradient>
                  </defs>
                  <circle className="score-ring-bg" cx="65" cy="65" r="56" />
                  <circle
                    className="score-ring-fill"
                    cx="65" cy="65" r="56"
                    strokeDasharray={2 * Math.PI * 56}
                    strokeDashoffset={2 * Math.PI * 56 * (1 - score / 100)}
                  />
                </svg>
                <div className="score-ring-inner">
                  <span className="score-ring-value">{score}%</span>
                  <span className="score-ring-label">Score</span>
                </div>
              </div>
            </div>

            {/* Rewards */}
            <div className="score-rewards">
              <div className="reward-chip xp">
                <span className="reward-chip-icon">⚡</span> +30 XP
              </div>
              <div className="reward-chip stars">
                <span className="reward-chip-icon">⭐</span> +3 Stars
              </div>
              <div className="reward-chip badge">
                <span className="reward-chip-icon">🪙</span> +10 Coins
              </div>
            </div>

            {/* Breakdown — styled cards */}
            <div className="score-breakdown">
              <h3 className="breakdown-heading">📊 Question Summary</h3>
              {questions.map((q, i) => {
                const domainIcon = DOMAIN_ICONS[q.domain] || '🧠';
                let statusCls, statusLabel, statusEmoji;
                if (isMilestone) {
                  const ans = answers[i]?.selectedAnswer;
                  if (ans === 'Yes')       { statusCls = 'status-yes';       statusLabel = 'Yes';       statusEmoji = '✅'; }
                  else if (ans === 'Sometimes') { statusCls = 'status-sometimes'; statusLabel = 'Sometimes'; statusEmoji = '🔄'; }
                  else                     { statusCls = 'status-notyet';    statusLabel = 'Not Yet';   statusEmoji = '⏳'; }
                } else {
                  if (answers[i]) { statusCls = 'status-correct'; statusLabel = 'Correct'; statusEmoji = '✅'; }
                  else            { statusCls = 'status-wrong';   statusLabel = 'Wrong';   statusEmoji = '❌'; }
                }
                return (
                  <div
                    key={q.id}
                    className={`breakdown-card ${statusCls}`}
                    style={{ animationDelay: `${0.15 + i * 0.08}s` }}
                  >
                    <span className="breakdown-card-emoji">{domainIcon}</span>
                    <span className="breakdown-card-title">{q.title}</span>
                    <span className={`breakdown-card-badge ${statusCls}`}>
                      <span className="breakdown-badge-emoji">{statusEmoji}</span>
                      {statusLabel}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              className="assessment-btn primary"
              onClick={handleFinish}
              disabled={saving}
            >
              {saving ? '⏳ Saving...' : '🚀 Go to Dashboard!'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
