import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../i18n';
import { saveAvatar } from '../utils/firestoreHelpers';
import './Avatar.css';

const AVATARS = [
  { id: 'av1', emoji: '👦🏻', name: 'Alex', bg: '#FFCDD2' },
  { id: 'av2', emoji: '👧🏽', name: 'Priya', bg: '#C8E6C9' },
  { id: 'av3', emoji: '👦🏿', name: 'Kofi', bg: '#BBDEFB' },
  { id: 'av4', emoji: '👧🏻', name: 'Luna', bg: '#F8BBD0' },
  { id: 'av5', emoji: '👦🏾', name: 'Ravi', bg: '#FFE0B2' },
  { id: 'av6', emoji: '👧🏼', name: 'Mia', bg: '#E1BEE7' },
  { id: 'av7', emoji: '🧒🏽', name: 'Ari', bg: '#B2DFDB' },
  { id: 'av8', emoji: '👶🏻', name: 'Benny', bg: '#FFF9C4' },
  { id: 'av9', emoji: '👧🏿', name: 'Amara', bg: '#D1C4E9' },
  { id: 'av10', emoji: '👦🏼', name: 'Leo', bg: '#B3E5FC' },
  { id: 'av11', emoji: '🧒🏾', name: 'Zara', bg: '#FFCCBC' },
  { id: 'av12', emoji: '👶🏽', name: 'Niko', bg: '#DCEDC8' },
];

const ACCESSORIES = {
  hats: [
    { id: 'h0', emoji: '', name: 'None', cost: 0 },
    { id: 'h1', emoji: '🎩', name: 'Top Hat', cost: 0 },
    { id: 'h2', emoji: '👑', name: 'Crown', cost: 20 },
    { id: 'h3', emoji: '🎓', name: 'Grad Cap', cost: 15 },
    { id: 'h4', emoji: '🪖', name: 'Helmet', cost: 10 },
    { id: 'h5', emoji: '🎀', name: 'Bow', cost: 5 },
    { id: 'h6', emoji: '⛑️', name: 'Red Hat', cost: 25 },
  ],
  outfits: [
    { id: 'o0', emoji: '', name: 'None', cost: 0 },
    { id: 'o1', emoji: '🦸', name: 'Hero Cape', cost: 15 },
    { id: 'o2', emoji: '🧑‍🚀', name: 'Space Suit', cost: 30 },
    { id: 'o3', emoji: '🧙', name: 'Wizard Robe', cost: 20 },
    { id: 'o4', emoji: '🥋', name: 'Martial Arts', cost: 10 },
    { id: 'o5', emoji: '👗', name: 'Fancy Dress', cost: 25 },
  ],
  badges: [
    { id: 'b0', emoji: '', name: 'None', cost: 0 },
    { id: 'b1', emoji: '⭐', name: 'Star', cost: 0 },
    { id: 'b2', emoji: '🏅', name: 'Medal', cost: 10 },
    { id: 'b3', emoji: '💎', name: 'Diamond', cost: 30 },
    { id: 'b4', emoji: '🔥', name: 'Fire', cost: 15 },
    { id: 'b5', emoji: '🌈', name: 'Rainbow', cost: 20 },
  ],
  backgrounds: [
    { id: 'bg0', name: 'Default', color: '#F5F0E6', cost: 0 },
    { id: 'bg1', name: 'Sunset', color: 'linear-gradient(135deg, #FF9A56, #FF6B9D)', cost: 10 },
    { id: 'bg2', name: 'Ocean', color: 'linear-gradient(135deg, #2EC4B6, #4FC3F7)', cost: 10 },
    { id: 'bg3', name: 'Galaxy', color: 'linear-gradient(135deg, #7C4DFF, #FF6B9D)', cost: 20 },
    { id: 'bg4', name: 'Forest', color: 'linear-gradient(135deg, #66BB6A, #2EC4B6)', cost: 15 },
    { id: 'bg5', name: 'Gold', color: 'linear-gradient(135deg, #FFD180, #F5A623)', cost: 25 },
  ],
};

// Tab labels are set dynamically via t() in the component

export default function AvatarPage() {
  const { state, dispatch } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const TABS = [
    { key: 'hats', label: t('tabHats') },
    { key: 'outfits', label: t('tabOutfits') },
    { key: 'badges', label: t('tabBadges') },
    { key: 'backgrounds', label: t('tabBackgrounds') },
  ];
  
  const [selectedAvatar, setSelectedAvatar] = useState(state.avatar?.avatarId || 'av1');
  const [activeTab, setActiveTab] = useState('hats');
  const [accessories, setAccessories] = useState({
    hat: state.avatar?.hat || 'h0',
    outfit: state.avatar?.outfit || 'o0',
    badge: state.avatar?.badge || 'b0',
    background: state.avatar?.background || 'bg0',
  });
  const [saveAnimation, setSaveAnimation] = useState(false);

  const avatar = AVATARS.find(a => a.id === selectedAvatar);
  const bgItem = ACCESSORIES.backgrounds.find(b => b.id === accessories.background);
  const hatItem = ACCESSORIES.hats.find(h => h.id === accessories.hat);
  const outfitItem = ACCESSORIES.outfits.find(o => o.id === accessories.outfit);
  const badgeItem = ACCESSORIES.badges.find(b => b.id === accessories.badge);

  function selectAccessory(type, itemId, cost) {
    if (cost > state.coins) return; // can't afford
    const keyMap = { hats: 'hat', outfits: 'outfit', badges: 'badge', backgrounds: 'background' };
    setAccessories(prev => ({ ...prev, [keyMap[type]]: itemId }));
  }

  async function handleSave() {
    const avatarData = {
      avatarId: selectedAvatar,
      ...accessories,
    };
    await saveAvatar(state.childProfile?.id, avatarData);
    dispatch({ type: 'SET_AVATAR', payload: avatarData });
    setSaveAnimation(true);
    setTimeout(() => {
      setSaveAnimation(false);
      navigate('/dashboard');
    }, 1200);
  }

  return (
    <div className="avatar-page">
      <div className="avatar-page-inner">
        {/* Header */}
        <div className="avatar-header">
          <h1>{t('avatarTitle')}</h1>
          <p>{t('avatarDesc')}</p>
        </div>

        {/* Preview Panel */}
        <div className={`avatar-preview-panel ${saveAnimation ? 'saving' : ''}`}>
          <div
            className="avatar-preview"
            style={{ background: bgItem?.color || '#F5F0E6' }}
          >
            <div className="preview-layers">
              {hatItem?.emoji && <span className="preview-hat">{hatItem.emoji}</span>}
              <span className="preview-character">{avatar?.emoji}</span>
              {outfitItem?.emoji && <span className="preview-outfit">{outfitItem.emoji}</span>}
              {badgeItem?.emoji && <span className="preview-badge">{badgeItem.emoji}</span>}
            </div>
          </div>
          <div className="preview-name">{avatar?.name}</div>
          {saveAnimation && <div className="save-flash">{t('avatarSaved')}</div>}
        </div>

        {/* Avatar Gallery */}
        <div className="avatar-section">
          <h3>{t('chooseCharacter')}</h3>
          <div className="avatar-gallery">
            {AVATARS.map((av, i) => (
              <button
                key={av.id}
                className={`avatar-card ${selectedAvatar === av.id ? 'selected' : ''}`}
                style={{ background: av.bg, animationDelay: `${i * 0.05}s` }}
                onClick={() => setSelectedAvatar(av.id)}
                id={`avatar-${av.id}`}
              >
                <span className="avatar-char">{av.emoji}</span>
                <span className="avatar-name-label">{av.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Accessory Tabs */}
        <div className="avatar-section">
          <h3>{t('customizeAccessories')}</h3>
          <div className="accessory-tabs">
            {TABS.map(tab => (
              <button
                key={tab.key}
                className={`acc-tab ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="accessory-grid">
            {ACCESSORIES[activeTab].map((item, i) => {
              const isSelected =
                (activeTab === 'hats' && accessories.hat === item.id) ||
                (activeTab === 'outfits' && accessories.outfit === item.id) ||
                (activeTab === 'badges' && accessories.badge === item.id) ||
                (activeTab === 'backgrounds' && accessories.background === item.id);
              const canAfford = item.cost <= state.coins;

              return (
                <button
                  key={item.id}
                  className={`accessory-item ${isSelected ? 'selected' : ''} ${!canAfford && item.cost > 0 ? 'locked' : ''}`}
                  onClick={() => selectAccessory(activeTab, item.id, item.cost)}
                  disabled={!canAfford && item.cost > 0}
                  style={activeTab === 'backgrounds' ? { background: item.color } : {}}
                >
                  {activeTab !== 'backgrounds' && (
                    <span className="acc-emoji">{item.emoji || '❌'}</span>
                  )}
                  <span className="acc-name">{item.name}</span>
                  {item.cost > 0 && (
                    <span className={`acc-cost ${!canAfford ? 'too-expensive' : ''}`}>
                      🪙 {item.cost}
                    </span>
                  )}
                  {!canAfford && item.cost > 0 && <span className="lock-overlay">🔒</span>}
                </button>
              );
            })}
          </div>
        </div>

        <button className="btn btn-primary btn-lg save-avatar-btn" onClick={handleSave} id="save-avatar-btn">
          {t('saveAvatar')}
        </button>
      </div>
    </div>
  );
}
