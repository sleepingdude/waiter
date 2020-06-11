import { useMeta } from "./useMeta";

export function useErrors(...storeNames: string[]) {
  const meta = useMeta(...storeNames);
  const errors = storeNames
    .map((storeName) => meta[storeName]?.error)
    .filter(Boolean);

  return errors.length > 0 ? errors : null;
}
