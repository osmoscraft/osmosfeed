import got from "got";

export interface HttpResponse {
  statusCode: number;
  contentType?: string;
  raw: string;
}

export function httpGet(url: string): Promise<HttpResponse> {
  const req = got.get(url);

  return Promise.all([req, req.text()]).then(([req, raw]) => {
    return {
      statusCode: req.statusCode,
      contentType: req.headers["content-type"],
      raw,
    };
  });
}
