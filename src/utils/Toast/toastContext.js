import React, { createContext, useCallback, useContext, useState } from 'react';
import { CustomToast, TOAST_TYPES } from './customToast';

const ToastContext = createContext({
  showToast: () => { },
  hideToast: () => { },
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [toastProps, setToastProps] = useState({
    message: '',
    type: TOAST_TYPES.INFO,
    duration: 3000,
    position: 'top',
  });

  const showToast = useCallback(({
    message,
    type = TOAST_TYPES.INFO,
    duration = 3000,
    position = 'top',
    title,
    action = false,
    actionText,
    actionOnPress,
  }) => {
    setToastProps({
      message,
      type,
      duration,
      position,
      title,
      action,
      actionText,
      actionOnPress,
    });
    setVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <CustomToast
        visible={visible}
        isGlobal={true}
        onClose={() => setVisible(false)}
        {...toastProps}
      />
    </ToastContext.Provider>
  );
};

// Custom hooks for pre-configured toast functions
export const useToastHelpers = () => {
  const { showToast } = useToast();

  return {
    success: useCallback((message, options = {}) => {
      showToast({
        message,
        type: TOAST_TYPES.SUCCESS,
        ...options,
      });
    }, [showToast]),

    error: useCallback((message, options = {}) => {
      showToast({
        message,
        type: TOAST_TYPES.ERROR,
        ...options,
      });
    }, [showToast]),

    info: useCallback((message, options = {}) => {
      showToast({
        message,
        type: TOAST_TYPES.INFO,
        ...options,
      });
    }, [showToast]),

    warning: useCallback((message, options = {}) => {
      showToast({
        message,
        type: TOAST_TYPES.WARNING,
        ...options,
      });
    }, [showToast]),
  };
};