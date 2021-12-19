import got from "got";
import { HttpResponse, INetworkApi } from "../../types/plugin";

const NETWORK_TIMEOUT_MS = 10000;
const NETWORK_RETRY = 2;

export class NetworkApi implements INetworkApi {
  get(url: string): Promise<HttpResponse> {
    const res = got.get(url, {
      timeout: NETWORK_TIMEOUT_MS,
      retry: NETWORK_RETRY,
    });

    return Promise.all([res, res.buffer()]).then(([req, buffer]) => {
      return {
        statusCode: req.statusCode,
        contentType: req.headers["content-type"],
        buffer,
      };
    });
  }
}
