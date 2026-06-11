export class UserAccount {
  constructor(
    uid,
    displayName,
    email,
    role,
    isActive
  ) {
    this.uid = uid;
    this.displayName = displayName;
    this.email = email;
    this.role = role;
    this.isActive = isActive;
  }
}