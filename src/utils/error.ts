type ErrorType =
  | 'ERROR'
  | 'NETWORK_ERROR'
  | 'NO_AUTHORIZATION'
  | 'LOCATION_PERMISSION_DENIED'
  | 'LOCATION_TIMEOUT'
  | 'LOCATION_POSITION_UNAVAILABLE';

export const normalizeError = <T = any>(
  error: any,
  args: { type?: ErrorType; code?: number; info?: T } = {}
) => {
  if (error instanceof GeneralError)
    return error;
  let message: string = error.message || error.errMsg || error || '未知错误';
  let type = args.type;
  if (/Failed to fetch/i.test(`${message}`)) {
    message = '请检查您的网络设置后重试';
    type = 'NETWORK_ERROR';
  }

  return new GeneralError(message, { ...args, type });
};

export class GeneralError<T = any> extends Error {
  type: ErrorType = 'ERROR';
  code?: number;
  info?: T;

  constructor(
    message: any,
    args: { type?: ErrorType; code?: number; info?: any } = {}
  ) {
    super(message);
    const { code, type = 'ERROR', info } = args;
    this.code = code;
    this.type = type;
    this.info = info;
  }
}

export type { ErrorType };
