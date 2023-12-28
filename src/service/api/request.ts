import qs from 'qs';
import { GeneralError, joinUrl, normalizeError } from '@/utils';
import { apiBaseUrl } from '@/config';
import { getGlobalStore } from '@/store';
import { getServerLang, i18n } from '@/i18n';
import type { IToken } from '@/types';

// 是否有 refresh token 逻辑
const USE_REFRESH_TOKEN = false;
export const ServerErrMsg
  = 'Sorry, the server encountered an error. Please try again later.';
const checkIsRefreshToken = (url = '') => url.includes('admin/v1/token');

// refresh token 最大尝试次数
const refreshTokenRetryCount = 5;
let refreshTokenPromise: Promise<any> | null = null;

interface RequestParams {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: FormData | { [key: string]: any } | string;
  query?: { [key: string]: any };
  responseType?: 'json' | 'blob' | 'text';
  noAuth?: boolean;
  contentType?: string;
  baseUrl?: string;
  retryCount?: number;
  cacheTime?: number;
  useCache?: boolean;
  token?: string;
  language?: string;
}

export interface ResponseType<T> {
  data: T;
  headers: Record<string, any>;
}

const cacheData: Record<
  string,
  {
    expiredIn: number;
    data: any;
  }
> = {};

export const request = async <T>(
  params: RequestParams
): Promise<ResponseType<T>> => {
  const { noAuth = false } = params;
  const isRefreshToken = checkIsRefreshToken(params?.url);
  const retryCount = params.retryCount || 0;

  const globalStore = getGlobalStore()!;
  const { loginToken } = globalStore;
  const token = params.token || loginToken?.accessToken || '';
  const language = params.language || i18n.global.locale.value;
  const {
    url,
    method = 'GET',
    data = {},
    query = {},
    contentType = 'application/json',
    responseType = 'json',
    baseUrl,
    cacheTime,
    useCache = false
  } = params;

  // headers
  const headers: Record<string, string> = {
    'Content-Type': contentType,
    'Accept-Language': getServerLang(language as any),
    'ngrok-skip-browser-warning': '*'
  };

  // auth token
  if (token && !noAuth) {
    headers.Authorization = `Bearer ${token}`;
  }

  // url
  let requestURL = baseUrl
    ? `${joinUrl(baseUrl, url)}`
    : `${joinUrl(apiBaseUrl, url)}`;
  let realQuerry = { ...query };
  if (method === 'GET' && typeof data === 'object') {
    realQuerry = {
      ...query,
      ...data
    };
  }
  const search = qs.stringify(
    {
      ...realQuerry
    },
    {
      encodeValuesOnly: true
    }
  );
  requestURL = `${requestURL}?${search}`;

  // data: stirng or formdata
  let requestData: string | FormData;
  if (typeof data === 'object') {
    if (contentType === 'application/json') {
      requestData = JSON.stringify(data);
    } else {
      const form = new FormData();
      Object.keys(data).forEach((key) => {
        form.append(key, data[key as keyof typeof data]);
      });
      requestData = form;
    }
  } else {
    requestData = data;
  }

  // use cache
  if (useCache && method === 'GET') {
    const cache = cacheData[requestURL];
    if (cache) {
      if (cache.expiredIn <= Date.now()) {
        delete cacheData[requestURL];
      } else {
        return cache.data;
      }
    }
  }

  // 正在刷新token, 共用 refresh token 的请求
  if (refreshTokenPromise && !isRefreshToken && !noAuth) {
    await refreshTokenPromise;
    // 刷新成功
    return await request<T>(params);
  }

  try {
    const res = await fetch(requestURL, {
      method,
      headers,
      cache: 'no-cache',
      credentials: 'same-origin',
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      mode: 'cors',
      body: method === 'GET' ? undefined : requestData
    });
    const isSuccessCode = res.status >= 200 && res.status < 300;

    // 登录过期 / 未登录
    if (res.status === 401) {
      // 已经在刷新token
      if (refreshTokenPromise) {
        return refreshTokenPromise.then(() => {
          return request<T>(params);
        });
      }

      // 未登录，或者不需要refresh token
      if (!token || !USE_REFRESH_TOKEN || noAuth || isRefreshToken) {
        globalStore.clearLogin();
        return await Promise.reject(
          new GeneralError('登录过期', { type: 'NO_AUTHORIZATION' })
        );
      }

      // 其他接口等等 refresh token 完成再调用
      let resolve: (v: any) => void;
      let reject: (v: any) => void;
      refreshTokenPromise = new Promise((rs, rj) => {
        resolve = (v) => {
          rs(v);
          refreshTokenPromise = null;
        };
        reject = (e) => {
          rj(e);
          refreshTokenPromise = null;
        };
      });

      // 登录过期，刷新token
      const promise = post<IToken>({
        url: '/token',
        noAuth: true,
        data: {
          // refreshToken: token.refreshToken
        }
      })
        .then((v) => {
          // globalStore.setToken(v.data);
          resolve && resolve(v);
          return request<T>(params);
        })
        .catch(() => {
          const err = new GeneralError('登录过期', {
            type: 'NO_AUTHORIZATION'
          });
          // globalStore.clearLogin();
          reject && reject(err);
          throw err;
        });

      return promise;
    }

    // 其他业务逻辑错误
    if (!isSuccessCode) {
      let errInfo = {};
      try {
        errInfo = await res.json();
      } catch (e) {}

      return Promise.reject(
        new GeneralError(
          (errInfo as any).message || (errInfo as any).error || ServerErrMsg,
          {
            info: {
              ...errInfo,
              statusCode: res.status
            }
          }
        )
      );
    }

    // success
    let returnData: ResponseType<T>;
    try {
      const resData
        = responseType === 'json'
          ? await res.json()
          : responseType === 'text'
            ? await res.text()
            : await res.blob();

      returnData = {
        data: resData as unknown as T,
        headers: res.headers
      };
    } catch (e) {
      returnData = {
        data: undefined as unknown as T,
        headers: res.headers
      };
    }

    if (cacheTime && method === 'GET') {
      cacheData[requestURL] = {
        expiredIn: Date.now() + cacheTime,
        data: returnData
      };
    }

    return returnData;
  } catch (e) {
    // refresh token 遇到网络错误，可以尝试多次
    if (isRefreshToken && retryCount < refreshTokenRetryCount) {
      return request<T>({
        ...params,
        retryCount: retryCount + 1
      });
    }

    return Promise.reject(
      normalizeError('请检查您的网络设置后重试', { type: 'NETWORK_ERROR' })
    );
  }
};

export function get<T>(params: RequestParams) {
  return request<T>({
    ...params,
    method: 'GET'
  });
};

export function post<T>(params: RequestParams) {
  return request<T>({
    ...params,
    method: 'POST'
  });
};

export function patch<T>(params: RequestParams) {
  return request<T>({
    ...params,
    method: 'PATCH'
  });
};

export function del<T>(params: RequestParams) {
  return request<T>({
    ...params,
    method: 'DELETE'
  });
};
