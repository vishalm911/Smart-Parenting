/**
 * src/firebase/childProfileService.js
 *
 * Drop-in replacement for the Firebase Firestore child profile service.
 * All function signatures are preserved.
 *
 * Firebase method                     →  This service method
 * ─────────────────────────────────────────────────────────
 * getChildProfiles(parentUid)         →  getChildProfiles(parentUid)
 * getChildProfile(profileId)          →  getChildProfile(profileId)
 * createChildProfile(parentUid, data) →  createChildProfile(parentUid, data)
 * updateChildProfile(id, data)        →  updateChildProfile(id, data)
 * deleteChildProfile(id)              →  deleteChildProfile(id)
 */

import client from '../api/client';

export const getChildProfiles = async (parentUid) => {
  try {
    const { data } = await client.get('/children', { params: { parentUid } });
    return { data: data.data, error: null };
  } catch (e) {
    return { data: [], error: e.response?.data?.error || e.message };
  }
};

export const getChildProfile = async (profileId) => {
  try {
    const { data } = await client.get(`/children/${profileId}`);
    return { data: data.data, error: null };
  } catch (e) {
    return { data: null, error: e.response?.data?.error || e.message };
  }
};

export const createChildProfile = async (parentUid, profileData) => {
  try {
    const { data } = await client.post('/children', { ...profileData, parent_uid: parentUid });
    return { data: data.data, error: null };
  } catch (e) {
    return { data: null, error: e.response?.data?.error || e.message };
  }
};

export const updateChildProfile = async (profileId, updates) => {
  try {
    const { data } = await client.put(`/children/${profileId}`, updates);
    return { data: data.data, error: null };
  } catch (e) {
    return { data: null, error: e.response?.data?.error || e.message };
  }
};

export const deleteChildProfile = async (profileId) => {
  try {
    await client.delete(`/children/${profileId}`);
    return { error: null };
  } catch (e) {
    return { error: e.response?.data?.error || e.message };
  }
};
