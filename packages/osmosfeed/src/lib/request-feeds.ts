import { request } from "./request";

export interface FeedRequest {
  url: string;
}
export interface FeedResponse {
  url: string;
  rawResponse: Buffer;
  textResponse: string;
}

export async function requestFeeds(feedRequests: FeedRequest[]) {
  return await Promise.all(
    feedRequests.map(async (feedRequest) => {
      const { raw } = await request(feedRequest.url);
      return {
        feedUrl: feedRequest.url,
        raw,
        get textResponse() {
          return raw.toString("utf-8");
        },
      };
    })
  );
}
