import { useContext } from "react";
import { StoreContext } from "./context";

export function useLoading(...storeNames: string[]) {
  const { meta, data } = useContext(StoreContext);

  return storeNames.some((storeName) => meta[storeName]?.isFetching);
}
