import { useContext, useEffect, useState } from "react";
import { StoreContext } from "./context";
import { StateMeta } from "./types";

const getInitialLocalMeta = (meta: StateMeta, storeNames: string[]) => {
  return storeNames.reduce((localMeta, storeName) => {
    localMeta[storeName] = meta[storeName];

    return localMeta;
  }, {} as StateMeta);
};

export function useMeta(...storeNames: string[]) {
  const { store } = useContext(StoreContext);
  const [localMeta, setLocalMeta] = useState(
    getInitialLocalMeta(store.getMeta(), storeNames)
  );
  const staticStoreName = storeNames.join(",");
  useEffect(() => {
    const onChangeMeta = (meta: StateMeta) => {
      const newLocalState = { ...localMeta };
      let isChanged = false;

      Object.keys(localMeta).forEach((key) => {
        if (store.getMeta()[key] !== newLocalState[key]) {
          isChanged = true;

          newLocalState[key] = meta[key];
        }
      });

      if (isChanged) {
        setLocalMeta(newLocalState);
      }
    };

    store.subscribeMeta(onChangeMeta);

    return () => {
      store.unsubscribeMeta(onChangeMeta);
    };
  }, [staticStoreName]);

  return localMeta;
}
