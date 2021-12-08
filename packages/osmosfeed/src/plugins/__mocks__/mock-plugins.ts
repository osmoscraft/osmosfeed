import { FeedPlugin, SourcesPlugin } from "../plugins";

export const mockSourcesEmptyPlugin: SourcesPlugin = async () => [];

export const mockSourcesTitlePlugin: SourcesPlugin = async () => [
  {
    title: "Simple title",
  },
];

export const mockSourcesAppendPlugin: SourcesPlugin = async (input) => [
  ...input.feeds,
  {
    title: "Appended title",
  },
];

export const mockFeedPassthroughPlugin: FeedPlugin = async (input) => ({
  ...input.feed,
});

export const mockFeedDescriptionPlugin: FeedPlugin = async (input) => ({
  ...input.feed,
  description: "Simple description",
});

export const mockFeedsItemsPlugin: SourcesPlugin = async (input) => [
  {
    items: [{}],
  },
];
