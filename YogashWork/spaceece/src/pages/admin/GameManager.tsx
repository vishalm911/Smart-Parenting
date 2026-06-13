import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Eye, EyeOff, Search, Filter } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { adminService } from '../../services/admin.service';
import { useAuthStore } from '../../store/authStore';
import type { CognitiveGame } from '../../types';
import { Modal } from '../../components/Modal';
import { AnimatedButton } from '../../components/AnimatedButton';

const GameManager = () => {
  const { user } = useAuthStore();
  const { games, setGames, addGame, updateGame, deleteGame, setLoading } = useAdminStore();
  const [showModal, setShowModal] = useState(false);
  const [editingGame, setEditingGame] = useState<CognitiveGame | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [formData, setFormData] = useState({
    type: 'memory' as 'memory' | 'sequence' | 'pattern' | 'maze',
    title: '',
    description: '',
    ageGroup: '5-7' as '5-7' | '8-10' | '11-12',
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    pointsReward: 100,
    xpReward: 50,
    active: true,
  });

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      const gamesData = await adminService.getGames();
      setGames(gamesData);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (editingGame) {
        // Update existing game
        await adminService.updateGame(editingGame.id, formData);
        updateGame(editingGame.id, formData);
      } else {
        // Create new game
        const gameId = await adminService.createGame({
          ...formData,
          contentData: getDefaultContentData(formData.type),
          createdBy: user?.id || 'admin',
        });

        addGame({
          id: gameId,
          ...formData,
          contentData: getDefaultContentData(formData.type),
          createdBy: user?.id || 'admin',
          createdAt: new Date().toISOString(),
        });
      }

      setShowModal(false);
      setEditingGame(null);
      resetForm();
    } catch (error) {
      console.error('Error saving game:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultContentData = (type: string) => {
    switch (type) {
      case 'memory':
        return { cards: [], pairCount: 6 };
      case 'sequence':
        return { sequence: [], maxLevel: 10 };
      case 'pattern':
        return { grid: [], correctAnswer: '' };
      case 'maze':
        return { mazeLayout: [], startPos: [0, 0], endPos: [9, 9] };
      default:
        return {};
    }
  };

  const handleEdit = (game: CognitiveGame) => {
    setEditingGame(game);
    setFormData({
      type: game.type,
      title: game.title,
      description: game.description,
      ageGroup: game.ageGroup,
      difficulty: game.difficulty,
      pointsReward: game.pointsReward,
      xpReward: game.xpReward,
      active: game.active,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this game?')) return;

    try {
      setLoading(true);
      await adminService.deleteGame(id);
      deleteGame(id);
    } catch (error) {
      console.error('Error deleting game:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (game: CognitiveGame) => {
    try {
      const newActiveState = !game.active;
      await adminService.updateGame(game.id, { active: newActiveState });
      updateGame(game.id, { active: newActiveState });
    } catch (error) {
      console.error('Error toggling game status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'memory',
      title: '',
      description: '',
      ageGroup: '5-7',
      difficulty: 'easy',
      pointsReward: 100,
      xpReward: 50,
      active: true,
    });
  };

  const filteredGames = games.filter((game) => {
    const matchesSearch =
      game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || game.type === filterType;
    return matchesSearch && matchesType;
  });

  const gameTypeColors: Record<string, string> = {
    memory: '#3B82F6',
    sequence: '#8B5CF6',
    pattern: '#F2A100',
    maze: '#22C55E',
  };

  return (
    <div className="min-h-screen bg-light p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-dark mb-2">Cognitive Games</h1>
            <p className="text-gray-600">Manage brain world activities</p>
          </div>
          <AnimatedButton
            onClick={() => {
              setEditingGame(null);
              resetForm();
              setShowModal(true);
            }}
            icon={<Plus size={20} />}
          >
            Add New Game
          </AnimatedButton>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-12"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-field md:w-48"
            >
              <option value="all">All Types</option>
              <option value="memory">Memory Match</option>
              <option value="sequence">Sequence Builder</option>
              <option value="pattern">Pattern Finder</option>
              <option value="maze">Maze Challenge</option>
            </select>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${gameTypeColors[game.type]}20` }}
                >
                  <span className="text-2xl">
                    {game.type === 'memory' && '🧠'}
                    {game.type === 'sequence' && '🔢'}
                    {game.type === 'pattern' && '🎯'}
                    {game.type === 'maze' && '🌀'}
                  </span>
                </div>
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    game.active
                      ? 'bg-success/10 text-success'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {game.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-dark mb-2">{game.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{game.description}</p>

              {/* Meta */}
              <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                <div className="bg-light-cream rounded-lg p-2 text-center">
                  <span className="text-gray-600">Age</span>
                  <p className="font-semibold text-dark">{game.ageGroup}</p>
                </div>
                <div className="bg-light-cream rounded-lg p-2 text-center">
                  <span className="text-gray-600">Difficulty</span>
                  <p className="font-semibold text-dark capitalize">{game.difficulty}</p>
                </div>
                <div className="bg-light-cream rounded-lg p-2 text-center">
                  <span className="text-gray-600">Points</span>
                  <p className="font-semibold text-dark">{game.pointsReward}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(game)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-info/10 text-info rounded-xl font-semibold hover:bg-info/20 transition-colors"
                >
                  <Edit2 size={16} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleToggleActive(game)}
                  className="px-4 py-2 bg-light-cream rounded-xl hover:bg-light-orange transition-colors"
                >
                  {game.active ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button
                  onClick={() => handleDelete(game.id)}
                  className="px-4 py-2 bg-error/10 text-error rounded-xl hover:bg-error/20 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredGames.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-gray-500 mb-4">No games found</p>
            <AnimatedButton onClick={() => setShowModal(true)} icon={<Plus size={20} />}>
              Create Your First Game
            </AnimatedButton>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingGame(null);
          resetForm();
        }}
        title={editingGame ? 'Edit Game' : 'Add New Game'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-dark mb-2">Game Type</label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as any })
              }
              className="input-field"
              required
            >
              <option value="memory">Memory Match</option>
              <option value="sequence">Sequence Builder</option>
              <option value="pattern">Pattern Finder</option>
              <option value="maze">Maze Challenge</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field"
              placeholder="e.g., Memory Match - Animals"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              rows={3}
              placeholder="Brief description of the game..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Age Group</label>
              <select
                value={formData.ageGroup}
                onChange={(e) =>
                  setFormData({ ...formData, ageGroup: e.target.value as any })
                }
                className="input-field"
              >
                <option value="5-7">5-7 years</option>
                <option value="8-10">8-10 years</option>
                <option value="11-12">11-12 years</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({ ...formData, difficulty: e.target.value as any })
                }
                className="input-field"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Points Reward
              </label>
              <input
                type="number"
                value={formData.pointsReward}
                onChange={(e) =>
                  setFormData({ ...formData, pointsReward: parseInt(e.target.value) })
                }
                className="input-field"
                min="0"
                step="10"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                XP Reward
              </label>
              <input
                type="number"
                value={formData.xpReward}
                onChange={(e) =>
                  setFormData({ ...formData, xpReward: parseInt(e.target.value) })
                }
                className="input-field"
                min="0"
                step="5"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-5 h-5 rounded"
            />
            <label htmlFor="active" className="text-sm font-semibold text-dark">
              Active (visible to users)
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingGame(null);
                resetForm();
              }}
              className="flex-1 px-6 py-3 rounded-2xl font-semibold text-gray-700 hover:bg-light-cream transition-colors"
            >
              Cancel
            </button>
            <AnimatedButton type="submit" className="flex-1">
              {editingGame ? 'Update Game' : 'Create Game'}
            </AnimatedButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GameManager;
