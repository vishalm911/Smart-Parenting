export default class Achievement {
  constructor(data) {
    this.childId = data.childId;
    this.badge = data.badge;
    this.earnedAt = new Date();
  }
}