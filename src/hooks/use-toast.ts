
import * as React from "react";
import { toast as sonnerToast, type ToastT } from "sonner";

// Define the types for our toast props
export type ToastProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
};

// Create a simplified toast function that matches our application needs
export function toast(props: ToastProps) {
  const { title, description, variant, action } = props;
  
  if (variant === "destructive") {
    return sonnerToast.error(title as string, {
      description: description,
      action: action,
    });
  }
  
  return sonnerToast(title as string, {
    description: description,
    action: action,
  });
}

// Create a hook to access toast functionality
export function useToast() {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
    // Add other toast methods if needed
  };
}
