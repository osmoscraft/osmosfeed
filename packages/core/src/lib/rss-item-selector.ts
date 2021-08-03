import { ItemSelector } from "../sdk/sdk.js";

export const rssItemSelector: ItemSelector = (root$) => [...root$("item")];
