import { useContext, useEffect, useState } from "react";
import { StoreContext } from "./context";
import { StateMeta } from "./types";

const getInitialLocalMeta = (meta: StateMeta, storeNames: string[]) => {
  return storeNames.reduce((localMeta, storeName) => {
    localMeta[storeName] = meta[storeName];

    return localMeta;
  }, {} as StateMeta);
};

export function useLocalMeta(storeNames: string[]) {
  const { meta } = useContext(StoreContext);
  const [localMeta, setLocalMeta] = useState(
    getInitialLocalMeta(meta, storeNames)
  );
  const staticStoreName = storeNames.join(",");
  useEffect(() => {
    const newLocalState = { ...localMeta };
    let isChanged = false;

    Object.keys(localMeta).forEach((key) => {
      if (meta[key] !== newLocalState[key]) {
        isChanged = true;

        newLocalState[key] = meta[key];
      }
    });

    if (isChanged) {
      setLocalMeta(newLocalState);
    }
  }, [meta, staticStoreName]);

  return localMeta;
}
