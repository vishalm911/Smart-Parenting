export class Assessment {
  constructor(
    activityId,
    childId,
    domain,
    score,
    accuracy,
    attempts,
    time
  ) {
    this.activityId = activityId;
    this.childId = childId;
    this.domain = domain;
    this.score = score;
    this.accuracy = accuracy;
    this.attempts = attempts;
    this.time = time;
  }
}