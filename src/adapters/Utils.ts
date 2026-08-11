export const isNotEmpty = (val: unknown) => !!val;

export const formValidation = (isError: Record<string, string>, formData: Record<string, unknown>) => {
  let isValid = true;
  Object.values(isError).forEach((val) => val.length > 0 && (isValid = false));
  Object.values(formData).forEach((val) => {
    if (val === '') isValid = false;
  });
  return isValid;
};

export const showToastMessage = (
  toastRef: { current?: { show: (msg: any) => void } } | null,
  type: string,
  title: string,
  detail: string
) => {
  return toastRef?.current?.show({
    severity: type,
    summary: title,
    detail,
    life: 7000,
  });
};
