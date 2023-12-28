import { createApp, h, onMounted } from 'vue';
import { createRouterScroller } from 'vue-router-better-scroller';
import { createPinia } from 'pinia';
import { useProvideStores } from 'pinia-di';
import '@/styles/base.scss';
import { i18n } from '@/i18n';
import { router } from '@/config/router';
import { App } from '@/components';
import { AppStore, setGlobakStore } from '@/store';
import { SVGUIDDirective } from '@/directives';

const app = createApp({
  setup() {
    const { getStore } = useProvideStores({
      stores: [AppStore]
    });
    const appStore = getStore(AppStore);
    setGlobakStore(appStore);

    onMounted(() => {
      appStore.init();
    });

    return () => {
      return h(App);
    };
  }
});

app.directive('svg-uid', SVGUIDDirective);

app.use(createPinia());
app.use(i18n);
app.use(router);

app.use(
  createRouterScroller({
    selectors: {
      window: true,
      body: true,
      '.router-scroll': ({ to, from }) => {
        // same page: hash or query change
        if (to.path === from.path)
          return false;
        return true;
      }
    }
  })
);

app.mount('#app');
