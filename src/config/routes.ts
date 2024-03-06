import type { RouteRecordRaw } from 'vue-router';

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

export { routes };
