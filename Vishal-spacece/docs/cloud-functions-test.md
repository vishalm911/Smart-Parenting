# Cloud Functions Test Report

## Function: createChildProfile

Input:

* name
* age_group

Expected Result:

* Child profile created successfully.

Status:
PASS

---

## Function: updateActivityScore

Input:

* childId
* score

Expected Result:

* Assessment saved.
* Progress tracking updated.

Status:
PASS

---

## Function: getRecommendations

Input:

* childId

Expected Result:

* Top 3 recommendations returned.

Status:
PASS

---

## Function: generateWeeklyReport

Input:

* childId

Expected Result:

* Report generated and stored.

Status:
PASS

---

## Function: flagLearningDelay

Input:

* childId

Expected Result:

* Child flagged after repeated low scores.

Status:
PASS
