import { request } from "./request";

export interface RequestFeedsInput {
  requests: FeedRequest[];
  onResponse?: OnResponse;
}

export interface FeedRequest {
  url: string;
}
export interface FeedResponse {
  url: string;
  buffer: Buffer;
  text: string;
}

export type OnResponse = (req: FeedRequest, res: FeedResponse) => any;

export async function requestFeeds(input: RequestFeedsInput) {
  const { requests, onResponse } = input;

  return await Promise.all(
    requests.map(async (feedRequest) => {
      const { buffer: raw } = await request(feedRequest.url);
      const response = {
        url: feedRequest.url,
        buffer: raw,
        get text() {
          return raw.toString("utf-8");
        },
      };

      onResponse?.(feedRequest, response);

      return response;
    })
  );
}
