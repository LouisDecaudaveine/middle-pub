type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

type Listener = (toasts: Toast[]) => void;

let toasts: Toast[] = [];
const listeners = new Set<Listener>();

const notify = () => {
  listeners.forEach((l) => {
    try {
      l(toasts);
    } catch (e) {
      console.error("Toast listener error:", e);
    }
  });
};

export const toast = {
  show: (message: string, variant: ToastVariant = "info") => {
    console.log("Showing toast:", message, variant);

    const id = crypto.randomUUID();
    toasts = [...toasts, { id, message, variant }];
    notify();

    setTimeout(() => toast.dismiss(id), 3000);
  },
  dismiss: (id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  },
  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => toasts,
};

// Convenience methods
export const showToast = toast.show;
