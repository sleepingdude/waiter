import React, { useContext, useEffect } from "react";
import { StoreContext } from "./context";
import { useData } from "./useData";
import { ChildrenData, ChildrenMeta, ChildrenUpdate, Requests } from "./types";
import { useMeta } from "./useMeta";
import { ErrorBoundary } from "./ErrorBoundary";

interface Props<R extends Requests> {
  requests: R;
  renderLoader?: () => React.ReactNode;
  renderErrors?: (errors: Error[]) => React.ReactNode;
  renderRuntimeError?: (error: Error) => React.ReactNode;
  children(props: {
    data: ChildrenData<R>;
    update: ChildrenUpdate<R>;
    loading: boolean;
    error: any;
  }): React.ReactNode;
}

const Render: React.FC<any> = ({
  renderLoader,
  loading,
  renderErrors,
  errors,
  children,
  data,
  update
}) => {
  return renderLoader && loading
    ? renderLoader()
    : renderErrors && errors.length
    ? renderErrors(errors)
    : data
    ? children({ data, update, loading, error: errors })
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

  const { setData, call } = useContext(StoreContext);

  const meta = useMeta(requestsKeys) as ChildrenMeta<R>;
  const data = useData(requestsKeys) as ChildrenData<R>;

  const update = requestsEntries.reduce((acc, [storeName]) => {
    acc[storeName] = (data: any) => {
      setData({ [storeName]: data });
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
    call(requests);
  }, []);

  return (
    <Render
      {...{
        data,
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

export function Waiter<R extends Requests = Requests>({
  renderRuntimeError,
  ...props
}: Props<R>): React.FunctionComponentElement<Props<R>> {
  if (renderRuntimeError) {
    return (
      <ErrorBoundary renderError={renderRuntimeError}>
        <Main {...props} />
      </ErrorBoundary>
    );
  } else {
    return <Main {...props} />;
  }
}
