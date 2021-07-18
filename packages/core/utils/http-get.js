import { Observable } from "rxjs";
import got from 'got';


export function get(url) {
  return new Observable(async (subscriber) => {
    const result = await got.get(url).text();
    console.log("result!");
    subscriber.next(result);
    subscriber.complete()
  });
}