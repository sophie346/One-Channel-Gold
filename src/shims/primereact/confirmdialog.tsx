export function confirmDialog(opts: {
  message?: string;
  header?: string;
  accept?: () => void;
  reject?: () => void;
}) {
  const ok = typeof window !== 'undefined' ? window.confirm(opts.message || opts.header || 'Confirm?') : false;
  if (ok) opts.accept?.();
  else opts.reject?.();
}
