export const trimParams = (
  params: Record<string, any>,
  trim: any[] = ['', null, undefined]
) => {
  const res: Record<string, any> = {};

  Object.keys(params).forEach((key) => {
    const val = params[key];
    if (!trim.includes(val)) {
      res[key] = val;
    }
  });

  return res;
};

export const copyText = async (val: string) => {
  if (navigator.clipboard && navigator.permissions) {
    await navigator.clipboard.writeText(val);
  } else {
    const textArea: HTMLTextAreaElement = document.createElement('textarea');
    textArea.value = val;
    textArea.style.width = '0px';
    textArea.style.position = 'fixed';
    textArea.style.left = '-999px';
    textArea.style.top = '10px';
    textArea.setAttribute('readonly', 'readonly');
    document.body.appendChild(textArea);

    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
};

export const cloneData = <T>(v: T) => {
  return JSON.parse(JSON.stringify(v)) as T;
};
