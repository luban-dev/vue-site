export const GUID = (prefix = '', maxlen?: number) => {
  const guid
    = `${Date.now().toString(36)
     }-${
     Math.random().toString(36).substring(2, 10)
     }-${
     Math.random().toString(36).substring(2, 10)}`;

  const res = maxlen ? guid.substring(0, maxlen) : guid;

  return `${prefix}${res}`;
};
