import React from "react";
import { StoreContext } from "./context";
import { store } from "./store";

export const WaiterProvider: React.FC = ({ children }) => (
  <StoreContext.Provider value={{ store }}>{children}</StoreContext.Provider>
);
