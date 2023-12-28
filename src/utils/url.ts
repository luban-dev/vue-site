export const joinUrl = (...paths: string[]) => {
  const url = paths.join('/');
  return url.replace(/(^|\w)[\/]{2,}/g, '$1/');
};
