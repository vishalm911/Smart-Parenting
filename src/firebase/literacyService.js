/**
 * src/firebase/literacyService.js
 *
 * Full drop-in replacement for the Firebase Firestore literacy service.
 * Every function signature is preserved so components need zero changes.
 *
 * Firebase collection          →  API endpoint
 * ──────────────────────────────────────────────────────────────────
 * stories                      →  GET/POST/PUT/DELETE /api/literacy/stories
 * vocabulary_games             →  GET/POST/PUT/DELETE /api/literacy/vocabulary
 * word_builder                 →  GET/POST/PUT/DELETE /api/literacy/word-builder
 * picture_match                →  GET/POST/PUT/DELETE /api/literacy/picture-match
 * sound_match                  →  GET/POST/PUT/DELETE /api/literacy/sound-match
 * object_recognition           →  GET/POST/PUT/DELETE /api/literacy/object-recognition
 * fluency_passages             →  GET/POST/PUT/DELETE /api/literacy/fluency
 * phonics_words                →  GET/POST/PUT/DELETE /api/literacy/phonics
 * challenges                   →  GET/PUT             /api/literacy/challenges
 * reading_activities           →  GET/POST/PUT/DELETE /api/literacy/reading-activities
 * streaks                      →  GET/POST            /api/literacy/streaks
 */

import client from '../api/client';

// ── Generic helpers ────────────────────────────────────────────────────────
const getAll  = (endpoint, params = {}) =>
  client.get(endpoint, { params }).then(r => ({ data: r.data, error: null }))
        .catch(e => ({ data: [], error: e.response?.data?.error || e.message }));

const create  = (endpoint, payload) =>
  client.post(endpoint, payload).then(r => ({ data: r.data, error: null }))
        .catch(e => ({ data: null, error: e.response?.data?.error || e.message }));

const update  = (endpoint, id, payload) =>
  client.put(`${endpoint}/${id}`, payload).then(r => ({ data: r.data, error: null }))
        .catch(e => ({ data: null, error: e.response?.data?.error || e.message }));

const remove  = (endpoint, id) =>
  client.delete(`${endpoint}/${id}`).then(() => ({ error: null }))
        .catch(e => ({ error: e.response?.data?.error || e.message }));

// ── Stories ────────────────────────────────────────────────────────────────
export const getStories           = (ageGroup)   => getAll('/literacy/stories', ageGroup ? { age_group: ageGroup } : {});
export const addStory             = (data)        => create('/literacy/stories', data);
export const updateStory          = (id, data)    => update('/literacy/stories', id, data);
export const deleteStory          = (id)          => remove('/literacy/stories', id);

// ── Vocabulary ─────────────────────────────────────────────────────────────
export const getVocabularyGames   = ()            => getAll('/literacy/vocabulary');
export const addVocabularyGame    = (data)        => create('/literacy/vocabulary', data);
export const updateVocabularyGame = (id, data)    => update('/literacy/vocabulary', id, data);
export const deleteVocabularyGame = (id)          => remove('/literacy/vocabulary', id);

// ── Word Builder ───────────────────────────────────────────────────────────
export const getWordBuilderWords  = ()            => getAll('/literacy/word-builder');
export const addWordBuilderWord   = (data)        => create('/literacy/word-builder', data);
export const updateWordBuilderWord = (id, data)   => update('/literacy/word-builder', id, data);
export const deleteWordBuilderWord = (id)         => remove('/literacy/word-builder', id);

// ── Picture Match ──────────────────────────────────────────────────────────
export const getPictureMatchItems  = ()           => getAll('/literacy/picture-match');
export const addPictureMatchItem   = (data)       => create('/literacy/picture-match', data);
export const updatePictureMatchItem = (id, data)  => update('/literacy/picture-match', id, data);
export const deletePictureMatchItem = (id)        => remove('/literacy/picture-match', id);

// ── Sound Match ────────────────────────────────────────────────────────────
export const getSoundMatchItems   = ()            => getAll('/literacy/sound-match');
export const addSoundMatchItem    = (data)        => create('/literacy/sound-match', data);
export const updateSoundMatchItem = (id, data)    => update('/literacy/sound-match', id, data);
export const deleteSoundMatchItem = (id)          => remove('/literacy/sound-match', id);

// ── Object Recognition ─────────────────────────────────────────────────────
export const getObjectItems       = ()            => getAll('/literacy/object-recognition');
export const addObjectItem        = (data)        => create('/literacy/object-recognition', data);
export const updateObjectItem     = (id, data)    => update('/literacy/object-recognition', id, data);
export const deleteObjectItem     = (id)          => remove('/literacy/object-recognition', id);

// ── Fluency Passages ───────────────────────────────────────────────────────
export const getFluencyPassages   = ()            => getAll('/literacy/fluency');
export const addFluencyPassage    = (data)        => create('/literacy/fluency', data);
export const updateFluencyPassage = (id, data)    => update('/literacy/fluency', id, data);
export const deleteFluencyPassage = (id)          => remove('/literacy/fluency', id);

// ── Phonics ────────────────────────────────────────────────────────────────
export const getPhonicsWords      = ()            => getAll('/literacy/phonics');
export const addPhonicsWord       = (data)        => create('/literacy/phonics', data);
export const updatePhonicsWord    = (id, data)    => update('/literacy/phonics', id, data);
export const deletePhonicsWord    = (id)          => remove('/literacy/phonics', id);

// ── Challenges ─────────────────────────────────────────────────────────────
export const getChallenges        = ()            => getAll('/literacy/challenges');
export const updateChallenge      = (id, data)    => update('/literacy/challenges', id, data);

// ── Reading Activities ─────────────────────────────────────────────────────
export const getReadingActivities   = (ageGroup)  => getAll('/literacy/reading-activities', ageGroup ? { age_group: ageGroup } : {});
export const addReadingActivity     = (data)      => create('/literacy/reading-activities', data);
export const updateReadingActivity  = (id, data)  => update('/literacy/reading-activities', id, data);
export const deleteReadingActivity  = (id)        => remove('/literacy/reading-activities', id);

// ── Streaks ────────────────────────────────────────────────────────────────
export const getStreak = async (userId) => {
  try {
    const { data } = await client.get(`/literacy/streaks/${userId}`);
    return { data, error: null };
  } catch (e) {
    return { data: { dates: [], count: 0 }, error: e.response?.data?.error || e.message };
  }
};

export const markStreakToday = async (userId) => {
  try {
    const { data } = await client.post(`/literacy/streaks/${userId}/mark-today`);
    return { count: data.count, error: null };
  } catch (e) {
    return { count: 0, error: e.response?.data?.error || e.message };
  }
};
