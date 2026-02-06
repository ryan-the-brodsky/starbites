import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  // Return a no-op if not wrapped in provider (for contexts that mount before ToastProvider)
  if (!context) {
    return { addToast: () => {}, removeToast: () => {} };
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'error', duration = 5000, action = null) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, action }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Container */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm">
          {toasts.map(toast => (
            <div
              key={toast.id}
              className={`rounded-xl p-4 shadow-xl border flex items-start gap-3 animate-slide-up ${
                toast.type === 'error'
                  ? 'bg-red-900/90 border-red-500 text-red-200'
                  : toast.type === 'warning'
                    ? 'bg-amber-900/90 border-amber-500 text-amber-200'
                    : 'bg-green-900/90 border-green-500 text-green-200'
              }`}
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{toast.message}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {toast.action && (
                  <button
                    onClick={() => {
                      toast.action.onClick();
                      removeToast(toast.id);
                    }}
                    className={`text-xs font-medium px-3 py-1 rounded-lg transition-colors ${
                      toast.type === 'error'
                        ? 'bg-red-700 hover:bg-red-600 text-red-100'
                        : toast.type === 'warning'
                          ? 'bg-amber-700 hover:bg-amber-600 text-amber-100'
                          : 'bg-green-700 hover:bg-green-600 text-green-100'
                    }`}
                  >
                    {toast.action.label}
                  </button>
                )}
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-xs opacity-60 hover:opacity-100 transition-opacity"
                >
                  &times;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export default ToastContext;
