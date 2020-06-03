import { FetchFunc } from "./types";

export function toRequest<C extends FetchFunc>(
  fetch: C,
  ...args: Parameters<C>
): { request: C; args: Parameters<C> } {
  return { request: fetch, args };
}
