# Firestore Composite Indexes

## assessments

Composite Index:

* child_id
* domain
* date

Purpose:
Fast score retrieval by child and domain.

---

## progress_tracking

Composite Index:

* child_id
* domain

Purpose:
Quick progress lookup.

---

## recommendations

Composite Index:

* child_id
* priority

Purpose:
Fetch top recommendations.

---

## reports

Composite Index:

* child_id
* report_date

Purpose:
Retrieve historical reports.

---

## notifications

Composite Index:

* parent_id
* read_status

Purpose:
Fetch unread notifications.

---

## achievements

Composite Index:

* child_id
* date_earned

Purpose:
Track achievement history.

---

## language_scores

Composite Index:

* child_id
* date

Purpose:
View literacy performance history.

---

## numeracy_scores

Composite Index:

* child_id
* date

Purpose:
View numeracy performance history.

---

## cognitive_scores

Composite Index:

* child_id
* date

Purpose:
View cognitive performance history.
