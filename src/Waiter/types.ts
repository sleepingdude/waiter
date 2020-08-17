import { Store } from "./store";
import {
  query,
  getList,
  getObject,
  Action,
  deleteObject,
  updateObject
} from "./methods";

export type StateData = { [storeName: string]: Readonly<any> };
export type StateMetaItem = {
  isFetching: boolean;
  isReady: boolean;
  try: number;
  error: Error | null;
  callerKey: string;
  queryName: string;
  listName: string;
  objectName: string;
  key: string;
  keyPath: string;
  type: Action;
  fromCache: boolean;
};

export type StateMeta = {
  [storeName: string]: StateMetaItem;
};

export type RequestFunc = (store: Store) => Promise<any>;
export type MutationFunc = (...params: any) => (store: Store) => Promise<any>;

export type Requests = {
  [key: string]:
    | ReturnType<typeof query>
    | ReturnType<typeof getList>
    | ReturnType<typeof getObject>;
};

export type Mutations = {
  [key: string]: (
    ...args: any[]
  ) => ReturnType<typeof deleteObject> | ReturnType<typeof updateObject>;
};

export type ChildQueries<T> = {
  [K in keyof T]: T[K] extends { fetch: (...args: any) => Promise<infer G> }
    ? { data: G; meta: StateMetaItem }
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
  [K in keyof T]: T[K] extends (
    ...args: infer A
  ) => {
    fetch: (...args: any) => Promise<infer G>;
  }
    ? { data: G; meta: StateMetaItem; call: (...args: A) => Promise<G> }
    : never;
};
