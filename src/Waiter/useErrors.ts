import { useContext } from "react";
import { StoreContext } from "./context";

export function useError(...storeNames: string[]) {
  const { meta } = useContext(StoreContext);
  const index = storeNames.findIndex((storeName) => meta[storeName]?.error);

  return index > -1
    ? meta[storeNames[index] as keyof typeof meta]?.error
    : null;
}
