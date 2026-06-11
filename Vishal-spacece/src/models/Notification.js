export default class Notification {
  constructor(data) {
    this.childId = data.childId;
    this.parentId = data.parentId;
    this.message = data.message;
    this.type = data.type;
    this.readStatus = false;
    this.createdAt = new Date();
  }
}