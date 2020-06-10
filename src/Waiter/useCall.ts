import { useContext, useMemo } from "react";
import { StoreContext } from "./context";

export function useCall() {
  const { store } = useContext(StoreContext);

  return useMemo(
    () => (requests: any) => store.call(requests, true),
    []
  ) as typeof store.call;
}
