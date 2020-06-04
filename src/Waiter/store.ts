import { Requests, StateData, StateMeta, StateMetaItem } from "./types";

type DataListener<D> = (data: D) => void;
type MetaListener<M> = (meta: M) => void;

export type Store<D extends StateData = StateData> = {
  meta: StateMeta;
  data: D;
  getData(): D;
  setData(data: D): void;
  setDataByKey(key: string, data: any): void;
  getMeta(): StateMeta;
  setMeta(meta: StateMeta): void;
  setMetaByKey(key: string, meta: StateMetaItem): void;
  dataListeners: Set<DataListener<D>>;
  subscribeData(listener: DataListener<D>): void;
  unsubscribeData(listener: DataListener<D>): void;
  metaListeners: Set<MetaListener<StateMeta>>;
  subscribeMeta(listener: MetaListener<StateMeta>): void;
  unsubscribeMeta(listener: MetaListener<StateMeta>): void;
  call(requests: Requests): Promise<Partial<D>>;
};

export const store: Store = {
  meta: {},
  data: {},
  getData() {
    return this.data;
  },
  setData(data) {
    this.data = data;
    this.dataListeners.forEach((listener) => listener(this.data));
  },
  setDataByKey(key, data) {
    this.setData({ ...this.getData(), [key]: data });
  },
  getMeta() {
    return this.meta;
  },
  setMeta(meta) {
    this.meta = meta;
    this.metaListeners.forEach((listener) => listener(this.meta));
  },
  setMetaByKey(key, meta) {
    this.setMeta({ ...this.getMeta(), [key]: meta });
  },
  dataListeners: new Set(),
  subscribeData(callback) {
    this.dataListeners.add(callback);
  },
  unsubscribeData(callback) {
    this.dataListeners.delete(callback);
  },
  metaListeners: new Set(),
  subscribeMeta(callback) {
    this.metaListeners.add(callback);
  },
  unsubscribeMeta(callback) {
    this.metaListeners.delete(callback);
  },
  async call(requests: Requests) {
    const requestsEntries = Object.entries(requests);

    const results = await Promise.all(
      requestsEntries.map(async ([storeName, { request, args }]) => {
        try {
          if (this.data[storeName]) {
            return this.data[storeName];
          }

          this.setMetaByKey(storeName, { isFetching: true, error: null });

          const result = await request(...args);

          this.setDataByKey(storeName, result);
          this.setMetaByKey(storeName, { isFetching: false, error: null });
          return result;
        } catch (error) {
          this.setMetaByKey(storeName, { isFetching: false, error });
          console.error(error);
        }
      })
    );

    return requestsEntries.reduce((acc, [storeName], index) => {
      acc[storeName] = results[index];

      return acc;
    }, {} as any);
  }
};

store.subscribeData(console.log);
store.subscribeMeta(console.log);
