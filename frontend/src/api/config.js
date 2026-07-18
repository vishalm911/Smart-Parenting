/**
 * src/api/config.js
 *
 * This file exports the API base URL.
 * This file now exports only the API base URL so that any component
 * that previously imported from this file doesn't break.
 *
 * The actual HTTP client lives in: src/api/client.js
 */

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Legacy named export that some components may still import
export default { apiUrl: API_URL };
