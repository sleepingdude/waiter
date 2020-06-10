import {
  ChildrenData,
  Requests,
  StateData,
  StateMeta,
  StateMetaItem
} from "./types";

type DataListener<D> = (data: D) => void;
type MetaListener<M> = (meta: M) => void;

export type Store<D extends StateData = StateData> = {
  meta: Readonly<StateMeta>;
  data: Readonly<D>;
  getData(): Readonly<D>;
  getDataByKey(key: keyof D): any;
  setData(data: D): void;
  setDataByKey(key: keyof D, data: any): void;
  getMeta(): Readonly<StateMeta>;
  getMetaByKey(key: keyof StateMeta): StateMetaItem;
  setMeta(meta: StateMeta): void;
  setMetaByKey(key: keyof StateMeta, meta: StateMetaItem): void;
  dataListeners: Set<DataListener<D>>;
  subscribeData(listener: DataListener<D>): void;
  unsubscribeData(listener: DataListener<D>): void;
  metaListeners: Set<MetaListener<StateMeta>>;
  subscribeMeta(listener: MetaListener<StateMeta>): void;
  unsubscribeMeta(listener: MetaListener<StateMeta>): void;
  call<T extends Requests>(
    requests: T,
    ignoreCache?: boolean
  ): Promise<ChildrenData<T>>;
};

export function createStore(): Store {
  return {
    meta: {},
    data: {},
    getData() {
      return this.data;
    },
    getDataByKey(key) {
      return this.data[key];
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
    getMetaByKey(key) {
      return this.meta[key];
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
    async call(requests, ignoreCache = false) {
      const requestsEntries = Object.entries(requests);

      const results = await Promise.all(
        requestsEntries.map(async ([storeName, { request, args }]) => {
          try {
            const preRequestMeta = this.getMetaByKey(storeName) || {
              error: null,
              try: 0,
              isFetching: false,
              isReady: false
            };

            if (!ignoreCache) {
              const data = this.getDataByKey(storeName);

              if (data) {
                return data;
              }

              if (preRequestMeta.isFetching) {
                return;
              }
            }

            this.setMetaByKey(storeName, {
              ...preRequestMeta,
              try: preRequestMeta.try + 1,
              isFetching: true
            });

            const result = await request(...args);

            this.setDataByKey(storeName, result);

            this.setMetaByKey(storeName, {
              ...this.getMetaByKey(storeName),
              isFetching: false,
              isReady: true,
              error: null
            });
            return result;
          } catch (error) {
            this.setMetaByKey(storeName, {
              ...this.getMetaByKey(storeName),
              isFetching: false,
              error
            });
            console.error(error);
          }
        })
      );

      return requestsEntries.reduce<any>((acc, [storeName], index) => {
        acc[storeName] = results[index];

        return acc;
      }, {}) as any;
    }
  };
}
