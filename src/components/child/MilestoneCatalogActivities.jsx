/**
 * MilestoneCatalogActivities.jsx
 * Displays the comprehensive Milestone-Wise E-Activity & Educational Game Catalog
 * for children aged 0-36 months (ages 0-3 years)
 * Only renders if child's age_months is between 0-36
 */

import { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { getActivitiesForAge, MILESTONE_ACTIVITIES_CATALOG } from '../../data/milestoneActivitiesCatalog';
import './MilestoneCatalogActivities.css';

const DOMAIN_INFO = {
  physical: {
    name: 'Physical Development',
    icon: '💪',
    color: '#10B981',
    description: 'Motor skills, coordination, and physical growth'
  },
  social: {
    name: 'Social Development',
    icon: '👥',
    color: '#3B82F6',
    description: 'Interaction, relationships, and social skills'
  },
  emotional: {
    name: 'Emotional Development',
    icon: '❤️',
    color: '#EF4444',
    description: 'Self-awareness, expression, and emotional regulation'
  },
  cognitive: {
    name: 'Cognitive Development',
    icon: '🧠',
    color: '#8B5CF6',
    description: 'Thinking, learning, and problem-solving'
  },
  aesthetic: {
    name: 'Aesthetic Development',
    icon: '🎨',
    color: '#F59E0B',
    description: 'Creativity, art appreciation, and sensory exploration'
  }
};

export default function MilestoneCatalogActivities() {
  const { profile } = useUser();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);

  // Get child's age in months
  const ageMonths = profile?.age_months;

  // ENHANCED CHECK: Show for children aged 0-36 months OR age_group "1-3"
  const shouldShow = (ageMonths >= 0 && ageMonths <= 36) || profile?.age_group === '1-3';

  if (!shouldShow) {
    console.log('MilestoneCatalogActivities: Not showing. age_months:', ageMonths, 'age_group:', profile?.age_group);
    return null;
  }

  // Determine child's current level based on age
  const effectiveAge = (ageMonths !== undefined && ageMonths !== null) ? ageMonths : 12;
  const currentLevelData = getActivitiesForAge(effectiveAge);
  const currentLevel = currentLevelData?.level;

  // Use selected level or default to current level
  const levelData = selectedLevel ? MILESTONE_ACTIVITIES_CATALOG[selectedLevel] : currentLevelData;

  if (!levelData) {
    return null;
  }

  const { level, ageRange, description, domains } = levelData;

  // Count total activities
  const totalActivities = Object.values(domains).reduce((sum, activities) => sum + activities.length, 0);

  // All available levels
  const allLevels = [
    { key: "0-6", label: "Level 1: 0-6 Months", isCurrent: level === 1 },
    { key: "6-12", label: "Level 2: 6-12 Months", isCurrent: level === 2 },
    { key: "12-18", label: "Level 3: 12-18 Months", isCurrent: level === 3 },
    { key: "18-24", label: "Level 4: 18-24 Months", isCurrent: level === 4 },
    { key: "24-30", label: "Level 5: 24-30 Months", isCurrent: level === 5 },
    { key: "30-36", label: "Level 6: 30-36 Months", isCurrent: level === 6 }
  ];

  return (
    <div className="catalog-section">
      {/* Collapsible Header */}
      <div 
        className="catalog-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="catalog-header-content">
          <div className="catalog-header-left">
            <h2 className="catalog-title">
              <span className="catalog-icon">🎯</span>
              Milestone Activities Catalog
            </h2>
            <p className="catalog-subtitle">
              {currentLevel && <span className="current-level-badge">Your Level: {currentLevel}</span>}
              {' '}Viewing Level {level}: {ageRange} • {totalActivities} Activities
            </p>
            <p className="catalog-description">{description}</p>
          </div>
          <button className="catalog-toggle-btn" onClick={(e) => e.stopPropagation()}>
            {isExpanded ? '−' : '+'}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="catalog-content">
          {/* Level Selector */}
          <div className="level-selector">
            <h3 className="level-selector-title">
              <span>📚</span>
              Choose Age Level
            </h3>
            <div className="level-buttons">
              {allLevels.map((lvl) => (
                <button
                  key={lvl.key}
                  className={`level-btn ${selectedLevel === lvl.key ? 'active' : ''} ${lvl.isCurrent && !selectedLevel ? 'current' : ''}`}
                  onClick={() => {
                    setSelectedLevel(lvl.key);
                    setSelectedDomain(null);
                  }}
                >
                  {lvl.label}
                  {lvl.isCurrent && <span className="current-indicator">★ Current</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Domain Selection Cards */}
          <div className="domain-grid">
            {Object.entries(domains).map(([domainKey, activities]) => {
              const domainInfo = DOMAIN_INFO[domainKey];
              return (
                <div
                  key={domainKey}
                  className="domain-card"
                  onClick={() => setSelectedDomain(selectedDomain === domainKey ? null : domainKey)}
                  style={{ '--domain-color': domainInfo.color }}
                >
                  <div className="domain-card-header">
                    <span className="domain-icon">{domainInfo.icon}</span>
                    <h3 className="domain-name">{domainInfo.name}</h3>
                  </div>
                  <p className="domain-description">{domainInfo.description}</p>
                  <div className="domain-stats">
                    <span className="domain-activity-count">
                      {activities.length} {activities.length === 1 ? 'Activity' : 'Activities'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Domain Activities */}
          {selectedDomain && (
            <div className="domain-activities-section">
              <div className="domain-activities-header">
                <h3>
                  <span>{DOMAIN_INFO[selectedDomain].icon}</span>
                  {DOMAIN_INFO[selectedDomain].name} Activities
                </h3>
                <button
                  className="close-domain-btn"
                  onClick={() => setSelectedDomain(null)}
                >
                  ✕
                </button>
              </div>

              <div className="activities-list">
                {domains[selectedDomain].map((activity, index) => (
                  <div
                    key={index}
                    className="catalog-activity-card"
                    onClick={() => setSelectedActivity(activity)}
                  >
                    <div className="activity-card-top">
                      <h4 className="activity-name">{activity.eActivity}</h4>
                      <span 
                        className="activity-domain-badge"
                        style={{ backgroundColor: DOMAIN_INFO[selectedDomain].color }}
                      >
                        {DOMAIN_INFO[selectedDomain].icon}
                      </span>
                    </div>

                    <div className="activity-milestone">
                      <strong>Milestone:</strong> {activity.milestone}
                    </div>

                    <p className="activity-description">{activity.description}</p>

                    <button className="view-details-btn">
                      View Full Details →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Domains Quick View */}
          {!selectedDomain && (
            <div className="all-domains-preview">
              <h3 className="preview-title">
                <span>📚</span>
                Explore Activities by Domain
              </h3>
              <p className="preview-subtitle">
                Click on any domain card above to view its activities for your child's age group ({ageRange})
              </p>
            </div>
          )}
        </div>
      )}

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <div 
          className="activity-detail-overlay"
          onClick={() => setSelectedActivity(null)}
        >
          <div 
            className="activity-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-btn"
              onClick={() => setSelectedActivity(null)}
            >
              ✕
            </button>

            <div className="modal-header">
              <h2>{selectedActivity.eActivity}</h2>
              <div className="modal-badges">
                <span className="modal-badge">
                  {DOMAIN_INFO[selectedDomain]?.icon} {DOMAIN_INFO[selectedDomain]?.name}
                </span>
                <span className="modal-badge">{ageRange}</span>
              </div>
            </div>

            <div className="modal-body">
              <section className="modal-section">
                <h3>🎯 Milestone</h3>
                <p>{selectedActivity.milestone}</p>
              </section>

              <section className="modal-section">
                <h3>📝 Description</h3>
                <p>{selectedActivity.description}</p>
              </section>

              <section className="modal-section">
                <h3>🎮 Game Idea</h3>
                <p>{selectedActivity.gameIdea}</p>
              </section>

              <section className="modal-section">
                <h3>🤖 AI Integration</h3>
                <p>{selectedActivity.aiIntegration}</p>
              </section>

              <section className="modal-section">
                <h3>✨ Learning Outcome</h3>
                <p>{selectedActivity.learningOutcome}</p>
              </section>
            </div>

            <div className="modal-footer">
              <button className="btn-primary">
                🚀 Start Activity
              </button>
              <button className="btn-secondary">
                🔖 Bookmark
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
