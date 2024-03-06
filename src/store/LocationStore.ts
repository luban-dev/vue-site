import { reactive, toRefs } from 'vue';
import { defineStore } from 'pinia';
import type { InjectionContext } from 'pinia-di';

export interface TPoint {
  latitude: number;
  longitude: number;
}

export const LocationStore = ({ useStoreId }: InjectionContext) => {
  return defineStore(useStoreId('LocationStore'), () => {
    const state = reactive({
      // store gps
      gpsLoading: false,
      gps: null as TPoint | null,
      gpsGetTime: 0
    });

    return {
      ...toRefs(state)
    };
  });
};
