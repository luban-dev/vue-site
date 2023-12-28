import { nextTick, watchEffect } from 'vue';
import { createI18n } from 'vue-i18n';
import { joinUrl } from '@/utils/url';
import { baseUrl } from '@/config';

const languageKey = 'language';

// 语言类型
export enum LangType {
  ZH = 'zh-CN',
  EN = 'en-US'
}

export const ServerLang: Record<LangType, string> = {
  [LangType.EN]: 'en-US',
  [LangType.ZH]: 'zh-Hans'
};

export const CMSLang: Record<LangType, string> = {
  [LangType.EN]: 'en-US',
  [LangType.ZH]: 'zh-Hans'
};

// 支持的语言
export const languages = [LangType.ZH, LangType.EN];

// 默认语言
export const defaultLanguage: LangType = LangType.ZH;

// 语言映射
export const languagesMap: [RegExp, LangType][] = [
  [/^en$/i, LangType.EN],
  [/^en-[a-z-]+$/i, LangType.EN],
  [/^zh$/i, LangType.ZH],
  [/^zh-[a-z-]+$/i, LangType.ZH]
];

// 选择语言
export const LangSelects: { value: LangType; text: string }[] = [
  {
    value: LangType.ZH,
    text: '中文'
  },
  {
    value: LangType.EN,
    text: 'English'
  }
];

export const getLangItem = (lang: LangType) => {
  return LangSelects.find(item => item.value === lang);
};

export const normalizeLang = (lang: string): string => {
  if (!lang)
    return '';
  const l = lang.toLowerCase();
  const find = languages.find(v => v.toLowerCase() === l);
  if (find)
    return find;
  const findMap = languagesMap.find(v => v[0].test(l));
  return findMap ? findMap[1] : '';
};

export const getLangFromBrowser = () => {
  return normalizeLang(navigator.language || navigator.languages[0] || '');
};

export const getLangFromStore = () => {
  return normalizeLang(localStorage.getItem(languageKey) || '');
};

export const getLangFromPath = (pathname = location.pathname) => {
  // '/en-US/'
  const start = joinUrl('/', baseUrl, '/');
  const path = joinUrl('/', pathname.substring(start.length), '/');
  const p = path.split('/')[1] || '';
  return normalizeLang(p);
};

export const getInitLanguage = (): {
  lang: LangType;
} => {
  let lang = '';

  lang = getLangFromPath();
  if (lang) {
    return {
      lang: lang as LangType
    };
  }

  return { lang: defaultLanguage };
};

export const i18nMessages = {
  [LangType.ZH]: {},
  [LangType.EN]: {}
};

const initInfo = getInitLanguage();

export const i18n = createI18n({
  legacy: false,
  locale: initInfo.lang,
  fallbackLocale: initInfo.lang,
  messages: i18nMessages
});

export const isLangInPath = (pathname = location.pathname) => {
  return !!getLangFromPath(pathname);
};

export const getLangHref = (lang: LangType) => {
  const pathname = location.pathname;
  const oldLangInPath = isLangInPath(pathname);
  const needAddPathLang = lang !== defaultLanguage;
  const start = joinUrl('/', baseUrl, '/');
  const path = joinUrl('/', pathname.substring(start.length));
  let purePath = path;

  if (oldLangInPath) {
    purePath = path.replace(/^\/[a-z-]+/i, ``);
  }

  let newPath = purePath;
  if (needAddPathLang) {
    newPath = joinUrl(`/${lang}`, purePath);
  }

  const href = location.href;
  const url = new URL(href);
  url.pathname = newPath;

  return url.href;
};

export const setLanguage = (lang: LangType) => {
  const oldLang = i18n.global.locale.value;
  if (lang === oldLang)
    return;
  location.replace(getLangHref(lang));
};

const loadedLangs: LangType[] = [];
export const loadLocaleMessages = async () => {
  const locale = i18n.global.locale.value as LangType;
  if (loadedLangs.includes(locale))
    return;
  // load locale messages with dynamic import
  const messages = await import(`./locales/${locale}.json`);
  // set locale and locale message
  i18n.global.setLocaleMessage(locale, messages.default);
  loadedLangs.push(locale);

  await nextTick();
};

export const getCurrentLang = () => {
  return i18n.global.locale.value;
};

export const getServerLang = (lang = i18n.global.locale.value) => {
  return ServerLang[lang] || lang;
};

export const getCMSLang = (lang = i18n.global.locale.value) => {
  return CMSLang[lang] || lang;
};

watchEffect(() => {
  const html = document.documentElement;
  html?.setAttribute('lang', i18n.global.locale.value);
});

const href = getLangHref(initInfo.lang);
if (href !== location.href) {
  location.replace(href);
}
