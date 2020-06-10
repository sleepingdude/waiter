import { useContext, useEffect, useState } from "react";
import { StoreContext } from "./context";
import { StateData } from "./types";

const getInitialData = (data: StateData, storeNames: string[]) => {
  return storeNames.reduce((localData, storeName) => {
    localData[storeName] = data[storeName];

    return localData;
  }, {} as StateData);
};

export function useData(storeNames: string[]) {
  const { store } = useContext(StoreContext);
  const [localData, setLocalData] = useState(
    getInitialData(store.getData(), storeNames)
  );
  const staticStoreName = storeNames.join(",");
  useEffect(() => {
    const onChangeData = (data: StateData) => {
      const newLocalState = { ...localData };
      let isChanged = false;

      Object.keys(localData).forEach((key) => {
        if (data[key] !== newLocalState[key]) {
          isChanged = true;

          newLocalState[key] = data[key];
        }
      });

      if (isChanged) {
        setLocalData(newLocalState);
      }
    };

    store.subscribeData(onChangeData);

    return () => {
      store.unsubscribeData(onChangeData);
    };
  }, [staticStoreName]);

  console.log(storeNames, localData);

  return localData;
}
