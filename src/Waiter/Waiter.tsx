import React, { useContext, useEffect } from "react";
import { StoreContext } from "./context";
import { useData } from "./useData";
import { ChildrenData, ChildrenMeta, ChildrenUpdate, Requests } from "./types";
import { useMeta } from "./useMeta";
import { ErrorBoundary } from "./ErrorBoundary";

interface Props<R extends Requests> {
  requests: R;
  renderLoader: () => React.ReactNode;
  renderErrors: (...errors: Error[]) => React.ReactNode;
  children(props: {
    data: ChildrenData<R>;
    meta: ChildrenMeta<R>;
    update: ChildrenUpdate<R>;
    loading: boolean;
    error: any;
  }): React.ReactNode;
}

const Content: React.FC<any> = ({
  loading,
  renderLoader,
  renderErrors,
  errors,
  children,
  data,
  ...props
}) => {
  return loading
    ? renderLoader()
    : errors.length
    ? renderErrors(...errors)
    : data
    ? children({ data, ...props })
    : null;
};

export function Main<R extends Requests = Requests>({
  requests,
  children,
  renderErrors,
  renderLoader
}: Props<R>): React.FunctionComponentElement<Props<R>> {
  const requestsKeys = Object.keys(requests);
  const requestsEntries = Object.entries(requests);

  const { store } = useContext(StoreContext);

  const meta = useMeta(requestsKeys) as ChildrenMeta<R>;
  const data = useData(requestsKeys) as ChildrenData<R>;

  const update = requestsEntries.reduce((acc, [storeName]) => {
    acc[storeName] = (data: any) => {
      store.setDataByKey(storeName, data);
    };

    return acc;
  }, {} as any);

  const loading = requestsEntries.some(
    ([storeName]) => !meta[storeName] || meta[storeName]?.isFetching
  );

  const errors: Error[] = requestsEntries
    .map(([storeName]) => meta[storeName]?.error)
    .filter((v): v is Error => !!v);

  useEffect(() => {
    store.call(requests).then(console.log);
  }, []);

  return (
    <Content
      {...{
        data,
        meta,
        loading,
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
    <ErrorBoundary renderError={props.renderErrors}>
      <Main {...props} />
    </ErrorBoundary>
  );
}
