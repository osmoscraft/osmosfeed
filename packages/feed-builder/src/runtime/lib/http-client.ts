import got from "got";
import { HttpRequest, HttpResponse } from "../../types/plugins";

export function httpGet(req: HttpRequest): Promise<HttpResponse> {
  const res = got.get(req.url);

  return Promise.all([res, res.buffer()]).then(([req, buffer]) => {
    return {
      statusCode: req.statusCode,
      contentType: req.headers["content-type"],
      buffer,
    };
  });
}
