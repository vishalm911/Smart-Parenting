# Postman Test Cases

## createChildProfile

Request:

```json
{
  "name": "Test Child",
  "age_group": "4-6"
}
```

Expected Response:

```json
{
  "success": true
}
```

---

## updateActivityScore

Request:

```json
{
  "childId": "123",
  "score": 90
}
```

Expected Response:

```json
{
  "success": true
}
```

---

## getRecommendations

Request:

```json
{
  "childId": "123"
}
```

Expected Response:

```json
[
  {
    "activity": "Reading Story"
  }
]
```

---

## generateWeeklyReport

Request:

```json
{
  "childId": "123"
}
```

Expected Response:

```json
{
  "status": "completed"
}
```

---

## flagLearningDelay

Request:

```json
{
  "childId": "123"
}
```

Expected Response:

```json
{
  "success": true
}
```
