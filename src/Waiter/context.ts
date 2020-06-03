import { createContext } from "react";
import { Methods, State } from "./types";

export const initialState: State & Methods = {
  data: {},
  meta: {},
  setData: () => {},
  call: () => {}
};

export const StoreContext = createContext(initialState);
