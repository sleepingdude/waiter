import { createContext } from "react";
import { FetcherMethods, FetcherState } from "./types";

export const initialState: FetcherState & FetcherMethods = {
  data: {},
  meta: {},
  setData: () => {},
  call: () => {}
};

export const StoreContext = createContext(initialState);
