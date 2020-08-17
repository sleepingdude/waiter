import React, { useContext, useEffect, useMemo, useRef } from "react";
import { StoreContext } from "./context";
import {
  ChildMeta,
  ChildMutations,
  ChildQueries,
  Mutations,
  Requests,
  StateData,
  StateMeta
} from "./types";
import { useMeta } from "./useMeta";
import { ErrorBoundary } from "./ErrorBoundary";

interface Props<R extends Requests, M extends Mutations> {
  queries: R;
  mutations?: M;
  renderLoader: () => React.ReactNode;
  renderErrors: (errors: Error[]) => React.ReactNode;
  ignoreCache?: boolean;
  children(props: {
    queries: ChildQueries<R>;
    mutations: ChildMutations<M>;
  }): React.ReactNode;
}

const Content: React.FC<any> = ({
  renderLoader,
  renderErrors,
  errors,
  children,
  queries,
  isReady,
  ...props
}) => {
  if (isReady) {
    return queries ? children({ queries, ...props }) : null;
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
  const queriesKeys = Object.keys(props.queries);
  const queriesEntries = Object.entries(props.queries);
  const mutationsKeys = Object.keys(props.mutations || {});
  const mutationsEntries = Object.entries(props.mutations || {});

  const { store } = useContext(StoreContext);

  const queriesMeta = useMeta(...queriesKeys) as ChildMeta<R>;
  const mutationsMeta = useMeta(...mutationsKeys) as ChildMeta<M>;

  const callerRef = useRef(
    `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
  );

  const queries = queriesEntries.reduce((acc, [storeName, query]) => {
    const meta = queriesMeta[storeName];

    let data = {};

    if (query.listName) {
      const list = store.getDataByKey(query.listName);

      if (list) {
        data = list.map((key: string) => store.getDataByKey(key));
      } else {
        data = [];
      }
    } else if (query.key) {
      data = store.getDataByKey(`${query.objectName}.${query.key}`);
    } else {
      data = store.getDataByKey(`${query.objectName}`);
    }

    acc[storeName] = {
      data,
      meta
    };

    return acc;
  }, {} as any);

  const mutations = mutationsEntries.reduce((acc, [storeName, func]) => {
    const meta = mutationsMeta[storeName];

    acc[storeName] = {
      call: async (...args: any[]) => {
        const result = await store.call(
          { [storeName]: func.call(store, ...args) },
          true,
          callerRef.current
        );

        return result[storeName];
      },
      meta: meta,
      data: store.getDataByKey(`${storeName}.${meta?.objectName}.${meta?.key}`)
    };

    return acc;
  }, {} as any);

  const isReady = queriesEntries.every(
    ([storeName]) => queriesMeta[storeName]?.isReady
  );

  const errors: Error[] = queriesEntries
    .map(([storeName]) => queriesMeta[storeName]?.error)
    .filter((v): v is Error => !!v);

  useEffect(() => {
    store.call(props.queries);

    return () => {
      const oldMeta = store.getMeta();

      const newMeta = Object.keys(oldMeta).reduce<StateMeta>((acc, key) => {
        if (oldMeta[key].callerKey !== callerRef.current) {
          acc[key] = oldMeta[key];
        }

        return acc;
      }, {});

      store.setMeta(newMeta);

      const oldData = store.getData();

      const newData = Object.keys(oldData).reduce<StateData>((acc, key) => {
        if (oldMeta[key]?.callerKey !== callerRef.current) {
          acc[key] = oldData[key];
        }

        return acc;
      }, {});

      store.setData(newData);
    };
  }, []);

  return (
    <Content
      {...{
        isReady,
        children,
        errors,
        mutations,
        queries,
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
