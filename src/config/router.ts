import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';
import qs from 'qs';
import { baseUrl } from './env';
import {
  defaultLanguage,
  getCurrentLang,
  getLangHref,
  languages,
  loadLocaleMessages
} from '@/i18n';
import { joinUrl } from '@/utils/url';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'LayoutBasic',
    component: () => import('@/pages/Layout/Basic/index.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/pages/Home/index.vue')
      },
      {
        path: ':pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/pages/404/index.vue')
      }
    ]
  }
];

const needAddPathLang = getCurrentLang() !== defaultLanguage;
const routerBaseUrl = needAddPathLang
  ? joinUrl(baseUrl, `/${getCurrentLang()}`)
  : baseUrl;

const router = createRouter({
  history: createWebHistory(routerBaseUrl),
  routes,
  parseQuery: (v) => {
    return qs.parse(v) as any;
  },
  stringifyQuery: (v) => {
    const query = v || {};
    const str = qs.stringify(query, {
      encodeValuesOnly: true
    });
    return str;
  }
});

router.beforeEach(async (to, from, next) => {
  await loadLocaleMessages();

  if (from?.matched?.length) {
    to.meta.fromPath = from.fullPath || '';
  }

  return next();
});

router.afterEach(async () => {
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.querySelector('head')?.appendChild(canonical);
  }
  canonical.setAttribute('href', getLangHref(getCurrentLang()));

  languages.forEach((lang) => {
    const langHref = getLangHref(lang);
    let alternate = document.querySelector(
      `link[rel="alternate"][hreflang="${lang}"]`
    );
    if (!alternate) {
      alternate = document.createElement('link');
      alternate.setAttribute('rel', 'alternate');
      alternate.setAttribute('hreflang', lang);
      document.querySelector('head')?.appendChild(alternate);
    }
    alternate.setAttribute('href', langHref);
  });
});

export const getCurrentRoute = () => {
  return router.currentRoute;
};

export { router };
