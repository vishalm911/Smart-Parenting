export default class Achievement {
  constructor(data) {
    this.childId = data.childId;
    this.badge = data.badge;
    this.domain = data.domain;
    this.earnedAt = new Date();
  }
}