import client from '../api/client';

const getAll  = (endpoint, params = {}) =>
  client.get(endpoint, { params }).then(r => r.data || [])
        .catch(e => {
          console.error(e);
          return [];
        });

const create  = (endpoint, payload) =>
  client.post(endpoint, payload).then(r => ({ data: r.data, error: null }))
        .catch(e => ({ data: null, error: e.response?.data?.error || e.message }));

const update  = (endpoint, id, payload) =>
  client.put(`${endpoint}/${id}`, payload).then(r => ({ data: r.data, error: null }))
        .catch(e => ({ data: null, error: e.response?.data?.error || e.message }));

const remove  = (endpoint, id) =>
  client.delete(`${endpoint}/${id}`).then(() => ({ error: null }))
        .catch(e => ({ error: e.response?.data?.error || e.message }));

// ── Stories ─────────────────────────────────────────────────────────────────
export const getStories            = (ageGroup) => getAll('/literacy/stories', ageGroup ? { age_group: ageGroup } : {});
export const addStory              = (data)     => create('/literacy/stories', data);
export const updateStory           = (id, data) => update('/literacy/stories', id, data);
export const deleteStory           = (id)       => remove('/literacy/stories', id);

// ── Vocabulary ───────────────────────────────────────────────────────────────
export const getVocabularyGames    = ()         => getAll('/literacy/vocabulary');
export const addVocabularyGame     = (data)     => create('/literacy/vocabulary', data);
export const updateVocabularyGame  = (id, data) => update('/literacy/vocabulary', id, data);
export const deleteVocabularyGame  = (id)       => remove('/literacy/vocabulary', id);
// aliases
export const getVocabGames         = getVocabularyGames;
export const addVocabGame          = addVocabularyGame;
export const updateVocabGame       = updateVocabularyGame;
export const deleteVocabGame       = deleteVocabularyGame;

// ── Word Builder ─────────────────────────────────────────────────────────────
export const getWordBuilderWords   = ()         => getAll('/literacy/word-builder');
export const addWordBuilderWord    = (data)     => create('/literacy/word-builder', data);
export const updateWordBuilderWord = (id, data) => update('/literacy/word-builder', id, data);
export const deleteWordBuilderWord = (id)       => remove('/literacy/word-builder', id);

// ── Picture Match ────────────────────────────────────────────────────────────
export const getPictureMatchItems  = ()         => getAll('/literacy/picture-match');
export const addPictureMatchItem   = (data)     => create('/literacy/picture-match', data);
export const updatePictureMatchItem= (id, data) => update('/literacy/picture-match', id, data);
export const deletePictureMatchItem= (id)       => remove('/literacy/picture-match', id);

// ── Sound Match ──────────────────────────────────────────────────────────────
export const getSoundMatchItems    = ()         => getAll('/literacy/sound-match');
export const addSoundMatchItem     = (data)     => create('/literacy/sound-match', data);
export const updateSoundMatchItem  = (id, data) => update('/literacy/sound-match', id, data);
export const deleteSoundMatchItem  = (id)       => remove('/literacy/sound-match', id);

// ── Object Recognition ───────────────────────────────────────────────────────
export const getObjectItems        = ()         => getAll('/literacy/object-recognition');
export const addObjectItem         = (data)     => create('/literacy/object-recognition', data);
export const updateObjectItem      = (id, data) => update('/literacy/object-recognition', id, data);
export const deleteObjectItem      = (id)       => remove('/literacy/object-recognition', id);

// ── Fluency ──────────────────────────────────────────────────────────────────
export const getFluencyPassages    = ()         => getAll('/literacy/fluency');
export const addFluencyPassage     = (data)     => create('/literacy/fluency', data);
export const updateFluencyPassage  = (id, data) => update('/literacy/fluency', id, data);
export const deleteFluencyPassage  = (id)       => remove('/literacy/fluency', id);

// ── Phonics ──────────────────────────────────────────────────────────────────
export const getPhonicsWords       = ()         => getAll('/literacy/phonics');
export const addPhonicsWord        = (data)     => create('/literacy/phonics', data);
export const updatePhonicsWord     = (id, data) => update('/literacy/phonics', id, data);
export const deletePhonicsWord     = (id)       => remove('/literacy/phonics', id);

// ── Challenges ───────────────────────────────────────────────────────────────
export const getChallenges         = ()         => getAll('/literacy/challenges');
export const updateChallenge       = (id, data) => update('/literacy/challenges', id, data);

// ── Reading Activities ───────────────────────────────────────────────────────
export const getReadingActivities  = (ageGroup) => getAll('/literacy/reading-activities', ageGroup ? { age_group: ageGroup } : {});
export const addReadingActivity    = (data)     => create('/literacy/reading-activities', data);
export const updateReadingActivity = (id, data) => update('/literacy/reading-activities', id, data);
export const deleteReadingActivity = (id)       => remove('/literacy/reading-activities', id);

// ── Scores ───────────────────────────────────────────────────────────────────
export const saveScore = (scoreData) => create('/scores', scoreData);
export const getScores = (childId)   => getAll('/scores', { childId });
export const saveLanguageScore = (scoreData) => create('/scores', { ...scoreData, activity_type: scoreData.activity_type || 'literacy' });
export const getLanguageScores = (childId)   => getAll('/scores', { childId, activityType: 'literacy' });

// ── Streaks ──────────────────────────────────────────────────────────────────
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

// alias
export const markTodayActive = markStreakToday;
// ── Extra aliases used by admin pages ─────────────────────────────────────
export const addWordBuilderItem     = addWordBuilderWord;
export const updateWordBuilderItem  = updateWordBuilderWord;
export const deleteWordBuilderItem  = deleteWordBuilderWord;

export const addSoundMatch          = addSoundMatchItem;
export const updateSoundMatch       = updateSoundMatchItem;
export const deleteSoundMatch       = deleteSoundMatchItem;

export const addPictureMatch        = addPictureMatchItem;
export const updatePictureMatch     = updatePictureMatchItem;
export const deletePictureMatch     = deletePictureMatchItem;

export const addObjectRecognition   = addObjectItem;
export const updateObjectRecognition= updateObjectItem;
export const deleteObjectRecognition= deleteObjectItem;

export const addChallenge           = (data)     => create('/literacy/challenges', data);
export const deleteChallenge        = (id)       => remove('/literacy/challenges', id);

export const addFluency             = addFluencyPassage;
export const updateFluency          = updateFluencyPassage;
export const deleteFluency          = deleteFluencyPassage;

export const addPhonics             = addPhonicsWord;
export const updatePhonics          = updatePhonicsWord;
export const deletePhonics          = deletePhonicsWord;


// ── AdminVocab / AdminActivities aliases ──────────────────────────────────
export const getWordBuilderList      = getWordBuilderWords;
export const addWordBuilderListItem  = addWordBuilderWord;
export const updateWordBuilderListItem = updateWordBuilderWord;
export const deleteWordBuilderListItem = deleteWordBuilderWord;

export const getSoundMatchList       = getSoundMatchItems;
export const getPictureMatchList     = getPictureMatchItems;
export const getObjectRecognitionList= getObjectItems;
export const getFluencyList          = getFluencyPassages;
export const getPhonicsList          = getPhonicsWords;
export const getChallengesList       = getChallenges;
export const getReadingActivitiesList= getReadingActivities;
export const getStoryList            = getStories;
export const getVocabularyList       = getVocabularyGames;


// ── Final aliases — AdminActivities exact names ───────────────────────────
export const getSoundMatchData          = getSoundMatchItems;
export const getObjectRecognitionData   = getObjectItems;

// ── AdminScores exact names ───────────────────────────────────────────────
export const getAllScores = async (filters = {}) => {
  try {
    const { data } = await client.get('/scores', { params: filters });
    return { data: data.data, error: null };
  } catch (e) {
    return { data: [], error: e.response?.data?.error || e.message };
  }
};

export const updateScore = async (id, updates) => {
  try {
    const { data } = await client.put(`/scores/${id}`, updates);
    return { data: data.data, error: null };
  } catch (e) {
    return { data: null, error: e.response?.data?.error || e.message };
  }
};

export const deleteScore = async (id) => {
  try {
    await client.delete(`/scores/${id}`);
    return { error: null };
  } catch (e) {
    return { error: e.response?.data?.error || e.message };
  }
};