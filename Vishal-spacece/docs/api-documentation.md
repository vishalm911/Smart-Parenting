# API Documentation

## createChildProfile(data)

Description:
Creates a child profile in Firestore.

Parameters:

* name
* age_group
* avatar_id

Returns:

* success
* profile_id

---

## updateActivityScore(childId, activityId, score, domain)

Description:
Stores assessment score and updates progress tracking.

Parameters:

* childId
* activityId
* score
* domain

Returns:

* success

---

## getRecommendations(childId)

Description:
Returns top learning recommendations.

Parameters:

* childId

Returns:

* recommendations[]

---

## generateWeeklyReport(childId)

Description:
Generates weekly learning report.

Parameters:

* childId

Returns:

* report object

---

## flagLearningDelay(childId)

Description:
Flags child after repeated low performance.

Parameters:

* childId

Returns:

* learning_delay_flag

---

## awardCoins(childId, coins)

Description:
Awards coins after activity completion.

Returns:

* updated coin balance

---

## createNotification(parentId, message)

Description:
Creates notification entry.

Returns:

* notification object
