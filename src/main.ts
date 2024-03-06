import { createRouterScroller } from 'vue-router-better-scroller';
import '@/styles/base.scss';
import { app } from '@/app';

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
