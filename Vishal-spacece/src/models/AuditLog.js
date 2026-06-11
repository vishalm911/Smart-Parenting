export default class AuditLog {
  constructor(data) {
    this.action = data.action;
    this.userId = data.userId;
    this.collectionAffected =
      data.collectionAffected;

    this.timestamp = new Date();
  }
}