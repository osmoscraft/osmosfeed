import { OnFeedHookData } from "../../types/plugin";

export interface TempDataContext {
  pluginId: string;
  storeOnObject: any;
}

export function setTempData(context: TempDataContext, key: string, value: any) {
  context.storeOnObject._temp ??= {};
  context.storeOnObject._temp[context.pluginId] ??= {};
  context.storeOnObject._temp[context.pluginId][key] = value;
}

export function getTempData<T = any>(context: TempDataContext, key: string): T {
  return context.storeOnObject?._temp?.[context.pluginId]?.[key];
}

export function getTempDataByPlugin<T = any>(context: TempDataContext, pluginId: string, key: string): T {
  return context.storeOnObject?._temp?.[pluginId]?.[key];
}
