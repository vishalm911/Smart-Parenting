export class ChildProfile {
  constructor(
    id,
    name,
    ageGroup,
    avatar,
    badges,
    coinCount,
    level,
    parentUid,
    stars,
    xp
  ) {
    this.id = id;
    this.name = name;
    this.ageGroup = ageGroup;
    this.avatar = avatar;
    this.badges = badges;
    this.coinCount = coinCount;
    this.level = level;
    this.parentUid = parentUid;
    this.stars = stars;
    this.xp = xp;
  }
}