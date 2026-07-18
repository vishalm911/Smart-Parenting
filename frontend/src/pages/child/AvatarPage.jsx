import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import { updateUserProfile } from '../../api/services';
import './AvatarPage.css';

const CHARACTERS = [
  { id: 'Alex',  emoji: '👦', bg: '#FFB3BA' },
  { id: 'Priya', emoji: '👧', bg: '#B5EAD7' },
  { id: 'Kofi',  emoji: '👦🏾', bg: '#C7CEEA' },
  { id: 'Luna',  emoji: '👧', bg: '#FFB3BA' },
  { id: 'Ravi',  emoji: '👦🏽', bg: '#FFDAC1' },
  { id: 'Mia',   emoji: '👱‍♀️', bg: '#E2F0CB' },
  { id: 'Ari',   emoji: '🧒🏾', bg: '#B5EAD7' },
  { id: 'Benny', emoji: '👶', bg: '#FFE4B5' },
  { id: 'Amara', emoji: '👧🏾', bg: '#C7CEEA' },
  { id: 'Leo',   emoji: '👦🏼', bg: '#FFDAC1' },
  { id: 'Zara',  emoji: '👧🏽', bg: '#FFB3BA' },
  { id: 'Niko',  emoji: '🧒🏽', bg: '#B5EAD7' },
];

const ACCESSORIES = [
  { id: 'none',     label: 'None',        emoji: '❌' },
  { id: 'hat',      label: 'Top Hat',     emoji: '🎩' },
  { id: 'crown',    label: 'Crown',       emoji: '👑' },
  { id: 'glasses',  label: 'Glasses',     emoji: '👓' },
  { id: 'bow',      label: 'Bow',         emoji: '🎀' },
  { id: 'star',     label: 'Star Badge',  emoji: '⭐' },
  { id: 'rocket',   label: 'Rocket',      emoji: '🚀' },
];

export default function AvatarPage() {
  const { user, profile, refreshProfile } = useUser();
  const [selected, setSelected] = useState(profile?.avatar ?? 'Alex');
  const [accessory, setAccessory] = useState(profile?.accessory ?? 'none');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (profile?.avatar) {
      setSelected(profile.avatar);
    }
    if (profile?.accessory) {
      setAccessory(profile.accessory);
    }
  }, [profile?.avatar, profile?.accessory]);

  const selectedChar = CHARACTERS.find((c) => c.id === selected) ?? CHARACTERS[0];

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      await updateUserProfile(user.uid, { avatar: selected, accessory: accessory });
      await refreshProfile();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.warn('Failed to update avatar details:', e);
    }
    setSaving(false);
  };

  return (
    <div className="avatar-container">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="avatar-header"
      >
        <h1 className="avatar-title">
          Create Your Avatar ✨
        </h1>
        <p className="avatar-subtitle">
          Pick a character and customize with accessories!
        </p>
      </motion.div>

      <div className="avatar-layout">
        
        {/* Left Column: Preview & Save */}
        <div className="avatar-preview-panel">
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="save-alert-banner"
            >
              🎉 Avatar Saved Successfully!
            </motion.div>
          )}

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="avatar-circle-preview"
            style={{ background: selectedChar.bg }}
          >
            {selectedChar.emoji}
            {accessory && accessory !== 'none' && (
              <div
                className="avatar-accessory-floating"
                style={{
                  top: accessory === 'hat' || accessory === 'crown' ? '-24px' : 'auto',
                  bottom: accessory === 'star' || accessory === 'rocket' ? '12px' : 'auto',
                  left: accessory === 'glasses' ? '32px' : 'auto',
                  right: accessory === 'bow' ? '16px' : 'auto',
                  transform: accessory === 'glasses' ? 'scale(1.2)' : 'none',
                }}
              >
                {ACCESSORIES.find(a => a.id === accessory)?.emoji}
              </div>
            )}
          </motion.div>
          
          <h2 className="avatar-name-label">{selected}</h2>

          {/* Save Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={saving}
            className="btn-orange text-xl px-12 py-3 w-full"
            style={{ maxWidth: '280px', marginTop: '16px' }}
          >
            {saving ? 'Saving...' : '✨ Save Avatar'}
          </motion.button>
        </div>

        {/* Right Column: Choices */}
        <div className="avatar-choices-panel">
          
          {/* Choose Character */}
          <div className="avatar-choices-section">
            <h3 className="choices-title">
              <span>👤</span> Choose Your Character
            </h3>
            <div className="choices-grid-characters">
              {CHARACTERS.map((char, i) => (
                <motion.button
                  key={char.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03, type: 'spring', stiffness: 300 }}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setSelected(char.id)}
                  className={`char-card-btn ${selected === char.id ? 'selected' : ''}`}
                  style={{ background: char.bg }}
                >
                  <span className="char-card-emoji">{char.emoji}</span>
                  <span className="char-card-name">{char.id}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Customize Accessories */}
          <div className="avatar-choices-section">
            <h3 className="choices-title">
              <span>👑</span> Customize Accessories
            </h3>
            <div className="choices-grid-accessories">
              {ACCESSORIES.map((acc, i) => (
                <motion.button
                  key={acc.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 + i * 0.03, type: 'spring' }}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setAccessory(acc.id)}
                  className={`acc-card-btn ${accessory === acc.id ? 'selected' : ''}`}
                >
                  <span className="acc-card-emoji">{acc.emoji}</span>
                  <span className="acc-card-label">{acc.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
