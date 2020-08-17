import { Store } from "./store";

export type QueryFetch = (store: Store) => Promise<any>;
export type MutationFetch = (...args: any[]) => Promise<any>;

export enum Action {
  GET_OBJECT = "GET_OBJECT",
  GET_LIST = "GET_LIST",
  CUSTOM_QUERY = "CUSTOM_QUERY",
  DELETE_OBJECT = "DELETE_OBJECT",
  UPDATE_OBJECT = "UPDATE_OBJECT",
  CREATE_OBJECT = "CREATE_OBJECT",
  UPDATE_LIST = "UPDATE_LIST"
}

type Request<F> = {
  listName: string;
  objectName: string;
  key: string;
  keyPath: string;
  type: Action;
  fetch: F;
};

export function query<C extends QueryFetch>(
  objectName: string,
  fetch: C
): Request<C> {
  return {
    objectName,
    fetch,
    type: Action.CUSTOM_QUERY,
    listName: "",
    key: "",
    keyPath: ""
  };
}

export function getObject<C extends QueryFetch>(
  objectName: string,
  key: string,
  fetch: C
): Request<C> {
  return {
    objectName,
    listName: "",
    keyPath: "",
    key,
    fetch,
    type: Action.GET_OBJECT
  };
}

export type GetListFetch = () => Promise<any[]>;

export function getList<C extends GetListFetch>(
  listName: string,
  objectName: string,
  keyPath: keyof (C extends () => Promise<Array<infer U>> ? U : {}),
  fetch: C
): Request<C> {
  return {
    listName,
    objectName,
    keyPath: keyPath as string,
    fetch,
    key: "",
    type: Action.GET_LIST
  };
}

export function deleteObject<C extends MutationFetch>(
  objectName: string,
  key: string,
  fetch: C
): Request<C> {
  return {
    objectName,
    key,
    listName: "",
    keyPath: "",
    fetch,
    type: Action.DELETE_OBJECT
  };
}

export function updateObject<C extends MutationFetch>(
  objectName: string,
  key: string,
  fetch: C
): Request<C> {
  return {
    objectName,
    listName: "",
    keyPath: "",
    key,
    fetch,
    type: Action.UPDATE_OBJECT
  };
}

export function createObject<C extends MutationFetch>(
  objectName: string,
  keyPath: keyof (C extends () => Promise<infer U> ? U : {}),
  fetch: C
): Request<C> {
  return {
    objectName,
    keyPath: keyPath as string,
    listName: "",
    key: "",
    fetch,
    type: Action.CREATE_OBJECT
  };
}

export function updateList<C extends MutationFetch>(
  listName: string,
  objectName: string,
  keyPath: keyof (C extends () => Promise<Array<infer U>> ? U : {}),
  fetch: C
): Request<C> {
  return {
    objectName,
    listName,
    keyPath: keyPath as string,
    key: "",
    fetch,
    type: Action.UPDATE_LIST
  };
}

export function mutation<C extends MutationFetch>(
  objectName: string,
  fetch: C
): Request<C> {
  return {
    objectName,
    listName: "",
    keyPath: "",
    key: "",
    fetch,
    type: Action.DELETE_OBJECT
  };
}
