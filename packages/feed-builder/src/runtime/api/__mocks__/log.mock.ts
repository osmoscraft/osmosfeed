import { ILogApi } from "../../../types/plugin";

export class MockLogApi implements ILogApi {
  error() {}
  info() {}
  trace() {}
}
