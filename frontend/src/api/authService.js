import client from '../api/client';

const saveSession = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// ── Register ───────────────────────────────────────────────────────────────
export const registerUser = async (email, password, displayName = '', role = 'parent') => {
  try {
    const { data } = await client.post('/auth/register', { email, password, displayName, role });
    saveSession(data.token, data.user);
    return { user: data.user, error: null };
  } catch (err) {
    return { user: null, error: err.response?.data?.error || err.message };
  }
};

export const registerWithEmail = async (email, password, displayName, role = 'parent') => {
  return registerUser(email, password, displayName, role);
};

// ── Login ──────────────────────────────────────────────────────────────────
export const loginUser = async (email, password) => {
  try {
    const { data } = await client.post('/auth/login', { email, password });
    saveSession(data.token, data.user);
    return { user: data.user, error: null };
  } catch (err) {
    return { user: null, error: err.response?.data?.error || err.message };
  }
};

export const loginWithEmail = loginUser;

// ── Google Sign-In ─────────────────────────────────────────────────────────
export const loginWithGoogle = (role = 'parent') => {
  return new Promise((resolve) => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId || clientId === 'your_google_client_id_here') {
      resolve({
        user: null,
        error: 'Google Client ID not configured. Add VITE_GOOGLE_CLIENT_ID to your .env file.',
      });
      return;
    }

    const doGoogleAuth = () => {
      // Use OAuth2 popup flow — works on localhost without HTTPS
      const oauth2 = window.google.accounts.oauth2.initCodeClient({
        client_id: clientId,
        scope: 'email profile openid',
        ux_mode: 'popup',
        callback: async (response) => {
          if (response.error) {
            resolve({ user: null, error: response.error });
            return;
          }
          try {
            // Send auth code to backend to exchange for user
            const { data } = await client.post('/auth/google', {
              code:     response.code,
              role,
            });
            saveSession(data.token, data.user);
            resolve({ user: data.user, error: null });
          } catch (err) {
            resolve({ user: null, error: err.response?.data?.error || err.message });
          }
        },
      });
      oauth2.requestCode();
    };

    // Load GSI script if not already loaded
    if (window.google?.accounts?.oauth2) {
      doGoogleAuth();
    } else {
      // Remove old script if exists
      const old = document.querySelector('script[src*="accounts.google.com/gsi"]');
      if (old) old.remove();
      window._googleInitialized = false;

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload  = doGoogleAuth;
      script.onerror = () => resolve({
        user: null,
        error: 'Failed to load Google Sign-In. Check your internet connection.',
      });
      document.head.appendChild(script);
    }
  });
};

// ── Child PIN login ────────────────────────────────────────────────────────
export const loginChild = async (profileId, pin = null) => {
  try {
    const { data } = await client.post('/auth/child-login', { profileId, pin });
    // Save token — use profile as user object
    const profile = { ...data.profile, role: 'child' };
    saveSession(data.token, profile);
    return { profile, error: null };
  } catch (err) {
    return { profile: null, error: err.response?.data?.error || err.message };
  }
};

// ── Logout ─────────────────────────────────────────────────────────────────
export const logoutUser = async () => {
  if (window.google?.accounts?.id) {
    window.google.accounts.id.disableAutoSelect();
    window._googleInitialized = false;
  }
  try {
    await client.post('/auth/logout');
  } catch (err) {
    console.warn('Logout endpoint failed:', err.message);
  }
  finally {
    clearSession();
  }
  return { error: null };
};

export const logout = logoutUser;

// ── Get current user ───────────────────────────────────────────────────────
export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const fetchCurrentUser = async () => {
  try {
    const { data } = await client.get('/auth/me');
    const user = data.user;
    if (user && data.role) {
      user.role = data.role;
    }
    localStorage.setItem('user', JSON.stringify(user));
    return { user, error: null };
  } catch (err) {
    return { user: null, error: err.response?.data?.error || err.message };
  }
};

export const isAuthenticated = () => !!localStorage.getItem('token');

// ── Password ───────────────────────────────────────────────────────────────
export const sendPasswordReset = async (email) => {
  try {
    const { data } = await client.post('/auth/forgot-password', { email });
    return { message: data.message, resetLink: data.resetLink, error: null };
  } catch (err) {
    return { message: null, resetLink: null, error: err.response?.data?.error || err.message };
  }
};

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const { data } = await client.put('/auth/change-password', { currentPassword, newPassword });
    return { message: data.message, error: null };
  } catch (err) {
    return { message: null, error: err.response?.data?.error || err.message };
  }
};

// ── Verification & Stubs ───────────────────────────────────────────────────
export const sendVerificationEmail = async () => {
  try {
    const { data } = await client.post('/auth/send-verification');
    return { message: data.message, error: null };
  } catch (err) {
    return { message: null, error: err.response?.data?.error || err.message };
  }
};

export const reloadUser = async () => {
  try {
    const { data } = await client.get('/auth/me');
    const user = data.user;
    if (user && data.role) {
      user.role = data.role;
    }
    localStorage.setItem('user', JSON.stringify(user));
    return { user, error: null };
  } catch (err) {
    return { user: null, error: err.response?.data?.error || err.message };
  }
};

export const resetPassword = async (token, password) => {
  try {
    const { data } = await client.post('/auth/reset-password', { token, password });
    return { message: data.message, error: null };
  } catch (err) {
    return { message: null, error: err.response?.data?.error || err.message };
  }
};

export const changeEmail           = async () => ({ message: 'Contact support to change email.', error: null });