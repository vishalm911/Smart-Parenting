export default class ProgressTracking {
  constructor(data) {
    this.childId = data.childId;
    this.domain = data.domain;
    this.weeklyScore = data.weeklyScore;
    this.streak = data.streak;
  }
}