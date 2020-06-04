import { useMeta } from "./useMeta";

export function useError(...storeNames: string[]) {
  const meta = useMeta(storeNames);
  const index = storeNames.findIndex((storeName) => meta[storeName]?.error);

  return index > -1
    ? meta[storeNames[index] as keyof typeof meta]?.error
    : null;
}
