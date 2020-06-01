import React, { useContext, useEffect } from "react";
import { StoreContext } from "./context";
import { useLocalData } from "./useLocalData";
import { ChildrenData, ChildrenMeta, ChildrenUpdate, Requests } from "./types";
import { useLocalMeta } from "./useLocalMeta";
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
  }): any;
}

export function Fetcher<R extends Requests = Requests>({
  requests,
  children,
  renderErrors,
  renderLoader,
  renderRuntimeError
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

  const errors: Error[] = requestsEntries
    .map(([storeName]) => localMeta[storeName]?.error)
    .filter((v): v is Error => !!v);

  useEffect(() => {
    call(requests);
  }, []);

  if (renderRuntimeError) {
    return (
      <ErrorBoundary renderError={renderRuntimeError}>
        <>
          {renderLoader && loading
            ? renderLoader()
            : errors.length && renderErrors
            ? renderErrors(errors)
            : localData
            ? children({ data: localData, update, loading, error: errors[0] })
            : null}
        </>
      </ErrorBoundary>
    );
  } else {
    return renderLoader && loading
      ? renderLoader()
      : renderErrors && errors.length
      ? renderErrors(errors)
      : localData
      ? children({ data: localData, update, loading, error: errors[0] })
      : null;
  }
}
