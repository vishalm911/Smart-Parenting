import { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import './MilestoneActivities.css';

// Import the milestone data
import milestonesData from '../../data/milestones_0_3.json';

export default function MilestoneActivities() {
  const { profile } = useUser();
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [expandedMilestone, setExpandedMilestone] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Get age from age_months field (used for 1-3 age group)
  const childAge = profile?.age_months;
  
  // Debug: Log the child's age
  console.log('=== MilestoneActivities Debug ===');
  console.log('Child Age (months):', childAge);
  console.log('Age Group:', profile?.age_group);
  console.log('Full Profile:', profile);
  console.log('================================');
  
  // TEMPORARY: Show for ALL users for testing/demo purposes
  // TODO: In production, uncomment the age_group check below
  
  // For testing/demo: Show for age group 1-3 even if age_months is not set
  // In production, this should only show when age_months is properly set
  // if (profile?.age_group !== '1-3' && (childAge === undefined || childAge === null || childAge > 36)) {
  //   console.log('MilestoneActivities - Not displaying (not age group 1-3 or age out of range)');
  //   return null;
  // }
  
  // If age_months is not set but age_group is 1-3, default to 12 months for demo
  const effectiveAge = childAge === null || childAge === undefined ? 12 : (childAge === 0 ? 1 : childAge);
  
  console.log('Effective Age used for milestone selection:', effectiveAge);
  
  // Find the appropriate milestone data based on age
  const getCurrentMilestone = () => {
    if (effectiveAge <= 3) return milestonesData.find(m => m.ageRange === "0-3 months");
    if (effectiveAge <= 6) return milestonesData.find(m => m.ageRange === "3-6 months");
    if (effectiveAge <= 9) return milestonesData.find(m => m.ageRange === "6-9 months");
    if (effectiveAge <= 12) return milestonesData.find(m => m.ageRange === "9-12 months");
    if (effectiveAge <= 18) return milestonesData.find(m => m.ageRange === "12-18 months");
    if (effectiveAge <= 24) return milestonesData.find(m => m.ageRange === "18-24 months");
    if (effectiveAge <= 30) return milestonesData.find(m => m.ageRange === "24-30 months");
    if (effectiveAge <= 36) return milestonesData.find(m => m.ageRange === "30-36 months");
    return null;
  };

  const currentMilestone = getCurrentMilestone();

  if (!currentMilestone) {
    console.log('MilestoneActivities - No milestone data found for age:', effectiveAge);
    return null;
  }

  console.log('MilestoneActivities - Displaying milestone for:', currentMilestone.ageRange);

  return (
    <div className="milestone-activities-section">
      {/* Collapsible Header */}
      <div 
        className="milestone-header milestone-header-collapsible" 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div>
            <h2 className="milestone-title">
              <span className="milestone-icon">🎯</span>
              Milestone Activities for {currentMilestone.ageRange}
            </h2>
            <p className="milestone-subtitle">
              Click to {isExpanded ? 'hide' : 'view'} age-appropriate activities for your child's development
            </p>
          </div>
          <button 
            className="milestone-toggle-btn"
            style={{
              background: 'rgba(255,255,255,0.3)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.3s ease',
              flexShrink: 0,
              marginLeft: '16px'
            }}
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="milestone-content-wrapper">
          {/* Skills Development Cards */}
          <div className="milestone-skills">
            <h3 className="skills-title">
              <span className="skills-icon">🌟</span>
              Key Skills to Develop
            </h3>
            <div className="skills-grid">
              {currentMilestone.skills.map((skill, index) => (
                <div key={index} className="skill-card">
                  <h4 className="skill-name">{skill.skill}</h4>
                  <p className="skill-description">{skill.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Activities Section */}
          <div className="milestone-activities-list">
            <h3 className="activities-title">
              <span className="activities-icon">🎨</span>
              Recommended Activities
            </h3>
            <div className="activities-grid">
              {currentMilestone.activities.map((activity, index) => (
                <div 
                  key={index} 
                  className="activity-card"
                  onClick={() => setSelectedActivity(activity)}
                >
                  <div className="activity-card-header">
                    <h4 className="activity-name">{activity.name}</h4>
                    <span className="activity-category-badge">{activity.category}</span>
                  </div>
                  
                  <div className="activity-preview">
                    <div className="activity-info-row">
                      <span className="activity-label">Age Group:</span>
                      <span className="activity-value">{activity.ageGroup} months</span>
                    </div>
                    <p className="activity-objective-preview">{activity.objective}</p>
                  </div>

                  <button className="activity-view-btn">
                    View Details →
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* All Milestones Preview */}
          <div className="all-milestones-section">
            <h3 className="all-milestones-title">
              <span>📋</span>
              View All Milestone Groups
            </h3>
            <div className="milestones-accordion">
              {milestonesData.map((milestone, index) => (
                <div key={index} className="milestone-accordion-item">
                  <button
                    className={`milestone-accordion-btn ${expandedMilestone === index ? 'active' : ''}`}
                    onClick={() => setExpandedMilestone(expandedMilestone === index ? null : index)}
                  >
                    <span className="milestone-age-range">{milestone.ageRange}</span>
                    <span className="milestone-activity-count">
                      {milestone.activities.length} activities
                    </span>
                    <span className="accordion-icon">
                      {expandedMilestone === index ? '−' : '+'}
                    </span>
                  </button>
                  
                  {expandedMilestone === index && (
                    <div className="milestone-accordion-content">
                      <div className="accordion-skills">
                        <h4>Skills:</h4>
                        <div className="accordion-skills-list">
                          {milestone.skills.map((skill, idx) => (
                            <span key={idx} className="accordion-skill-tag">
                              {skill.skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="accordion-activities">
                        <h4>Activities:</h4>
                        <ul className="accordion-activities-list">
                          {milestone.activities.map((activity, idx) => (
                            <li key={idx} className="accordion-activity-item">
                              <strong>{activity.name}</strong> - {activity.category}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <div className="activity-modal-overlay" onClick={() => setSelectedActivity(null)}>
          <div className="activity-modal" onClick={(e) => e.stopPropagation()}>
            <button className="activity-modal-close" onClick={() => setSelectedActivity(null)}>
              ✕
            </button>
            
            <div className="activity-modal-header">
              <h2 className="activity-modal-title">{selectedActivity.name}</h2>
              <div className="activity-modal-badges">
                <span className="badge-category">{selectedActivity.category}</span>
                <span className="badge-age">Age {selectedActivity.ageGroup} months</span>
              </div>
            </div>

            <div className="activity-modal-content">
              <section className="activity-section">
                <h3 className="section-title">📦 Materials Needed</h3>
                <ul className="materials-list">
                  {selectedActivity.materials.map((material, idx) => (
                    <li key={idx} className="material-item">{material}</li>
                  ))}
                </ul>
              </section>

              <section className="activity-section">
                <h3 className="section-title">🛠️ Setup Instructions</h3>
                <p className="section-content">{selectedActivity.setup}</p>
              </section>

              <section className="activity-section">
                <h3 className="section-title">🎯 Learning Objective</h3>
                <p className="section-content">{selectedActivity.objective}</p>
              </section>

              <section className="activity-section">
                <h3 className="section-title">✨ Expected Outcome</h3>
                <p className="section-content">{selectedActivity.outcome}</p>
              </section>

              <section className="activity-section">
                <h3 className="section-title">📚 Research Support</h3>
                <ul className="research-list">
                  {selectedActivity.supportResearch.map((research, idx) => (
                    <li key={idx} className="research-item">{research}</li>
                  ))}
                </ul>
              </section>
            </div>

            <div className="activity-modal-footer">
              <button className="btn-start-activity">
                Start Activity
              </button>
              <button className="btn-bookmark">
                🔖 Save for Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
