import { OnFeedHookData } from "../../types/plugin";

export function setTempData(context: OnFeedHookData, key: string, value: any) {
  context.feed._temp ??= {};
  context.feed._temp[context.pluginId] ??= {};
  context.feed._temp[context.pluginId][key] = value;
}

export function getTempData<T = any>(context: OnFeedHookData, key: string): T {
  return context.feed?._temp?.[context.pluginId]?.[key];
}

export function getTempDataByPlugin<T = any>(context: OnFeedHookData, pluginId: string, key: string): T {
  return context.feed?._temp?.[pluginId]?.[key];
}
