export default class AppConfig {
  constructor(data) {

    this.version =
      data.version;

    this.featureFlags =
      data.featureFlags || {};

    this.maintenanceMode =
      data.maintenanceMode || false;
  }
}