import React, { useContext, useEffect, useMemo } from "react";
import { StoreContext } from "./context";
import { useData } from "./useData";
import {
  ChildData,
  ChildMeta,
  ChildMutations,
  ChildUpdate,
  Mutations,
  Requests
} from "./types";
import { useMeta } from "./useMeta";
import { ErrorBoundary } from "./ErrorBoundary";

interface Props<R extends Requests, M extends Mutations> {
  requests: R;
  mutations?: M;
  renderLoader: () => React.ReactNode;
  renderErrors: (errors: Error[]) => React.ReactNode;
  ignoreCache?: boolean;
  children(props: {
    data: ChildData<R & M>;
    meta: ChildMeta<R & M>;
    update: ChildUpdate<R & M>;
    mutations: ChildMutations<M>;
    call<T extends Requests>(requests: T): ChildData<T>;
  }): React.ReactNode;
}

const Content: React.FC<any> = ({
  renderLoader,
  renderErrors,
  errors,
  children,
  data,
  isReady,
  ...props
}) => {
  if (isReady) {
    return data ? children({ data, ...props }) : null;
  } else {
    return errors.length ? renderErrors(errors) : renderLoader();
  }
};

export function Main<
  R extends Requests = Requests,
  M extends Mutations = Mutations
>({
  children,
  renderErrors,
  renderLoader,
  ignoreCache,
  ...props
}: Props<R, M>): React.FunctionComponentElement<Props<R, M>> {
  const requestsKeys = Object.keys(props.requests);
  const requestsEntries = Object.entries(props.requests);
  const mutationsEntries = Object.entries(props.mutations || {});

  const { store } = useContext(StoreContext);

  const meta = useMeta(...requestsKeys) as ChildMeta<R & M>;
  const data = useData(...requestsKeys) as ChildData<R & M>;

  const update = requestsEntries.reduce((acc, [storeName]) => {
    acc[storeName] = (data: any) => {
      store.setDataByKey(storeName, data);
    };

    return acc;
  }, {} as any);

  const mutations = mutationsEntries.reduce((acc, [storeName, func]) => {
    acc[storeName] = async (...args: any[]) => {
      const result = await store.call(
        { [storeName]: () => func(...args) },
        true
      );

      return result[storeName];
    };

    return acc;
  }, {} as any);

  const isReady = requestsEntries.every(
    ([storeName]) => meta[storeName]?.isReady
  );

  const errors: Error[] = requestsEntries
    .map(([storeName]) => meta[storeName]?.error)
    .filter((v): v is Error => !!v);

  const call = useMemo(
    () => async (requests: Requests) => await store.call(requests, true),
    []
  );

  useEffect(() => {
    store.call(props.requests);
  }, []);

  return (
    <Content
      {...{
        call,
        data,
        isReady,
        meta,
        children,
        errors,
        update,
        mutations,
        renderLoader,
        renderErrors
      }}
    />
  );
}

export function Waiter<
  R extends Requests = Requests,
  M extends Mutations = Mutations
>(props: Props<R, M>): React.FunctionComponentElement<Props<R, M>> {
  return (
    <ErrorBoundary renderErrors={props.renderErrors}>
      <Main {...props} />
    </ErrorBoundary>
  );
}
