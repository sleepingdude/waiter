import { Requests, StateData, StateMeta, StateMetaItem } from "./types";
import { Action } from "./methods";

type DataListener<D> = (data: D) => void;
type MetaListener<M> = (meta: M) => void;

export type Store<D extends StateData = StateData> = {
  meta: Readonly<StateMeta>;
  data: Readonly<D>;
  getData(): Readonly<D>;
  getDataByKey(key: keyof D): any;
  setData(data: D, triggerEvent?: boolean): void;
  setDataByKey(key: keyof D, data: any, triggerEvent?: boolean): void;
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
    ignoreCache?: boolean,
    callerKey?: string
  ): Promise<any>;
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
    setData(data, triggerEvent = true) {
      this.data = data;
      if (triggerEvent) {
        this.dataListeners.forEach((listener) => listener(this.data));
      }
    },
    setDataByKey(key, data, triggerEvent = true) {
      this.setData({ ...this.getData(), [key]: data }, triggerEvent);
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
      // console.log("META: ", key, meta);
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
    async call(requests, ignoreCache = false, callerKey = "*") {
      const requestsEntries = Object.entries(requests);

      const results = await Promise.all(
        requestsEntries.map(async ([storeName, requestItem]) => {
          try {
            const preRequestMeta = this.getMetaByKey(storeName) || {
              error: null,
              fromCache: false,
              try: 0,
              isFetching: false,
              isReady: false,
              queryName: storeName,
              listName: requestItem.listName,
              itemName: requestItem.itemName,
              key: requestItem.key,
              keyPath: requestItem.keyPath,
              type: requestItem.type,
              callerKey
            };

            if (!ignoreCache) {
              let dataFromCache = null;

              switch (requestItem.type) {
                case Action.GET_OBJECT: {
                  dataFromCache = this.getDataByKey(
                    `${requestItem.itemName}.${requestItem.key}`
                  );
                  break;
                }
                case Action.CUSTOM_QUERY: {
                  dataFromCache = this.getDataByKey(`${requestItem.itemName}`);
                  break;
                }
                case Action.GET_LIST: {
                  const list = this.getDataByKey(requestItem.listName);

                  if (list) {
                    dataFromCache = list.map((key: string) =>
                      this.getDataByKey(`${requestItem.itemName}.${key}`)
                    );
                  }
                  break;
                }
              }

              if (dataFromCache) {
                const meta = this.getMetaByKey(storeName);

                if (!meta) {
                  this.setMetaByKey(storeName, {
                    ...preRequestMeta,
                    isReady: true,
                    fromCache: true
                  });
                }

                return dataFromCache;
              }

              if (preRequestMeta.isFetching) {
                return;
              }
            }

            this.setMetaByKey(storeName, {
              ...preRequestMeta,
              try: preRequestMeta.try + 1,
              isFetching: true,
              fromCache: false
            });

            const result = await requestItem.fetch();

            switch (requestItem.type) {
              case Action.GET_OBJECT: {
                this.setDataByKey(
                  `${requestItem.itemName}.${requestItem.key}`,
                  result
                );
                break;
              }
              case Action.CUSTOM_QUERY: {
                this.setDataByKey(`${requestItem.itemName}`, result);
                break;
              }
              case Action.GET_LIST: {
                result.forEach((r: any) => {
                  this.setDataByKey(
                    `${requestItem.itemName}.${r[requestItem.keyPath]}`,
                    r,
                    false
                  );
                });

                this.setDataByKey(
                  `${requestItem.listName}`,
                  result.map(
                    (r: any) =>
                      `${requestItem.itemName}.${r[requestItem.keyPath]}`
                  )
                );
                break;
              }
              case Action.DELETE_OBJECT: {
                const itemKey = `${requestItem.itemName}.${requestItem.key}`;
                const item = this.getDataByKey(itemKey);

                this.setDataByKey(itemKey, { ...item, _DELETED_: true }, false);

                Object.entries(this.getData()).forEach(([key, data]) => {
                  if (Array.isArray(data)) {
                    this.setDataByKey(
                      key,
                      data.filter((k) => k != itemKey),
                      false
                    );
                  }
                });

                this.setDataByKey(
                  `${storeName}.${requestItem.itemName}.${requestItem.key}`,
                  result
                );

                break;
              }
              case Action.UPDATE_OBJECT: {
                this.setDataByKey(
                  `${requestItem.itemName}.${requestItem.key}`,
                  result,
                  false
                );
                this.setDataByKey(
                  `${storeName}.${requestItem.itemName}.${requestItem.key}`,
                  result
                );
                break;
              }
              case Action.CREATE_OBJECT: {
                this.setDataByKey(
                  `${requestItem.itemName}.${result[requestItem.keyPath]}`,
                  result,
                  false
                );
                this.setDataByKey(
                  `${storeName}.${requestItem.itemName}.${
                    result[requestItem.keyPath]
                  }`,
                  result
                );
                break;
              }
              case Action.UPDATE_LIST: {
                result.forEach((r: any) => {
                  this.setDataByKey(
                    `${requestItem.itemName}.${r[requestItem.keyPath]}`,
                    r,
                    false
                  );
                });

                this.setDataByKey(
                  `${requestItem.listName}`,
                  result.map(
                    (r: any) =>
                      `${requestItem.itemName}.${r[requestItem.keyPath]}`
                  )
                );

                this.setDataByKey(
                  `${storeName}.${requestItem.listName}.${requestItem.key}`,
                  result
                );

                break;
              }
            }

            this.setMetaByKey(storeName, {
              ...this.getMetaByKey(storeName),
              isFetching: false,
              isReady: true,
              error: null,
              fromCache: false
            });

            return result;
          } catch (error) {
            this.setMetaByKey(storeName, {
              ...this.getMetaByKey(storeName),
              isFetching: false,
              fromCache: false,
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
