import type { Directive } from 'vue';
import { GUID } from '@/utils';

const ids: Record<string, string> = {};

const SVGUIDDirective: Directive<HTMLElement> = {
  beforeMount: (svg) => {
    if (svg.tagName !== 'svg')
      return;

    const els = svg.querySelectorAll('[id]');
    const scopeIds: Record<string, string> = {};

    for (const el of els) {
      const id = el.id || '';

      // 忽略svg内的重复id
      if (scopeIds[id])
        continue;
      scopeIds[id] = id;

      // id 重复了，需要处理
      if (ids[id]) {
        const newId = GUID('uuid');
        el.id = newId;

        // fill
        const fills = svg.querySelectorAll(`[fill="url(#${id})"]`);
        for (const fill of fills) {
          fill.setAttribute('fill', `url(#${newId})`);
        }

        ids[newId] = newId;
      } else {
        ids[id] = id;
      }
    }
  }
};

export { SVGUIDDirective };
