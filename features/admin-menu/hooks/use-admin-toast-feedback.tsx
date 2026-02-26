import * as React from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function useAdminToastFeedback() {
  const toastSuccess = React.useCallback((title: string, description?: string) => {
    toast.success(title, { description, icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" /> });
  }, []);

  const toastError = React.useCallback((title: string, description?: string) => {
    toast.error(title, { description, icon: <AlertTriangle className="h-4 w-4 text-rose-400" /> });
  }, []);

  return { toastSuccess, toastError };
}
