import { LubanApp } from '@luban-ui/vue-site-core';
import { LocationStore } from '@/store';
import { routes } from '@/config';

const luban = new LubanApp({
  routes,
  baseURL: '/',
  stores: [LocationStore],
  i18n: {
    languageKey: 'language',
    languages: ['zh-CN', 'en-US'],
    defaultLanguage: 'zh-CN',
    languagesMap: [
      [/^en$/i, 'en-US'],
      [/^en-[a-z-]+$/i, 'en-US'],
      [/^zh$/i, 'zh-CN'],
      [/^zh-[a-z-]+$/i, 'zh-CN']
    ],
    langTypes: ['path'],
    loadMessages: (lang: string) => import(`@/locales/${lang}.json`)
  },
  useDirectives: true,
  onSetup: (/* args: { getStore: GetStore } */) => {},
  onMounted: (/* args: { getStore: GetStore } */) => {}
});

const globalStore = luban.globalStore!;
const app = luban.app;
const i18n = luban.i18n!;

export { luban, app, i18n, globalStore };
