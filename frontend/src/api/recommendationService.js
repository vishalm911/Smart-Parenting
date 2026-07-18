/**
 * recommendationService.js
 *
 * Fetches the latest milestone assessment result for a given child from
 * MongoDB and returns enriched activity recommendations.
 *
 * This module calls the MongoDB backend API.
 * The caller (RecommendationPanel) passes the childId.
 */
import client from '../api/client';
import { generateRecommendations } from '../data/activityRecommendations';

/**
 * Fetches the most recent milestone assessment for the given child and
 * computes activity recommendations from the stored domainScores.
 *
 * Returns null if no assessment exists yet (e.g. child hasn't taken one).
 *
 * @param {string} childId  — Child profile ID
 * @returns {Promise<{
 *   assessmentData: object,       — raw assessment document data
 *   recommendations: object[],    — enriched activity list (up to 4)
 *   domainScores: object,         — raw domainScores map for rendering
 * } | null>}
 */
export async function getChildRecommendations(childId) {
  if (!childId) return null;

  try {
    const { data } = await client.get('/milestones/assessments/latest', { params: { childId } });
    if (!data.data) return null;

    const docData   = data.data;
    const domainScores = docData.domainScores ?? {};

    return {
      assessmentData:  docData,
      recommendations: generateRecommendations(domainScores, 4),
      domainScores,
    };
  } catch (e) {
    console.error('[recommendationService] getChildRecommendations error:', e);
    return null;
  }
}
