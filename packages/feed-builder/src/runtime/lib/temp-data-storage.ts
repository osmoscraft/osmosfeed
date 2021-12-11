export function setTempData(context: any, pluginName: string, key: string, value: any) {
  context._temp ??= {};
  context._temp[pluginName] ??= {};
  context._temp[pluginName][key] = value;
}

export function getTempData<T = any>(context: any, pluginName: string, key: string): T {
  return context?._temp?.[pluginName]?.[key];
}
