import client from './client';

/**
 * Fetches cognitive/SEL games config by universe (brain, creativity, emotion)
 */
export const getCognitiveSelGames = async (universe = null) => {
  try {
    const params = universe ? { universe } : {};
    const { data } = await client.get('/cognitive-sel/games', { params });
    return data.data || [];
  } catch (e) {
    console.error('Failed to fetch cognitive-sel games:', e);
    return [];
  }
};

/**
 * Fetches choice branching stories for Story Choice World
 */
export const getBranchingStories = async () => {
  try {
    const { data } = await client.get('/cognitive-sel/stories');
    return data.data || [];
  } catch (e) {
    console.error('Failed to fetch branching stories:', e);
    return [];
  }
};
