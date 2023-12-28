import type { GenericValidateFunction } from 'vee-validate';

export type Timer = ReturnType<typeof setTimeout>;

export type IntervalTimer = ReturnType<typeof setInterval>;

export type VeeValidators<T extends Record<string, any>> = Partial<{
  [K in keyof T]: GenericValidateFunction<T[K]>;
}>;
