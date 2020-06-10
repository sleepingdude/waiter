import React from "react";
import { StoreContext } from "./context";
import { Store } from "./store";

type WaiterProviderProps = {
  store: Store;
};

export const WaiterProvider: React.FC<WaiterProviderProps> = ({
  children,
  store
}) => (
  <StoreContext.Provider value={{ store }}>{children}</StoreContext.Provider>
);
