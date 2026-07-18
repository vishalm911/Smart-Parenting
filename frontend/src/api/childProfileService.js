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

export const AVATARS = [
  { id: 'avatar1',  emoji: '🧒', label: 'Kid'       },
  { id: 'avatar2',  emoji: '👦', label: 'Boy'       },
  { id: 'avatar3',  emoji: '👧', label: 'Girl'      },
  { id: 'avatar4',  emoji: '🧑', label: 'Child'     },
  { id: 'avatar5',  emoji: '👶', label: 'Baby'      },
  { id: 'avatar6',  emoji: '🦸', label: 'Hero'      },
  { id: 'avatar7',  emoji: '🧙', label: 'Wizard'    },
  { id: 'avatar8',  emoji: '🦊', label: 'Fox'       },
  { id: 'avatar9',  emoji: '🐼', label: 'Panda'     },
  { id: 'avatar10', emoji: '🦁', label: 'Lion'      },
  { id: 'avatar11', emoji: '🐸', label: 'Frog'      },
  { id: 'avatar12', emoji: '🚀', label: 'Astronaut' },
];

export const AGE_GROUPS = [
  { value: '1-3', label: 'Age 1-3', color: '#F43F5E' },
  { value: '4-6', label: 'Age 4-6', color: '#F5A623' },
  { value: '7-10', label: 'Age 7-10', color: '#3B82F6' },
];