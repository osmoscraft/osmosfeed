import { Observable, of } from "rxjs";
import got from 'got';

export function fromHttpGet(url: string): Observable<string> {
  return new Observable((subscriber) => {
    got.get(url).text().then(text => {
      subscriber.next(text);
      subscriber.complete();
    });
  });
}