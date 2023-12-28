import type { DefineComponent } from 'vue';
import type { TranslationProps } from 'vue-i18n';
import type { MessageSchema } from '@/i18n';

declare module 'vue-i18n' {
  export interface DefineLocaleMessage extends MessageSchema {};
}

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    'i18n-t': DefineComponent<
      Omit<TranslationProps, 'keypath'> & {
        keypath: keyof MessageSchema;
      }
    >;
  }
}
