import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '@core/services';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      @for (notification of notificationService.notifications(); track notification.id) {
        <div class="notification" [class]="notification.type">
          <span class="material-icons icon">{{ getIcon(notification.type) }}</span>
          <span class="message">{{ notification.message }}</span>
          <button class="close-btn" (click)="notificationService.dismiss(notification.id)">
            <span class="material-icons">close</span>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 80px;
      right: 1rem;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: 400px;
    }

    .notification {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: var(--radius);
      background: var(--card-background);
      box-shadow: var(--shadow-lg);
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .notification.success {
      border-left: 4px solid var(--success-color);
    }

    .notification.error {
      border-left: 4px solid var(--danger-color);
    }

    .notification.warning {
      border-left: 4px solid var(--warning-color);
    }

    .notification.info {
      border-left: 4px solid var(--primary-color);
    }

    .icon {
      font-size: 1.25rem;
    }

    .notification.success .icon {
      color: var(--success-color);
    }

    .notification.error .icon {
      color: var(--danger-color);
    }

    .notification.warning .icon {
      color: var(--warning-color);
    }

    .notification.info .icon {
      color: var(--primary-color);
    }

    .message {
      flex: 1;
      font-size: 0.875rem;
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-secondary);
      padding: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn:hover {
      color: var(--text-primary);
    }

    .close-btn .material-icons {
      font-size: 1rem;
    }
  `]
})
export class NotificationComponent {
  constructor(public notificationService: NotificationService) {}

  getIcon(type: Notification['type']): string {
    const icons = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };
    return icons[type];
  }
}
