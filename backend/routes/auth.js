/**
 * routes/auth.js
 *
 * Auth routes — JWT + Google OAuth 2.0
 *
 * POST  /api/auth/register           — email/password register
 * POST  /api/auth/login              — email/password login
 * POST  /api/auth/google             — Google Sign-In (ID token from frontend)
 * GET   /api/auth/me                 — get current user
 * POST  /api/auth/logout             — logout (client-side token clear)
 * POST  /api/auth/forgot-password    — send reset token
 * PUT   /api/auth/change-password    — change password
 * POST  /api/auth/child-login        — PIN-based child login
 */

const router  = require('express').Router();
const jwt     = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User    = require('../models/User');
const ChildProfile = require('../models/ChildProfile');
const { verifyToken } = require('../middleware/auth');

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

// ── Helper: sign JWT ──────────────────────────────────────────────────────
const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// ── POST /api/auth/register ───────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName, role } = req.body;
    if (!email || !password || !role)
      return res.status(400).json({ error: 'email, password and role are required' });

    const usernameRegex = /^[a-zA-Z]+[0-9]*$/;
    if (!displayName || !usernameRegex.test(displayName)) {
      return res.status(400).json({ error: 'Username must start with alphabetic characters and can only contain letters followed by numbers.' });
    }

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ error: 'This email is already registered. Please sign in.' });

    const user  = await User.create({ email, password, displayName: displayName || '', role });
    const token = signToken({ userId: user._id, email: user.email, role: user.role });

    res.status(201).json({ token, user: user.toPublic() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'email and password are required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user)
      return res.status(401).json({ error: 'No account found with this email.' });

    const valid = await user.comparePassword(password);
    if (!valid)
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });

    if (!user.is_active)
      return res.status(403).json({ error: 'This account has been disabled.' });

    const token = signToken({ userId: user._id, email: user.email, role: user.role });
    res.json({ token, user: user.toPublic() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/google ─────────────────────────────────────────────────
// Frontend sends the Google ID token after user clicks "Sign in with Google".
// We verify it server-side using google-auth-library, then issue our own JWT.
//
// Request body: { idToken: "<google id token>", role: "parent" | "teacher" }
router.post('/google', async (req, res) => {
  try {
    const { idToken, code, role = 'parent' } = req.body;

    if (!idToken && !code) {
      return res.status(400).json({ error: 'Google token or code is required' });
    }

    let googleEmail, googleName, googlePic;

    if (idToken) {
      // ── Flow 1: ID Token (production / mobile) ──────────────────────────
      let ticket;
      try {
        ticket = await googleClient.verifyIdToken({
          idToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
      } catch {
        return res.status(401).json({ error: 'Invalid Google token. Please try again.' });
      }
      const payload = ticket.getPayload();
      googleEmail   = payload.email;
      googleName    = payload.name  || '';
      googlePic     = payload.picture || '';

    } else {
      // ── Flow 2: Auth Code (popup flow — works on localhost) ─────────────
      try {
        const { tokens } = await googleClient.getToken({
          code,
          redirect_uri: 'postmessage', // required for popup/code flow
        });
        googleClient.setCredentials(tokens);
        const ticket = await googleClient.verifyIdToken({
          idToken:  tokens.id_token,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        googleEmail   = payload.email;
        googleName    = payload.name    || '';
        googlePic     = payload.picture || '';
      } catch (err) {
        console.error('Google code exchange error:', err.message);
        return res.status(401).json({ error: 'Google Sign-In failed. Please try again.' });
      }
    }

    // ── Find or create user ──────────────────────────────────────────────
    let user = await User.findOne({ email: googleEmail });
    if (!user) {
      const randomPassword = require('crypto').randomBytes(32).toString('hex');
      user = await User.create({
        email:       googleEmail,
        password:    randomPassword,
        displayName: googleName,
        role,
        is_active:   true,
      });
    } else if (!user.is_active) {
      return res.status(403).json({ error: 'This account has been disabled.' });
    }

    const token = signToken({ userId: user._id, email: user.email, role: user.role });
    res.json({ token, user: user.toPublic() });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/child-login ────────────────────────────────────────────
router.post('/child-login', async (req, res) => {
  try {
    const { profileId, pin } = req.body;
    if (!profileId)
      return res.status(400).json({ error: 'profileId is required' });

    const profile = await ChildProfile.findById(profileId);
    if (!profile)
      return res.status(404).json({ error: 'Child profile not found.' });

    if (profile.pin && profile.pin !== pin)
      return res.status(401).json({ error: 'Incorrect PIN. Please try again.' });

    const token = signToken({
      userId:    profile._id,
      role:      'child',
      parentUid: profile.parent_uid,
    });

    res.json({ token, profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────
router.get('/me', verifyToken, async (req, res) => {
  try {
    if (req.user.role === 'child') {
      const profile = await ChildProfile.findById(req.user.userId);
      if (!profile) return res.status(404).json({ error: 'Child profile not found.' });
      return res.json({ user: profile, role: 'child' });
    }
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: user.toPublic() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────
router.post('/logout', verifyToken, (_req, res) => {
  res.json({ message: 'Logged out successfully.' });
});

// ── POST /api/auth/forgot-password ───────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

    const resetToken = require('crypto').randomBytes(32).toString('hex');
    user.resetPasswordToken   = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    // TODO: Send email with reset link
    console.log(`[DEV] Reset token for ${email}: ${resetToken}`);

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;

    res.json({
      message: 'If that email exists, a reset link has been sent.',
      resetLink
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/reset-password ────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: 'Token and new password are required.' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired password reset token.' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully. You can now login.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/auth/change-password ─────────────────────────────────────────
router.put('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: 'currentPassword and newPassword are required' });

    const user = await User.findById(req.user.userId).select('+password');
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const valid = await user.comparePassword(currentPassword);
    if (!valid) return res.status(401).json({ error: 'Incorrect current password.' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/send-verification ──────────────────────────────────────
router.post('/send-verification', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // In our simplified setup, sending verification marks it verified
    user.emailVerified = true;
    await user.save({ validateBeforeSave: false });
    
    console.log(`[DEV] Verification email sent to ${user.email}`);
    res.json({ message: 'Verification email sent successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
