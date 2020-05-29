import { useContext, useEffect, useState } from "react";
import { StoreContext } from "./context";
import { StateData } from "./types";

const getInitialData = (data: StateData, storeNames: string[]) => {
  return storeNames.reduce((localData, storeName) => {
    localData[storeName] = data[storeName];

    return localData;
  }, {} as StateData);
};

export function useLocalData(storeNames: string[]) {
  const { data } = useContext(StoreContext);
  const [localData, setLocalData] = useState(getInitialData(data, storeNames));
  const staticStoreName = storeNames.join(",");
  useEffect(() => {
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
  }, [data, staticStoreName]);

  return localData;
}
