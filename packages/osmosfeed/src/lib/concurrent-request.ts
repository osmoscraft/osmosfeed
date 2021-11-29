import { httpRequest } from "./http-request";

export interface ConcurrentRequestInput {
  requests: Request[];
  onResponse?: OnResponse;
  onError?: OnError;
}

export interface Request {
  url: string;
}
export interface Response {
  url: string;
  buffer: Buffer;
  text: string;
}

export type OnResponse = (req: Request, res: Response) => any;
export type OnError = (req: Request) => any;

/**
 * Single-thread multiple-connection HTTP request
 */
export function concurrentRequest(input: ConcurrentRequestInput) {
  const { requests, onResponse, onError } = input;

  return requests.map(async (req) => {
    try {
      const { buffer: raw } = await httpRequest(req.url);
      const response = {
        url: req.url,
        buffer: raw,
        get text() {
          return raw.toString("utf-8");
        },
      };

      await onResponse?.(req, response);

      return response;
    } catch {
      await onError?.(req);
      return undefined;
    }
  });
}
