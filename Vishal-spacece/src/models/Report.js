export default class Report {
  constructor(data) {
    this.childId = data.childId;
    this.domainScores = data.domainScores;
    this.generatedAt = new Date();
  }
}