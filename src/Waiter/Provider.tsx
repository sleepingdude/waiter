import React, { useState } from "react";
import { StoreContext } from "./context";
import { State, Requests, StateData, StateMeta } from "./types";

export const Provider: React.FC<{}> = ({ children }) => {
  const [state, setState] = useState<State>({ data: {}, meta: {} });

  const setData = (data: StateData) => {
    setState((prevState) => {
      const newState = { ...prevState, data: { ...prevState.data, ...data } };

      console.log("New Data:", newState.data);
      return newState;
    });
  };

  const setMeta = (meta: StateMeta) => {
    setState((prevState) => {
      const newState = { ...prevState, meta: { ...prevState.meta, ...meta } };

      console.log("New Meta:", newState.meta);
      return newState;
    });
  };

  const call = async (requests: Requests) => {
    const requestsEntries = Object.entries(requests);

    const results = await Promise.all(
      requestsEntries.map(async ([storeName, { request, args }]) => {
        try {
          if (state.data[storeName]) {
            return state.data[storeName];
          }

          setState((prevState) => ({
            ...prevState,
            meta: {
              ...prevState.meta,
              [storeName]: { isFetching: true, error: null }
            }
          }));

          const result = await request(...args);

          setState((prevState) => ({
            ...prevState,
            data: { ...prevState.data, [storeName]: result },
            meta: {
              ...prevState.meta,
              [storeName]: { isFetching: false, error: null }
            }
          }));

          return result;
        } catch (error) {
          setState((prevState) => ({
            ...prevState,
            meta: {
              ...prevState.meta,
              [storeName]: { isFetching: false, error }
            }
          }));
          console.error(error);
        }
      })
    );

    return requestsEntries.reduce((acc, [storeName], index) => {
      acc[storeName] = results[index];

      return acc;
    }, {} as any);
  };

  return (
    <StoreContext.Provider
      value={{
        ...state,
        setData,
        call
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
