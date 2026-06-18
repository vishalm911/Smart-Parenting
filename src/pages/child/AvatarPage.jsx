import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import { updateUserProfile } from '../../firebase/services';

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
  const [accessory, setAccessory] = useState(profile?.accessory ?? 'hat');
  const [saving, setSaving] = useState(false);

  const selectedChar = CHARACTERS.find((c) => c.id === selected) ?? CHARACTERS[0];

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await updateUserProfile(user.uid, { avatar: selected, accessory: accessory });
    await refreshProfile();
    setSaving(false);
  };

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '40px 24px', minHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl font-bold flex items-center justify-center gap-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          Create Your Avatar ✨
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Pick a character and make it yours!
        </p>
      </motion.div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '48px', justifyContent: 'center', alignItems: 'flex-start' }}>
        
        {/* Left Column: Preview & Save */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 300px', maxWidth: '400px' }}>
          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center mb-8"
          >
            <div
              className="w-56 h-56 rounded-full flex items-center justify-center text-8xl border-4 border-white shadow-2xl mb-4 relative"
              style={{ background: selectedChar.bg }}
            >
              {selectedChar.emoji}
              {accessory && (
                <div
                  className="absolute text-7xl"
                  style={{
                    top: accessory === 'hat' || accessory === 'crown' ? '-24px' : 'auto',
                    bottom: accessory === 'star' || accessory === 'rocket' ? '12px' : 'auto',
                    left: accessory === 'glasses' ? '32px' : 'auto',
                    right: accessory === 'bow' ? '16px' : 'auto',
                    transform: accessory === 'glasses' ? 'scale(1.2)' : 'none',
                    zIndex: 10,
                    filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))',
                  }}
                >
                  {ACCESSORIES.find(a => a.id === accessory)?.emoji}
                </div>
              )}
            </div>
            <h2 className="font-bold text-3xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              {selected}
            </h2>
          </motion.div>

          {/* Save Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={saving}
            className="btn-orange text-xl px-12 py-3 w-full"
            style={{ maxWidth: '280px' }}
          >
            {saving ? 'Saving…' : '✨ Save Avatar'}
          </motion.button>
        </div>

        {/* Right Column: Choices */}
        <div style={{ flex: '2 1 500px', display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {/* Choose Character */}
          <section>
            <h3 className="font-bold text-xl mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              Choose Your Character
            </h3>
            <div className="flex flex-wrap gap-6">
              {CHARACTERS.map((char, i) => (
                <motion.button
                  key={char.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04, type: 'spring', stiffness: 300 }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setSelected(char.id)}
                  className={`avatar-card p-3 flex flex-col items-center gap-2 w-24 ${selected === char.id ? 'selected' : ''}`}
                  style={{ background: char.bg }}
                >
                  <span className="text-5xl">{char.emoji}</span>
                  <span className="text-sm font-bold" style={{ color: '#1A1A1A' }}>{char.id}</span>
                </motion.button>
              ))}
            </div>
          </section>

          {/* Customize Accessories */}
          <section>
            <h3 className="font-bold text-xl mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              Customize Accessories
            </h3>
            <div className="flex flex-wrap gap-6">
              {ACCESSORIES.map((acc, i) => (
                <motion.button
                  key={acc.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.04, type: 'spring' }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setAccessory(acc.id)}
                  className={`avatar-card p-4 flex flex-col items-center gap-2 ${accessory === acc.id ? 'selected' : ''}`}
                  style={{ background: 'var(--bg-card)', minWidth: 96 }}
                >
                  <span className="text-4xl">{acc.emoji}</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{acc.label}</span>
                </motion.button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
