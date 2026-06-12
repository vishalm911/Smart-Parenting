import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import {
  getAllAvatarTypes, saveAvatarType, deleteAvatarType,
  getAllBadgeTypes, saveBadgeType, deleteBadgeType,
  getAllChallenges, addChallenge, updateChallenge, deleteChallenge,
  getRewards, saveReward, deleteReward,
} from '../utils/firestoreHelpers';
import './Admin.css';

const TABS = [
  { key: 'avatars', icon: '👤' },
  { key: 'badges', icon: '🏅' },
  { key: 'challenges', icon: '🎯' },
  { key: 'rewards', icon: '🎁' },
];

const CATEGORIES = ['literacy', 'math', 'creative', 'emotion', 'brain', 'science'];
const REWARD_CATEGORIES = ['hats', 'outfits', 'badges', 'backgrounds'];

export default function Admin() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('avatars');
  const [editItem, setEditItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');

  // Data states
  const [avatars, setAvatars] = useState([]);
  const [badges, setBadges] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [rewards, setRewards] = useState([]);

  useEffect(() => {
    setAvatars(getAllAvatarTypes());
    setBadges(getAllBadgeTypes());
    setChallenges(getAllChallenges());
    setRewards(getRewards());
  }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  function openModal(item = null) {
    setEditItem(item);
    setShowModal(true);
  }

  function closeModal() {
    setEditItem(null);
    setShowModal(false);
  }

  // ---- Avatar CRUD ----
  function handleSaveAvatar(data) {
    const result = saveAvatarType(data);
    setAvatars(result);
    showToast(t('adminSaved'));
    closeModal();
  }

  function handleDeleteAvatar(id) {
    if (!confirm(t('adminDeleteConfirm'))) return;
    setAvatars(deleteAvatarType(id));
    showToast(t('adminSaved'));
  }

  // ---- Badge CRUD ----
  function handleSaveBadge(data) {
    const result = saveBadgeType(data);
    setBadges(result);
    showToast(t('adminSaved'));
    closeModal();
  }

  function handleDeleteBadge(id) {
    if (!confirm(t('adminDeleteConfirm'))) return;
    setBadges(deleteBadgeType(id));
    showToast(t('adminSaved'));
  }

  // ---- Challenge CRUD ----
  function handleSaveChallenge(data) {
    if (data.id && challenges.find(c => c.id === data.id)) {
      setChallenges(updateChallenge(data.id, data));
    } else {
      setChallenges(addChallenge(data));
    }
    showToast(t('adminSaved'));
    closeModal();
  }

  function handleDeleteChallenge(id) {
    if (!confirm(t('adminDeleteConfirm'))) return;
    setChallenges(deleteChallenge(id));
    showToast(t('adminSaved'));
  }

  // ---- Reward CRUD ----
  function handleSaveReward(data) {
    const result = saveReward(data);
    setRewards(result);
    showToast(t('adminSaved'));
    closeModal();
  }

  function handleDeleteReward(id) {
    if (!confirm(t('adminDeleteConfirm'))) return;
    setRewards(deleteReward(id));
    showToast(t('adminSaved'));
  }

  return (
    <div className="admin-page">
      <div className="admin-inner">
        <h1>{t('adminTitle')}</h1>

        {/* Tabs */}
        <div className="admin-tabs">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`admin-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
              id={`admin-tab-${tab.key}`}
            >
              <span className="admin-tab-icon">{tab.icon}</span>
              <span>{t(`admin${tab.key.charAt(0).toUpperCase() + tab.key.slice(1)}`)}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="admin-content">
          {activeTab === 'avatars' && (
            <AdminTable
              items={avatars}
              columns={[
                { key: 'emoji', label: t('adminEmoji'), render: (v) => <span className="table-emoji">{v}</span> },
                { key: 'name', label: t('adminName') },
                { key: 'bg', label: 'Color', render: (v) => <span className="color-dot" style={{ background: v }} /> },
              ]}
              onAdd={() => openModal({ emoji: '😊', name: '', bg: '#FFCDD2' })}
              onEdit={openModal}
              onDelete={handleDeleteAvatar}
              addLabel={t('adminAddAvatar')}
            />
          )}

          {activeTab === 'badges' && (
            <AdminTable
              items={badges}
              columns={[
                { key: 'emoji', label: t('adminEmoji'), render: (v) => <span className="table-emoji">{v}</span> },
                { key: 'name', label: t('adminName') },
                { key: 'category', label: t('adminCategory'), render: (v) => <span className="cat-chip">{v}</span> },
                { key: 'required', label: t('adminRequired') },
              ]}
              onAdd={() => openModal({ emoji: '🏅', name: '', desc: '', category: 'literacy', required: 5 })}
              onEdit={openModal}
              onDelete={handleDeleteBadge}
              addLabel={t('adminAddBadge')}
            />
          )}

          {activeTab === 'challenges' && (
            <AdminTable
              items={challenges}
              columns={[
                { key: 'icon', label: t('adminEmoji'), render: (v) => <span className="table-emoji">{v}</span> },
                { key: 'title', label: t('adminName') },
                { key: 'zone', label: t('adminCategory'), render: (v) => <span className="cat-chip">{v}</span> },
                { key: 'xp', label: t('adminXp') },
                { key: 'difficulty', label: t('adminDifficulty'), render: (v) => '⭐'.repeat(v) },
              ]}
              onAdd={() => openModal({ icon: '🎯', title: '', desc: '', zone: 'literacy', xp: 20, difficulty: 1 })}
              onEdit={openModal}
              onDelete={handleDeleteChallenge}
              addLabel={t('adminAddChallenge')}
            />
          )}

          {activeTab === 'rewards' && (
            <AdminTable
              items={rewards}
              columns={[
                { key: 'emoji', label: t('adminEmoji'), render: (v) => <span className="table-emoji">{v || '—'}</span> },
                { key: 'name', label: t('adminName') },
                { key: 'category', label: t('adminCategory'), render: (v) => <span className="cat-chip">{v}</span> },
                { key: 'coin_cost', label: t('adminCost'), render: (v) => <span>🪙 {v}</span> },
              ]}
              onAdd={() => openModal({ emoji: '🎁', name: '', coin_cost: 10, category: 'hats', item_id: '' })}
              onEdit={openModal}
              onDelete={(id) => handleDeleteReward(id)}
              addLabel={t('adminAddReward')}
              idKey="item_id"
            />
          )}
        </div>

        {/* Toast */}
        {toast && <div className="admin-toast">{toast}</div>}

        {/* Edit Modal */}
        {showModal && (
          <AdminModal
            item={editItem}
            tab={activeTab}
            t={t}
            onSave={(data) => {
              if (activeTab === 'avatars') handleSaveAvatar(data);
              else if (activeTab === 'badges') handleSaveBadge(data);
              else if (activeTab === 'challenges') handleSaveChallenge(data);
              else if (activeTab === 'rewards') handleSaveReward(data);
            }}
            onClose={closeModal}
          />
        )}
      </div>
    </div>
  );
}

// ---- Reusable Admin Table ----
function AdminTable({ items, columns, onAdd, onEdit, onDelete, addLabel, idKey = 'id' }) {
  return (
    <div className="admin-table-wrapper">
      <button className="btn btn-primary btn-sm admin-add-btn" onClick={onAdd}>
        + {addLabel}
      </button>
      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map(col => <th key={col.key}>{col.label}</th>)}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item[idKey] || i}>
                {columns.map(col => (
                  <td key={col.key}>
                    {col.render ? col.render(item[col.key], item) : item[col.key]}
                  </td>
                ))}
                <td className="action-cell">
                  <button className="action-btn edit" onClick={() => onEdit(item)}>✏️</button>
                  <button className="action-btn delete" onClick={() => onDelete(item[idKey])}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---- Admin Edit Modal ----
function AdminModal({ item, tab, t, onSave, onClose }) {
  const [form, setForm] = useState({ ...item });

  function handleChange(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  }

  const fields = {
    avatars: [
      { key: 'emoji', label: t('adminEmoji'), type: 'text' },
      { key: 'name', label: t('adminName'), type: 'text' },
      { key: 'bg', label: 'Background Color', type: 'color' },
    ],
    badges: [
      { key: 'emoji', label: t('adminEmoji'), type: 'text' },
      { key: 'name', label: t('adminName'), type: 'text' },
      { key: 'desc', label: t('adminDesc'), type: 'text' },
      { key: 'category', label: t('adminCategory'), type: 'select', options: CATEGORIES },
      { key: 'required', label: t('adminRequired'), type: 'number' },
    ],
    challenges: [
      { key: 'icon', label: t('adminEmoji'), type: 'text' },
      { key: 'title', label: t('adminName'), type: 'text' },
      { key: 'desc', label: t('adminDesc'), type: 'text' },
      { key: 'zone', label: t('adminCategory'), type: 'select', options: CATEGORIES },
      { key: 'xp', label: t('adminXp'), type: 'number' },
      { key: 'difficulty', label: t('adminDifficulty'), type: 'number', min: 1, max: 3 },
    ],
    rewards: [
      { key: 'emoji', label: t('adminEmoji'), type: 'text' },
      { key: 'name', label: t('adminName'), type: 'text' },
      { key: 'category', label: t('adminCategory'), type: 'select', options: REWARD_CATEGORIES },
      { key: 'coin_cost', label: t('adminCost'), type: 'number' },
    ],
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <form className="admin-modal" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
        <button type="button" className="modal-close" onClick={onClose}>✕</button>
        <h3>{t('adminEditItem')}</h3>

        {fields[tab]?.map(field => (
          <div key={field.key} className="admin-field">
            <label>{field.label}</label>
            {field.type === 'select' ? (
              <select
                value={form[field.key] || ''}
                onChange={e => handleChange(field.key, e.target.value)}
              >
                {field.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                value={form[field.key] ?? ''}
                onChange={e => handleChange(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                min={field.min}
                max={field.max}
              />
            )}
          </div>
        ))}

        {/* Preview */}
        <div className="admin-preview">
          <span className="preview-emoji">{form.emoji || form.icon || '?'}</span>
          <span className="preview-name">{form.name || form.title || 'Preview'}</span>
        </div>

        <div className="admin-modal-actions">
          <button type="button" className="btn btn-sm" onClick={onClose} style={{ background: 'var(--color-divider)', color: 'var(--color-text-secondary)' }}>
            {t('cancel')}
          </button>
          <button type="submit" className="btn btn-primary btn-sm">
            {t('save')}
          </button>
        </div>
      </form>
    </div>
  );
}
