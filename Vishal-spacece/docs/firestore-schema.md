# Firestore Schema Documentation

## Collection: child_profiles

Fields:

* child_id
* name
* age_group
* avatar_id
* coins
* stars
* badges
* last_active
* created_at
* updated_at

---

## Collection: avatars

Fields:

* child_id
* character
* accessories
* unlocked_items
* created_at
* updated_at

---

## Collection: achievements

Fields:

* badge_id
* child_id
* type
* date_earned
* created_at

---

## Collection: rewards

Fields:

* item_id
* coin_cost
* category
* is_unlocked

---

## Collection: stories

Fields:

* story_id
* title
* content_url
* age_group
* difficulty
* language
* topic
* created_at

---

## Collection: reading_activities

Fields:

* activity_id
* type
* age_group
* content

---

## Collection: vocabulary_games

Fields:

* game_id
* word_list
* image_urls

---

## Collection: language_scores

Fields:

* child_id
* activity_id
* score
* accuracy
* time_taken
* date

---

## Collection: math_games

Fields:

* game_id
* type
* age_group
* question_set
* difficulty

---

## Collection: puzzle_games

Fields:

* puzzle_id
* pieces_url
* age_group
* shape_type

---

## Collection: logic_games

Fields:

* game_id
* pattern_data
* maze_layout
* age_group

---

## Collection: numeracy_scores

Fields:

* child_id
* game_id
* score
* time_taken
* level
* date

---

## Collection: cognitive_games

Fields:

* game_id
* type
* age_group
* content_data
* difficulty

---

## Collection: creativity_activities

Fields:

* activity_id
* type
* template_url
* age_group

---

## Collection: emotion_activities

Fields:

* activity_id
* scenario_text
* choices
* correct_response
* emotion_tag

---

## Collection: cognitive_scores

Fields:

* child_id
* game_id
* score
* accuracy
* attempts
* date

---

## Collection: assessments

Fields:

* child_id
* domain
* activity_id
* score
* accuracy
* time
* attempts
* date

---

## Collection: progress_tracking

Fields:

* child_id
* domain
* weekly_score
* streak
* milestone_flags

---

## Collection: reports

Fields:

* child_id
* report_date
* domain_scores
* ai_flags
* recommendations

---

## Collection: recommendations

Fields:

* child_id
* activity_id
* reason
* priority
* generated_date

---

## Collection: ai_analysis

Fields:

* child_id
* reading_difficulty
* numeracy_gap
* learning_delay_flag
* strength_areas
* last_updated

---

## Collection: notifications

Fields:

* child_id
* parent_id
* message
* type
* read_status
* created_at

---

## Collection: user_accounts

Fields:

* uid
* email
* role
* linked_child_profiles
* created_at

---

## Collection: sessions

Fields:

* uid
* login_time
* logout_time
* device_info

---

## Collection: audit_logs

Fields:

* action
* user_id
* timestamp
* collection_affected

---

## Collection: app_config

Fields:

* version
* feature_flags
* maintenance_mode
