import type { AppStore } from '@/store';

type GlobalStore = ReturnType<ReturnType<typeof AppStore>>;

// 全局用的 store
let _globalStore: GlobalStore | null = null;

export const setGlobakStore = (store: GlobalStore) => {
  _globalStore = store;
};

export const getGlobalStore = () => {
  return _globalStore;
};
