import { createPortal } from "react-dom";
import "@/shared/ui/error-notification.css";

type ErrorNotificationProps = {
  title: string;
  message: string;
  onClose: () => void;
};

export function ErrorNotification({ title, message, onClose }: ErrorNotificationProps) {
  return createPortal(
    <div className="error-notification" role="alert" aria-live="assertive" aria-atomic="true">
      <div className="error-notification__content">
        <strong>{title}</strong>
        <p>{message}</p>
      </div>
      <button
        className="error-notification__close"
        type="button"
        aria-label="Закрыть уведомление об ошибке"
        title="Закрыть"
        onClick={onClose}>
        ×
      </button>
    </div>,
    document.body,
  );
}
