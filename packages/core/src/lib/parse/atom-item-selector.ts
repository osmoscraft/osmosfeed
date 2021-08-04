import { ItemSelector } from "../../sdk/sdk.js";

export const atomItemSelector: ItemSelector = (root$) => [...root$("entry")];
