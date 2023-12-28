import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { InjectionContext } from 'pinia-di';
import type { IToken, UserInfo } from '@/types';
import { normalizeError } from '@/utils';
import { userInfo as apiUserInfo } from '@/service/api';

const tokenKey = 'LOGIN_TOKEN';
const tokenVersionKey = 'LOGIN_TOKEN_VERSION';
const loginTokenVersion = 1;

export const AppStore = ({ useStoreId }: InjectionContext) => {
  // token
  let token: IToken | null = null;

  try {
    const tokenVersion = localStorage.getItem(tokenVersionKey) || 0;
    if (loginTokenVersion !== Number(tokenVersion)) {
      localStorage.setItem(tokenVersionKey, `${loginTokenVersion}`);
      localStorage.removeItem(tokenKey);
    } else {
      const storageToken = localStorage.getItem(tokenKey);
      if (storageToken) {
        token = JSON.parse(storageToken) as IToken;
      }
    }
  } catch (e) {
    console.log(e);
  }

  return defineStore(useStoreId('AppStore'), () => {
    const init = () => {};

    const loginToken = ref<IToken | null>(token);
    const userInfo = ref<UserInfo | null>(null);
    const isLogin = computed(() => {
      return !!loginToken.value;
    });

    const setToken = (token: IToken | null) => {
      loginToken.value = token;
      if (token) {
        localStorage.setItem(tokenKey, JSON.stringify(token));
        localStorage.setItem(tokenVersionKey, `${loginTokenVersion}`);
      } else {
        localStorage.removeItem(tokenKey);
      }
    };

    const refreshUserInfo = async (force = false) => {
      if (!isLogin.value) {
        userInfo.value = null;
        return null;
      }

      if (userInfo.value && !force) {
        return userInfo.value;
      }

      try {
        userInfo.value = await apiUserInfo();
        return userInfo.value;
      } catch (e) {
        const err = normalizeError(e);
        console.error(err.message);
        return null;
      }
    };

    const setUserInfo = (info: UserInfo | null) => {
      userInfo.value = info;
    };

    const clearLogin = () => {
      setToken(null);
      userInfo.value = null;
    };

    return {
      init,

      loginToken,
      userInfo,
      isLogin,
      setToken,
      clearLogin,
      setUserInfo,
      refreshUserInfo
    };
  });
};
