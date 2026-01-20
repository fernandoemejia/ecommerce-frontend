import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private idCounter = 0;
  private notificationsState = signal<Notification[]>([]);

  readonly notifications = this.notificationsState.asReadonly();

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 5000): void {
    const notification: Notification = {
      id: ++this.idCounter,
      type,
      message
    };

    this.notificationsState.update(notifications => [...notifications, notification]);

    if (duration > 0) {
      setTimeout(() => this.dismiss(notification.id), duration);
    }
  }

  success(message: string, duration = 5000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 5000): void {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration = 5000): void {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration = 5000): void {
    this.show(message, 'info', duration);
  }

  dismiss(id: number): void {
    this.notificationsState.update(notifications =>
      notifications.filter(n => n.id !== id)
    );
  }

  clear(): void {
    this.notificationsState.set([]);
  }
}
