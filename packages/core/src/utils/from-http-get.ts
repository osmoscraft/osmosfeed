import { Observable, of } from "rxjs";
import got from 'got';

export interface HttpResponse {
  statusCode: number;
  contentType?: string;
  raw: string;
}

export function fromHttpGet(url: string): Observable<HttpResponse> {
  return new Observable((subscriber) => {
    const req = got.get(url);

    Promise.all([req, req.text()]).then(([req, raw]) => {
      subscriber.next({
        statusCode: req.statusCode,
        contentType: req.headers["content-type"],
        raw,
      })
    });

    return function unsubscribe() {
      req.cancel();
    }
  });
}