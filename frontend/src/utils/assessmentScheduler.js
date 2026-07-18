/**
 * assessmentScheduler.js
 *
 * Determines whether to show the first-time or weekly assessment popup
 * on the child Home screen.
 *
 * Return values:
 *   { status: 'none' }      - no assessment exists  -> show first-time popup
 *   { status: 'due' }       - latest assessment >= 7 days old -> show weekly popup
 *   { status: 'not-due' }   - latest assessment < 7 days ago  -> show nothing
 */
import client from '../api/client';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Checks the milestone assessments database for the given child and
 * returns a scheduling status object.
 *
 * @param {string} childId - Child profile / auth UID
 * @returns {Promise<{ status: 'none' | 'due' | 'not-due' }>}
 */
export async function checkAssessmentSchedule(childId) {
  if (!childId) return { status: 'none' };

  try {
    const { data } = await client.get('/milestones/assessments', { params: { childId } });
    const docs = data.data || [];

    if (docs.length === 0) {
      return { status: 'none' };
    }

    // Sort client-side by completedAt descending
    docs.sort((a, b) => {
      const ta = new Date(a.completedAt || a.created_at).getTime();
      const tb = new Date(b.completedAt || b.created_at).getTime();
      return tb - ta;
    });

    const latest = docs[0];
    const completedAtDate = new Date(latest.completedAt || latest.created_at);

    if (!completedAtDate || isNaN(completedAtDate.getTime())) {
      return { status: 'not-due' };
    }

    const daysSince = Date.now() - completedAtDate.getTime();

    if (daysSince >= SEVEN_DAYS_MS) {
      return { status: 'due' };
    }

    return { status: 'not-due' };
  } catch (e) {
    console.error('[assessmentScheduler] checkAssessmentSchedule error:', e);
    return { status: 'not-due' };
  }
}
