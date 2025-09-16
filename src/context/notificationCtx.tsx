/*
 * Based on Ubicate-V2
 * Copyright (C) 2025 OpenSource eUC
 * Modified by Vicente Muñoz in 2025
 *
 * This file is part of BuscaRamos-v2.
 *
 * BuscaRamos-v2 is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

"use client";

import { createContext, useState, ReactNode, useCallback } from "react";

interface NotificationContextType {
  component: ReactNode | null;
  setNotification: (component: ReactNode | null) => void;
  clearNotification: () => void;
}

const defaultContextValue: NotificationContextType = {
  component: null,
  setNotification: () => null,
  clearNotification: () => null,
};

export const NotificationContext = createContext<NotificationContextType>(defaultContextValue);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [component, setComponent] = useState<ReactNode | null>(null);

  const setNotification = useCallback((component: ReactNode | null) => {
    setComponent(component);
  }, []);

  const clearNotification = useCallback(() => {
    setComponent(null);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        component,
        setNotification,
        clearNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
