import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Users, Brain, Heart, TrendingUp } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { adminService } from '../../services/admin.service';
import { AnimatedButton } from '../../components/AnimatedButton';

const AnalyticsView = () => {
  const {
    users,
    cognitiveScores,
    emotionScores,
    setUsers,
    setCognitiveScores,
    setEmotionScores,
    setLoading,
  } = useAdminStore();
  const [selectedChild, setSelectedChild] = useState<string>('all');
  const [ageFilter, setAgeFilter] = useState<string>('all');

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const [allUsers, cognitive, emotional] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getCognitiveScores(),
        adminService.getEmotionScores(),
      ]);

      setUsers(allUsers);
      setCognitiveScores(cognitive);
      setEmotionScores(emotional);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const csv = await adminService.exportScoresToCSV(
        selectedChild === 'all' ? undefined : selectedChild
      );
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `spaceece-scores-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  const children = users.filter((u) => u.role === 'child');

  const selectedChildData = selectedChild === 'all'
    ? children
    : children.filter((c) => c.id === selectedChild);

  const avgCognitiveScore =
    cognitiveScores.length > 0
      ? Math.round(
          cognitiveScores.reduce((sum, s) => sum + s.score, 0) / cognitiveScores.length
        )
      : 0;

  const avgEmotionalScore =
    emotionScores.length > 0
      ? Math.round(
          emotionScores.reduce((sum, s) => sum + s.score, 0) / emotionScores.length
        )
      : 0;

  const avgAccuracy =
    cognitiveScores.length > 0
      ? Math.round(
          cognitiveScores.reduce((sum, s) => sum + s.accuracy, 0) / cognitiveScores.length
        )
      : 0;

  const totalActivities = cognitiveScores.length + emotionScores.length;

  return (
    <div className="min-h-screen bg-light p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-dark mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">View performance metrics and insights</p>
          </div>
          <AnimatedButton onClick={handleExportCSV} icon={<Download size={20} />}>
            Export CSV
          </AnimatedButton>
        </div>

        {/* Filters */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-dark mb-2">
                Select Child
              </label>
              <select
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="input-field"
              >
                <option value="all">All Children ({children.length})</option>
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:w-64">
              <label className="block text-sm font-semibold text-dark mb-2">
                Age Group
              </label>
              <select
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">All Ages</option>
                <option value="5-7">5-7 years</option>
                <option value="8-10">8-10 years</option>
                <option value="11-12">11-12 years</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-info/20 flex items-center justify-center">
                <Users size={24} className="text-info" />
              </div>
            </div>
            <h3 className="text-3xl font-extrabold text-dark mb-1">
              {selectedChildData.length}
            </h3>
            <p className="text-sm text-gray-600">Active Children</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Brain size={24} className="text-primary" />
              </div>
            </div>
            <h3 className="text-3xl font-extrabold text-dark mb-1">{avgCognitiveScore}</h3>
            <p className="text-sm text-gray-600">Avg Cognitive Score</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-error/20 flex items-center justify-center">
                <Heart size={24} className="text-error" />
              </div>
            </div>
            <h3 className="text-3xl font-extrabold text-dark mb-1">{avgEmotionalScore}</h3>
            <p className="text-sm text-gray-600">Avg Emotional Score</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-success/20 flex items-center justify-center">
                <TrendingUp size={24} className="text-success" />
              </div>
            </div>
            <h3 className="text-3xl font-extrabold text-dark mb-1">{avgAccuracy}%</h3>
            <p className="text-sm text-gray-600">Avg Accuracy</p>
          </motion.div>
        </div>

        {/* Children List */}
        <div className="card mb-8">
          <h2 className="text-2xl font-extrabold text-dark mb-4">Children Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-dark">Name</th>
                  <th className="text-center py-3 px-4 font-semibold text-dark">Level</th>
                  <th className="text-center py-3 px-4 font-semibold text-dark">
                    Cognitive
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-dark">
                    Emotional
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-dark">
                    Activities
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-dark">Streak</th>
                </tr>
              </thead>
              <tbody>
                {selectedChildData.map((child) => {
                  const childCogScores = cognitiveScores.filter(
                    (s) => s.childId === child.id
                  );
                  const childEmoScores = emotionScores.filter(
                    (s) => s.childId === child.id
                  );

                  const cogScore =
                    childCogScores.length > 0
                      ? Math.round(
                          childCogScores.reduce((sum, s) => sum + s.score, 0) /
                            childCogScores.length
                        )
                      : 0;

                  const emoScore =
                    childEmoScores.length > 0
                      ? Math.round(
                          childEmoScores.reduce((sum, s) => sum + s.score, 0) /
                            childEmoScores.length
                        )
                      : 0;

                  return (
                    <tr key={child.id} className="border-b border-gray-100 hover:bg-light-cream">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-yellow flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {child.displayName?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-dark">{child.displayName}</p>
                            <p className="text-xs text-gray-500">{child.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-lg font-semibold">
                          {child.level}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className="font-semibold text-dark">{cogScore}</span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className="font-semibold text-dark">{emoScore}</span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className="font-semibold text-dark">
                          {childCogScores.length + childEmoScores.length}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className="font-semibold text-dark">{child.streak} 🔥</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Breakdown */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-extrabold text-dark mb-4">Cognitive Activities</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-light-cream rounded-xl">
                <span className="font-semibold text-dark">Memory Games</span>
                <span className="font-bold text-primary">
                  {cognitiveScores.filter((s) => s.gameType === 'memory').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-light-cream rounded-xl">
                <span className="font-semibold text-dark">Sequence Builder</span>
                <span className="font-bold text-primary">
                  {cognitiveScores.filter((s) => s.gameType === 'sequence').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-light-cream rounded-xl">
                <span className="font-semibold text-dark">Pattern Finder</span>
                <span className="font-bold text-primary">
                  {cognitiveScores.filter((s) => s.gameType === 'pattern').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-light-cream rounded-xl">
                <span className="font-semibold text-dark">Maze Challenge</span>
                <span className="font-bold text-primary">
                  {cognitiveScores.filter((s) => s.gameType === 'maze').length}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-extrabold text-dark mb-4">Emotion Activities</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-light-cream rounded-xl">
                <span className="font-semibold text-dark">Recognition</span>
                <span className="font-bold text-error">
                  {emotionScores.filter((s) => s.activityType === 'recognition').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-light-cream rounded-xl">
                <span className="font-semibold text-dark">Friendship Stories</span>
                <span className="font-bold text-error">
                  {
                    emotionScores.filter((s) => s.activityType === 'friendship-story')
                      .length
                  }
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-light-cream rounded-xl">
                <span className="font-semibold text-dark">Decision Making</span>
                <span className="font-bold text-error">
                  {
                    emotionScores.filter((s) => s.activityType === 'decision-making')
                      .length
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
