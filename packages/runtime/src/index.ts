import { concatMap, from, Observable, toArray } from "rxjs";

export interface PipeConfig<T> {
  collectionPreTransforms: ((collection: T[]) => Promise<T[]>)[];
  itemTransform: ((item: T) => Promise<T>)[];
  collectionPostTransforms: ((collection: T[]) => Promise<T[]>)[];
}

export function createPipe<T = any>(pipeConfig: PipeConfig<T>): Observable<T[]> {
  return from([[]] as T[][]).pipe<T, T[]>(
    ...(pipeConfig.collectionPreTransforms.map((transform) => concatMap(transform)) as []),
    concatMap(from), // <------ concurrency starts
    ...(pipeConfig.itemTransform.map((transform) => concatMap(transform)) as []),
    toArray(), // <------------ concurrency ends
    ...(pipeConfig.collectionPostTransforms.map((transform) => concatMap(transform)) as [])
  );
}
