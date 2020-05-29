import React, { useCallback, useContext, useEffect, useState } from "react";
import { StoreContext } from "./context";
import { useLocalData } from "./useLocalData";
import { ChildrenData, ChildrenMeta, ChildrenUpdate, Requests } from "./types";
import { useLocalMeta } from "./useLocalMeta";

interface Props<R extends Requests> {
  requests: R;
  children(props: {
    data: ChildrenData<R>;
    update: ChildrenUpdate<R>;
    loading: boolean;
    error: any;
  }): any;
}

export function Fetcher<R extends Requests = Requests>({
  requests,
  children
}: Props<R>): React.FunctionComponentElement<Props<R>> {
  const requestsKeys = Object.keys(requests);
  const requestsEntries = Object.entries(requests);

  const { setData, call } = useContext(StoreContext);

  const localMeta = useLocalMeta(requestsKeys) as ChildrenMeta<R>;
  const localData = useLocalData(requestsKeys) as ChildrenData<R>;

  const update = requestsEntries.reduce((acc, [storeName]) => {
    acc[storeName] = (data: any) => {
      setData({ [storeName]: data });
    };

    return acc;
  }, {} as any);

  const loading = requestsEntries.some(
    ([storeName]) => !localMeta[storeName] || localMeta[storeName]?.isFetching
  );

  const errors = requestsEntries
    .map(([storeName]) => localMeta[storeName]?.error)
    .filter(Boolean);

  useEffect(() => {
    call(requests);
  }, []);

  return loading ? (
    <div>loading</div>
  ) : errors.length ? (
    <div style={{ textAlign: "center", paddingTop: 30, color: "red" }}>
      {errors}
      "Sorry, something weng wrong"
    </div>
  ) : localData ? (
    children({ data: localData, update, loading, error: errors[0] })
  ) : null;
}
