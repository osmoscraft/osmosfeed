import got from "got";
import { HttpResponse } from "../../types/plugin";

export function httpGet(url: string): Promise<HttpResponse> {
  const res = got.get(url);

  return Promise.all([res, res.buffer()]).then(([req, buffer]) => {
    return {
      statusCode: req.statusCode,
      contentType: req.headers["content-type"],
      buffer,
    };
  });
}
