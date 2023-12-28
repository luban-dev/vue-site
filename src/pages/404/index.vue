<script setup lang="ts">
import * as S from './index.module.scss';
import Icon404 from '@/assets/imgs/404.svg?component';
</script>

<template>
  <div :class="S.box">
    <Icon404 v-svg-uid :class="S.icon" />
  </div>
</template>
