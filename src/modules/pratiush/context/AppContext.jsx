import { createContext, useContext, useReducer, useEffect } from 'react';
import { getChildProfile, getAchievements, getAvatar, getCurrentChildId } from '../utils/firestoreHelpers';

const AppContext = createContext(null);

const initialState = {
  childProfile: null,
  avatar: null,
  coins: 50,
  stars: 0,
  badges: [],
  isOnboarded: false,
  mascotVisible: true,
  isLoading: true,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PROFILE':
      return { ...state, childProfile: action.payload, isOnboarded: true };
    case 'SET_AVATAR':
      return { ...state, avatar: action.payload };
    case 'SET_COINS':
      return { ...state, coins: action.payload };
    case 'ADD_COINS':
      return { ...state, coins: state.coins + action.payload };
    case 'SET_STARS':
      return { ...state, stars: action.payload };
    case 'ADD_STARS':
      return { ...state, stars: state.stars + action.payload };
    case 'UNLOCK_BADGE':
      if (state.badges.includes(action.payload)) return state;
      return { ...state, badges: [...state.badges, action.payload] };
    case 'SET_BADGES':
      return { ...state, badges: action.payload };
    case 'SET_MASCOT_VISIBLE':
      return { ...state, mascotVisible: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load persisted state on mount
  useEffect(() => {
    async function loadAppData() {
      // Initialize Firebase first
      try {
        const { initFirebase } = await import('../firebase.js');
        await initFirebase();
        console.log('✅ Firebase initialized');
      } catch (error) {
        console.warn('⚠️ Firebase initialization failed:', error);
      }

      // Load mascot preference
      try {
        const mascotPref = localStorage.getItem('spacece_mascot');
        if (mascotPref === 'false') {
          dispatch({ type: 'SET_MASCOT_VISIBLE', payload: false });
        }
      } catch {}

      const childId = getCurrentChildId();
      if (childId) {
        try {
          const profile = await getChildProfile(childId);
          const avatar = await getAvatar(childId);
          const achievements = await getAchievements(childId);
          if (profile) {
            dispatch({
              type: 'LOAD_STATE',
              payload: {
                childProfile: profile,
                avatar,
                coins: achievements.totalCoins || 50,
                stars: achievements.totalStars || 0,
                badges: achievements.badges || [],
                isOnboarded: true,
              }
            });
          }
        } catch (error) {
          console.error('Failed to load child data:', error);
        }
      }

      // Keep loading screen visible for minimum duration for smooth experience
      setTimeout(() => {
        dispatch({ type: 'SET_LOADING', payload: false });
      }, 3000);
    }
    
    loadAppData();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
