import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { updateUserProfile } from '../firebase/services';

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
    <div className="max-w-4xl mx-auto px-6 py-6">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          Create Your Avatar ✨
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Pick a character and make it yours!
        </p>
      </motion.div>

      {/* Preview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center mb-8"
      >
        <div
          className="w-36 h-36 rounded-full flex items-center justify-center text-7xl border-4 border-white shadow-2xl mb-3 relative"
          style={{ background: selectedChar.bg }}
        >
          {selectedChar.emoji}
          {accessory && (
            <div
              className="absolute text-5xl"
              style={{
                top: accessory === 'hat' || accessory === 'crown' ? '-20px' : 'auto',
                bottom: accessory === 'star' || accessory === 'rocket' ? '10px' : 'auto',
                left: accessory === 'glasses' ? '24px' : 'auto',
                right: accessory === 'bow' ? '12px' : 'auto',
                transform: accessory === 'glasses' ? 'scale(1.2)' : 'none',
                zIndex: 10,
                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))',
              }}
            >
              {ACCESSORIES.find(a => a.id === accessory)?.emoji}
            </div>
          )}
        </div>
        <h2 className="font-bold text-xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          {selected}
        </h2>
      </motion.div>

      {/* Choose Character */}
      <section className="mb-6">
        <h3 className="font-bold text-base mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          Choose Your Character
        </h3>
        <div className="flex flex-wrap gap-3">
          {CHARACTERS.map((char, i) => (
            <motion.button
              key={char.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 300 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setSelected(char.id)}
              className={`avatar-card p-2 flex flex-col items-center gap-1 w-20 ${selected === char.id ? 'selected' : ''}`}
              style={{ background: char.bg }}
            >
              <span className="text-3xl">{char.emoji}</span>
              <span className="text-[10px] font-bold" style={{ color: '#1A1A1A' }}>{char.id}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Customize Accessories */}
      <section className="mb-8">
        <h3 className="font-bold text-base mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          Customize Accessories
        </h3>
        <div className="flex flex-wrap gap-3">
          {ACCESSORIES.map((acc, i) => (
            <motion.button
              key={acc.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.04, type: 'spring' }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setAccessory(acc.id)}
              className={`avatar-card p-3 flex flex-col items-center gap-1 ${accessory === acc.id ? 'selected' : ''}`}
              style={{ background: 'var(--bg-card)', minWidth: 72 }}
            >
              <span className="text-2xl">{acc.emoji}</span>
              <span className="text-[10px] font-semibold" style={{ color: 'var(--text-secondary)' }}>{acc.label}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Save Button */}
      <div className="flex justify-center">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={saving}
          className="btn-orange text-base px-10"
        >
          {saving ? 'Saving…' : '✨ Save Avatar'}
        </motion.button>
      </div>
    </div>
  );
}
