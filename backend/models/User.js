/**
 * models/User.js
 *
 * Replaces:
 *   • Firebase Auth (email/password, displayName, emailVerified)
 *   • Firestore  user_accounts collection
 *
 * Fields mirror the original Firestore schema exactly so that the
 * frontend code that reads userAccount.role / userAccount.displayName
 * continues to work without changes.
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    email:       { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:    { type: String, required: true, minlength: 6, select: false }, // never returned by default
    displayName: { type: String, default: '' },
    role:        { type: String, enum: ['parent', 'teacher', 'admin', 'child'], required: true },
    is_active:   { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
    linked_child_profiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ChildProfile' }],
    notifPrefs: {
      emailNotifs:    { type: Boolean, default: true },
      pushNotifs:     { type: Boolean, default: true },
      activityAlerts: { type: Boolean, default: true },
      weeklyReport:   { type: Boolean, default: false },
    },

    // Password reset support (replaces Firebase sendPasswordResetEmail)
    resetPasswordToken:   { type: String, select: false },
    resetPasswordExpires: { type: Date,   select: false },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare plaintext password to stored hash
UserSchema.methods.comparePassword = async function (plaintext) {
  return bcrypt.compare(plaintext, this.password);
};

// Return a safe public object (no password)
UserSchema.methods.toPublic = function () {
  return {
    uid:         this._id.toString(),
    email:       this.email,
    displayName: this.displayName,
    role:        this.role,
    is_active:   this.is_active,
    emailVerified: this.emailVerified,
    linked_child_profiles: this.linked_child_profiles,
    notifPrefs:  this.notifPrefs || { emailNotifs: true, pushNotifs: true, activityAlerts: true, weeklyReport: false },
    created_at:  this.created_at,
    updated_at:  this.updated_at,
  };
};

module.exports = mongoose.model('User', UserSchema);
