import React, { useState } from "react";
import { StoreContext } from "./context";
import { FetcherState, Requests, StateData, StateMeta } from "./types";

export const FetcherProvider: React.FC<{}> = ({ children }) => {
  const [state, setState] = useState<FetcherState>({ data: {}, meta: {} });

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

          setMeta({ [storeName]: { isFetching: true, error: null } });

          const result = await request(...args);

          setData({ [storeName]: result });
          setMeta({ [storeName]: { isFetching: false, error: null } });

          return result;
        } catch (error) {
          setMeta({ [storeName]: { isFetching: true, error } });
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
