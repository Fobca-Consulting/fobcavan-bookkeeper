
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        className: "border-border bg-background text-foreground",
        classNames: {
          error: "bg-destructive text-destructive-foreground",
          success: "bg-green-500 text-green-50",
          warning: "bg-yellow-500 text-yellow-50",
          info: "bg-blue-500 text-blue-50",
        },
      }}
    />
  );
}
