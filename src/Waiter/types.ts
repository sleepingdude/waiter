import { Store } from "./store";

export type StateData = { [storeName: string]: Readonly<any> };
export type StateMetaItem = {
  isFetching: boolean;
  isReady: boolean;
  try: number;
  error: Error | null;
};

export type StateMeta = {
  [storeName: string]: StateMetaItem;
};

export type FetchFunc = (...params: any) => Promise<any>;

export type Requests = {
  [key: string]: FetchFunc;
};

export type Mutations = {
  [key: string]: FetchFunc;
};

export type ChildData<T> = {
  [K in keyof T]: T[K] extends infer U
    ? U extends { request: (...args: any) => Promise<infer G> }
      ? G
      : U extends (...params: any) => Promise<infer Y>
      ? Y
      : never
    : never;
};

export type ChildMeta<T> = {
  [K in keyof T]: StateMetaItem;
};

export type ChildUpdate<T> = {
  [K in keyof T]: T[K] extends infer U
    ? U extends { request: (...args: any) => Promise<infer G> }
      ? (data: G) => void
      : U extends (store: Store) => Promise<infer Y>
      ? (data: Y) => void
      : never
    : never;
};

export type ChildMutations<T> = {
  [K in keyof T]: T[K];
};
