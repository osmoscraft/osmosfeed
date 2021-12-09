import got from "got";

export interface HttpResponse {
  statusCode: number;
  contentType?: string;
  buffer: Buffer;
}

export function httpRequest(url: string): Promise<HttpResponse> {
  const req = got.get(url);

  return Promise.all([req, req.buffer()]).then(([req, buffer]) => {
    return {
      statusCode: req.statusCode,
      contentType: req.headers["content-type"],
      buffer,
    };
  });
}
