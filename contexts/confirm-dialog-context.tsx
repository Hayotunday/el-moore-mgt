"use client";

import { createContext, useCallback, useContext, useRef, useState, ReactNode } from "react";

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Styles the confirm button as destructive (red) — use for delete/deactivate/void/revoke. */
  destructive?: boolean;
}

interface ConfirmState extends ConfirmOptions {
  open: boolean;
}

interface ConfirmDialogContextType {
  state: ConfirmState;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  resolve: (value: boolean) => void;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined);

const DEFAULT_STATE: ConfirmState = { open: false, title: "" };

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmState>(DEFAULT_STATE);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
      setState({ ...options, open: true });
    });
  }, []);

  const resolve = useCallback((value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setState((s) => ({ ...s, open: false }));
  }, []);

  return (
    <ConfirmDialogContext.Provider value={{ state, confirm, resolve }}>
      {children}
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialogState() {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error("useConfirmDialogState must be used within ConfirmDialogProvider");
  }
  return context;
}

/** `const confirm = useConfirm(); if (await confirm({ title: "Delete this?", destructive: true })) { ... }` */
export function useConfirm() {
  return useConfirmDialogState().confirm;
}
