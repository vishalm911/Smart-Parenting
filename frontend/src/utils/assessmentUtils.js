/**
 * assessmentUtils.js — Assessment Module Utilities
 *
 * Provides:
 *  - getAgeGroupKey(profile)       → age group string for catalog lookup
 *  - selectRandomQuestions(pool, seenIds, count) → randomized, non-repeating questions
 *  - updateSeenIds(existing, newIds) → merged seen-ID array
 *
 * Supports TWO question systems:
 *  - 0–3 years: QUESTION_CATALOG  from assessmentQuestions.js  (interactive types)
 *  - 3–6 years: milestones_3_6.json via MILESTONE_3_6_CATALOG (observational Yes/Sometimes/Not Yet)
 */

import { QUESTION_CATALOG } from '../data/assessmentQuestions';
import milestones3to6Raw from '../data/milestones_3_6.json';

/* ──────────────────────────────────────────────────────
   MILESTONE 3–6 DATA
   Levels 7–12 map to 6-month bands from 3–6 years.
────────────────────────────────────────────────────── */

/**
 * Pre-index milestones_3_6 by level for O(1) access.
 * Shape: { 7: [...items], 8: [...items], ... }
 */
const MILESTONE_3_6_BY_LEVEL = {};
for (const item of milestones3to6Raw) {
  const lvl = item.level;
  if (!MILESTONE_3_6_BY_LEVEL[lvl]) MILESTONE_3_6_BY_LEVEL[lvl] = [];
  MILESTONE_3_6_BY_LEVEL[lvl].push(item);
}

/** Option emoji map for milestone responses */
const OPTION_EMOJIS = { Yes: '✅', Sometimes: '🔄', 'Not Yet': '⏳' };

/** Domain emoji map for milestones */
const DOMAIN_EMOJIS = {
  'Physical Development':  '🏃',
  'Language Development':  '💬',
  'Cognitive Development': '🧠',
  'Social Development':    '🤝',
  'Social-Emotional':      '❤️',
  'Emotional Development': '❤️',
  'Aesthetic Development': '🎨',
  'Fine Motor':            '✋',
  'Gross Motor':           '🦵',
  'Communication':         '📢',
  'Self-Care':             '🧼',
};
const getDomainEmoji = (domain) => DOMAIN_EMOJIS[domain] || '📋';

/**
 * Convert a raw milestone JSON item into the shape the AssessmentModule renders.
 * The `type: 'milestone'` flag tells the component to use observational mode
 * (no correct/wrong — scoring by Yes=2, Sometimes=1, Not Yet=0).
 */
function adaptMilestoneItem(item) {
  return {
    id:      item.id,
    type:    'milestone',
    domain:  item.domain,
    label:   `📋 ${item.domain}`,
    title:   item.skill,
    hint:    item.assessment_question,
    options: item.options.map((o) => ({
      value: o,
      emoji: OPTION_EMOJIS[o] || '•',
      text:  o,
    })),
    scoring:  item.scoring,          // { Yes: 2, Sometimes: 1, "Not Yet": 0 }
    visual: {
      type:   'milestone',
      domain: item.domain,
      emoji:  getDomainEmoji(item.domain),
    },
    // No answer/correctMsg/wrongMsg — observational mode
  };
}

/* ──────────────────────────────────────────────────────
   AGE GROUP DETECTION
   Primary source: profile.date_of_birth (Date object or ISO string)
   Fallback:       profile.age_group broad string ('1-3', '4-6', '7-10')
────────────────────────────────────────────────────── */

/**
 * Convert a Date, Timestamp, or ISO string to a JS Date.
 */
function toDate(value) {
  if (!value) return null;
  if (value?.toDate) return value.toDate();           // Legacy Timestamp
  if (value instanceof Date) return value;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Given a child's age in whole months, return the correct age group key.
 * Now extended to cover 0–72 months (0–6 years).
 *
 * 0–36 months → original fine-grained catalog keys (0-6m, 6-12m, etc.)
 * 36–72 months → milestone level keys (L7, L8, L9, L10, L11, L12)
 */
function monthsToAgeGroupKey(months) {
  // 0–3 years: existing catalog
  if (months < 6)  return '0-6m';
  if (months < 12) return '6-12m';
  if (months < 18) return '1-1.5y';
  if (months < 24) return '1.5-2y';
  if (months < 30) return '2-2.5y';
  if (months < 36) return '2.5-3y';
  // 3–6 years: milestone levels
  if (months < 42) return 'L7';   // 3 – 3.5 years
  if (months < 48) return 'L8';   // 3.5 – 4 years
  if (months < 54) return 'L9';   // 4 – 4.5 years
  if (months < 60) return 'L10';  // 4.5 – 5 years
  if (months < 66) return 'L11';  // 5 – 5.5 years
  return 'L12';                    // 5.5 – 6 years
}

/**
 * Map the broad age_group strings (from parent profile manager) to the
 * most appropriate fine-grained catalog key.
 */
const BROAD_GROUP_FALLBACK = {
  '0-1':  '6-12m',
  '1-3':  '2-2.5y',
  '4-6':  'L9',     // Default to Level 9 (4–4.5 years) for broad 4-6
  '7-10': 'L12',    // Beyond our catalog range; use oldest bucket
};

/**
 * getAgeGroupKey — detects the child's age group from their profile.
 *
 * @param {object} profile  — Firestore child profile (from useUser)
 * @returns {string}        — One of the QUESTION_CATALOG keys or 'L7'–'L12'
 */
export function getAgeGroupKey(profile) {
  // 1. Try date_of_birth first (most precise)
  const dob = toDate(profile?.date_of_birth);
  if (dob) {
    const now = new Date();
    const totalMonths =
      (now.getFullYear() - dob.getFullYear()) * 12 +
      (now.getMonth() - dob.getMonth());
    const clampedMonths = Math.max(0, totalMonths);
    return monthsToAgeGroupKey(clampedMonths);
  }

  // 2. Fall back to broad age_group string on the profile
  const broadGroup = profile?.age_group;
  if (broadGroup && BROAD_GROUP_FALLBACK[broadGroup]) {
    return BROAD_GROUP_FALLBACK[broadGroup];
  }

  // 3. Absolute fallback — default to 2–2.5y (most balanced bucket)
  return '2-2.5y';
}

/**
 * Returns true if the age group key corresponds to the 3–6 year milestone system.
 */
export function isMilestoneAgeGroup(ageGroupKey) {
  return /^L\d+$/.test(ageGroupKey);
}

/* ──────────────────────────────────────────────────────
   RANDOM QUESTION SELECTION  (no repetition across sessions)
────────────────────────────────────────────────────── */

/**
 * Fisher-Yates in-place shuffle.
 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Domain-balanced round-robin selection for milestone questions.
 * Groups questions by domain, shuffles within each domain, then picks
 * in round-robin order across shuffled domain order to ensure coverage.
 */
function selectBalancedMilestoneQuestions(pool, seenIds = [], count = 7) {
  const seenSet = new Set(seenIds);
  let candidates = pool.filter((q) => !seenSet.has(q.id));
  let resetOccurred = false;

  if (candidates.length < count) {
    candidates = [...pool];
    resetOccurred = true;
  }

  // Group by domain
  const byDomain = {};
  for (const item of candidates) {
    if (!byDomain[item.domain]) byDomain[item.domain] = [];
    byDomain[item.domain].push(item);
  }
  // Shuffle within each domain
  for (const domain of Object.keys(byDomain)) {
    byDomain[domain] = shuffle(byDomain[domain]);
  }

  // Shuffle domain order
  const domains = shuffle(Object.keys(byDomain));

  // Round-robin selection
  const selected = [];
  let round = 0;
  while (selected.length < count) {
    let addedThisRound = false;
    for (const domain of domains) {
      if (selected.length >= count) break;
      if (round < byDomain[domain].length) {
        selected.push(byDomain[domain][round]);
        addedThisRound = true;
      }
    }
    if (!addedThisRound) break;
    round++;
  }

  // Final shuffle and adapt to UI shape
  const questions = shuffle(selected).map(adaptMilestoneItem);
  return { questions, resetOccurred };
}

/**
 * selectRandomQuestions — picks `count` unseen questions from the age-group pool.
 *
 * Dispatches to the correct question source:
 *  - 0–3 years (keys like '2-2.5y'): uses QUESTION_CATALOG
 *  - 3–6 years (keys like 'L7'):     uses milestones_3_6.json
 *
 * If all questions have been seen, the seen history is silently reset so
 * the child can always start fresh (avoids blank assessment).
 *
 * @param {string}   ageGroupKey  — e.g. '2-2.5y' or 'L7'
 * @param {string[]} seenIds      — question IDs already seen by this child
 * @param {number}   count        — how many questions to return (default 7)
 * @returns {{ questions: object[], resetOccurred: boolean }}
 */
export function selectRandomQuestions(ageGroupKey, seenIds = [], count = 7) {
  // ── 3–6 years: milestone-based system ──
  if (isMilestoneAgeGroup(ageGroupKey)) {
    const levelNum = parseInt(ageGroupKey.replace('L', ''), 10);
    const pool = MILESTONE_3_6_BY_LEVEL[levelNum];
    if (!pool || pool.length === 0) {
      // Fallback: try adjacent level
      const fallbackPool = MILESTONE_3_6_BY_LEVEL[levelNum - 1] || MILESTONE_3_6_BY_LEVEL[7] || [];
      return selectBalancedMilestoneQuestions(fallbackPool, seenIds, count);
    }
    return selectBalancedMilestoneQuestions(pool, seenIds, count);
  }

  // ── 0–3 years: existing interactive catalog ──
  const pool = QUESTION_CATALOG[ageGroupKey] ?? QUESTION_CATALOG['2-2.5y'];
  const seenSet = new Set(seenIds);

  let unseen = pool.filter((q) => !seenSet.has(q.id));
  let resetOccurred = false;

  // If pool exhausted, reset and use full pool
  if (unseen.length < count) {
    unseen = [...pool];
    resetOccurred = true;
  }

  const selected = shuffle(unseen).slice(0, Math.min(count, unseen.length));
  return { questions: selected, resetOccurred };
}

/* ──────────────────────────────────────────────────────
   SEEN-ID MANAGEMENT
────────────────────────────────────────────────────── */

/**
 * updateSeenIds — merges new question IDs into the existing seen-ID list.
 * Deduplicates and caps to 200 to prevent unbounded growth.
 *
 * @param {string[]} existing  — previously stored IDs
 * @param {string[]} newIds    — IDs from the just-completed session
 * @returns {string[]}         — merged, deduplicated array
 */
export function updateSeenIds(existing = [], newIds = []) {
  const merged = Array.from(new Set([...existing, ...newIds]));
  // Keep latest 200 entries to prevent Firestore field growing too large
  return merged.slice(-200);
}
