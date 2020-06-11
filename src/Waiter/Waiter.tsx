import React, { useContext, useEffect, useMemo } from "react";
import { StoreContext } from "./context";
import { useData } from "./useData";
import { ChildrenData, ChildrenMeta, ChildrenUpdate, Requests } from "./types";
import { useMeta } from "./useMeta";
import { ErrorBoundary } from "./ErrorBoundary";

interface Props<R extends Requests> {
  requests: R;
  renderLoader: () => React.ReactNode;
  renderErrors: (errors: Error[]) => React.ReactNode;
  ignoreCache?: boolean;
  children(props: {
    data: ChildrenData<R>;
    meta: ChildrenMeta<R>;
    update: ChildrenUpdate<R>;
    call<T extends Requests>(requests: T): ChildrenData<T>;
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

export function Main<R extends Requests = Requests>({
  requests,
  children,
  renderErrors,
  renderLoader,
  ignoreCache
}: Props<R>): React.FunctionComponentElement<Props<R>> {
  const requestsKeys = Object.keys(requests);
  const requestsEntries = Object.entries(requests);

  const { store } = useContext(StoreContext);

  const meta = useMeta(...requestsKeys) as ChildrenMeta<R>;
  const data = useData(...requestsKeys) as ChildrenData<R>;

  const update = requestsEntries.reduce((acc, [storeName]) => {
    acc[storeName] = (data: any) => {
      store.setDataByKey(storeName, data);
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
    store.call(requests).then(console.log);
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
        renderLoader,
        renderErrors
      }}
    />
  );
}

export function Waiter<R extends Requests = Requests>(
  props: Props<R>
): React.FunctionComponentElement<Props<R>> {
  return (
    <ErrorBoundary renderErrors={props.renderErrors}>
      <Main {...props} />
    </ErrorBoundary>
  );
}
