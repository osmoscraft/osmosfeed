export interface ICacheManager {
  read(id: string): any;
  write(id: string, value: string): any;

  getAuditSummary(): any;
}
