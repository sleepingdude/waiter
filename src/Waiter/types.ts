import { Store } from "./store";

export type StateData = { [storeName: string]: Readonly<any> };
export type StateMetaItem = {
  isFetching: boolean;
  isReady: boolean;
  try: number;
  error: Error | null;
  callerKey: string;
};

export type StateMeta = {
  [storeName: string]: StateMetaItem;
};

export type RequestFunc = (store: Store) => Promise<any>;
export type MutationFunc = (...params: any) => (store: Store) => Promise<any>;

export type Requests = {
  [key: string]: RequestFunc;
};

export type Mutations = {
  [key: string]: MutationFunc;
};

export type ChildData<T> = {
  [K in keyof T]: T[K] extends infer U
    ? U extends { request: (...args: any) => Promise<infer G> }
      ? G
      : U extends (...params: any) => Promise<infer Y>
      ? Y
      : U extends (...params: any) => (...params: any) => Promise<infer D>
      ? D
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
  [K in keyof T]: T[K] extends infer U
    ? U extends (...args: any) => (...args: any) => Promise<infer G>
      ? (...args: Parameters<U>) => Promise<G>
      : never
    : never;
};
