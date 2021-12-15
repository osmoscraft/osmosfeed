import { BuildEndHookApi, FeedHookApi, ItemHookApi } from "../../../types/plugin";
import { MockLogApi } from "./log.mock";
import { MockNetworkApi } from "./network.mock";
import { MockStorageApi } from "./storage.mock";

export function mockItemHookApi(override: Partial<ItemHookApi>): ItemHookApi {
  return {
    log: new MockLogApi(),
    storage: new MockStorageApi(),
    network: new MockNetworkApi(),
    ...override,
  };
}

export function mockFeedHookApi(override: Partial<FeedHookApi>): FeedHookApi {
  return {
    log: new MockLogApi(),
    storage: new MockStorageApi(),
    network: new MockNetworkApi(),
    ...override,
  };
}

export function mockBuildEndHookApi(override: Partial<BuildEndHookApi>): BuildEndHookApi {
  return {
    storage: new MockStorageApi(),
    log: new MockLogApi(),
    ...override,
  };
}
