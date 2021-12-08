import { FeedPlugin, FeedsPlugin } from "../plugins";

export const mockFeedsEmptyPlugin: FeedsPlugin = async () => [];

export const mockFeedsTitlePlugin: FeedsPlugin = async () => [
  {
    title: "Simple title",
  },
];

export const mockFeedsAppendPlugin: FeedsPlugin = async (input) => [
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

export const mockFeedsItemsPlugin: FeedsPlugin = async (input) => [
  {
    items: [{}],
  },
];
