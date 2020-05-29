import { toRequest } from "./toRequest";

export type StateData = { [storeName: string]: Readonly<any> };
export type StateMetaItem = {
  isFetching: boolean;
  error: Error | null;
};

export type StateMeta = {
  [storeName: string]: StateMetaItem;
};

export interface FetcherState {
  data: Readonly<StateData>;
  meta: Readonly<StateMeta>;
}

export interface FetcherMethods {
  setData(data: StateData): void;
  call(requests: Requests): void;
}

export type FetchFunc = (...params: any) => Promise<any>;

export type Requests = { [key: string]: ReturnType<typeof toRequest> };

export type ChildrenData<T> = {
  [K in keyof T]: T[K] extends { request: infer U }
    ? U extends (...args: any) => Promise<infer G>
      ? G
      : never
    : unknown;
};

export type ChildrenMeta<T> = {
  [K in keyof T]: StateMetaItem;
};

export type ChildrenUpdate<T> = {
  [K in keyof T]: T[K] extends { request: infer U }
    ? U extends (...args: any) => Promise<infer G>
      ? (data: G) => void
      : never
    : unknown;
};
