import { forwardRef, useImperativeHandle, useState } from 'react';

type ToastMessage = {
  severity?: string;
  summary?: string;
  detail?: string;
  life?: number;
};

export const Toast = forwardRef(function Toast(_, ref) {
  const [messages, setMessages] = useState<Array<ToastMessage & { id: number }>>([]);

  useImperativeHandle(ref, () => ({
    show(msg: ToastMessage) {
      const id = Date.now() + Math.random();
      setMessages((prev) => [...prev, { ...msg, id }]);
      window.setTimeout(() => {
        setMessages((prev) => prev.filter((m) => m.id !== id));
      }, msg.life || 7000);
    },
  }));

  return (
    <div className="fixed top-4 right-4 z-[80] space-y-2 max-w-sm">
      {messages.map((msg) => {
        const isError = msg.severity === 'error';
        const isInfo = msg.severity === 'info';
        return (
          <div
            key={msg.id}
            className={`rounded-lg border px-4 py-3 shadow-lg text-sm ${
              isError
                ? 'bg-white border-red-200 text-red-700'
                : isInfo
                  ? 'bg-white border-blue-200 text-blue-800'
                  : 'bg-white border-green-200 text-green-800'
            }`}
          >
            {msg.summary ? <p className="font-semibold mb-0.5">{msg.summary}</p> : null}
            <p>{msg.detail}</p>
          </div>
        );
      })}
    </div>
  );
});
