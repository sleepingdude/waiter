import { useMeta } from "./useMeta";

export function useLoading(...storeNames: string[]) {
  const meta = useMeta(...storeNames);

  return storeNames.some((storeName) => meta[storeName]?.isFetching);
}
