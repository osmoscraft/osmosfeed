export interface IConfigManager {
  // system config with user config overlay, and distribute to each source
  getConfig(): any;
}
