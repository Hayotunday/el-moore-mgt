"use client";

import { TriangleAlert } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useConfirmDialogState } from "@/contexts/confirm-dialog-context";

export default function ConfirmDialog() {
  const { state, resolve } = useConfirmDialogState();

  return (
    <AlertDialog
      open={state.open}
      onOpenChange={(open) => {
        if (!open) resolve(false);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          {state.destructive && (
            <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <TriangleAlert className="h-5 w-5 text-destructive" />
            </div>
          )}
          <AlertDialogTitle>{state.title}</AlertDialogTitle>
          {state.description && (
            <AlertDialogDescription>{state.description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => resolve(false)}>
            {state.cancelLabel ?? "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => resolve(true)}
            className={
              state.destructive
                ? "bg-destructive text-white hover:bg-destructive/90"
                : undefined
            }
          >
            {state.confirmLabel ?? "Continue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
