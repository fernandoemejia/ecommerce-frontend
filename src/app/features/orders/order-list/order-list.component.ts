import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '@core/services';
import { Order, OrderStatus } from '@core/models';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="orders-page container">
      <h1 class="page-title">My Orders</h1>

      @if (loading()) {
        <div class="loading-container">
          <div class="loading-spinner large"></div>
          <p>Loading orders...</p>
        </div>
      } @else if (orders().length === 0) {
        <div class="empty-state card">
          <span class="material-icons">receipt_long</span>
          <h2>No orders yet</h2>
          <p>When you place orders, they will appear here.</p>
          <a routerLink="/products" class="btn btn-primary">Start Shopping</a>
        </div>
      } @else {
        <div class="orders-list">
          @for (order of orders(); track order.id) {
            <div class="order-card card">
              <div class="order-header">
                <div class="order-info">
                  <span class="order-number">Order #{{ order.orderNumber }}</span>
                  <span class="order-date">{{ order.createdAt | date:'medium' }}</span>
                </div>
                <span class="badge" [class]="getStatusClass(order.status)">
                  {{ formatStatus(order.status) }}
                </span>
              </div>

              <div class="order-items">
                @for (item of order.orderItems.slice(0, 3); track item.id) {
                  <div class="order-item">
                    <span class="item-name">{{ item.productName }}</span>
                    <span class="item-qty">x{{ item.quantity }}</span>
                    <span class="item-price">\${{ item.totalPrice | number:'1.2-2' }}</span>
                  </div>
                }
                @if (order.orderItems.length > 3) {
                  <div class="more-items">
                    +{{ order.orderItems.length - 3 }} more items
                  </div>
                }
              </div>

              <div class="order-footer">
                <div class="order-total">
                  <span class="total-label">Total</span>
                  <span class="total-value">\${{ order.totalAmount | number:'1.2-2' }}</span>
                </div>
                <a [routerLink]="['/orders', order.id]" class="btn btn-outline btn-sm">
                  View Details
                </a>
              </div>
            </div>
          }
        </div>

        @if (totalPages() > 1) {
          <div class="pagination">
            <button
              class="btn btn-outline"
              [disabled]="currentPage() === 0"
              (click)="goToPage(currentPage() - 1)"
            >
              Previous
            </button>
            <span class="page-info">
              Page {{ currentPage() + 1 }} of {{ totalPages() }}
            </span>
            <button
              class="btn btn-outline"
              [disabled]="currentPage() >= totalPages() - 1"
              (click)="goToPage(currentPage() + 1)"
            >
              Next
            </button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .orders-page {
      padding: 2rem 1rem;
    }

    .loading-container {
      text-align: center;
      padding: 4rem;
    }

    .loading-spinner.large {
      width: 40px;
      height: 40px;
      border-color: var(--primary-color);
      border-top-color: transparent;
      margin: 0 auto 1rem;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
    }

    .empty-state .material-icons {
      font-size: 4rem;
      color: var(--text-secondary);
      margin-bottom: 1rem;
    }

    .empty-state h2 {
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .order-card {
      padding: 1.5rem;
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border-color);
    }

    .order-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .order-number {
      font-weight: 600;
      color: var(--text-primary);
    }

    .order-date {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .order-items {
      margin-bottom: 1rem;
    }

    .order-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      font-size: 0.875rem;
    }

    .item-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-right: 1rem;
    }

    .item-qty {
      color: var(--text-secondary);
      margin-right: 1rem;
    }

    .item-price {
      font-weight: 500;
    }

    .more-items {
      color: var(--text-secondary);
      font-size: 0.875rem;
      padding: 0.5rem 0;
    }

    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
    }

    .total-label {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .total-value {
      display: block;
      font-size: 1.25rem;
      font-weight: 700;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;
    }

    .page-info {
      color: var(--text-secondary);
    }
  `]
})
export class OrderListComponent implements OnInit {
  orders = signal<Order[]>([]);
  loading = signal(true);
  currentPage = signal(0);
  totalPages = signal(0);

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.orderService.getMyOrders(this.currentPage()).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success && response.data) {
          this.orders.set(response.data.content);
          this.totalPages.set(response.data.totalPages);
        }
      },
      error: () => this.loading.set(false)
    });
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadOrders();
  }

  formatStatus(status: OrderStatus): string {
    return status.replace(/_/g, ' ');
  }

  getStatusClass(status: OrderStatus): string {
    const classes: Record<OrderStatus, string> = {
      'PENDING': 'badge-warning',
      'CONFIRMED': 'badge-primary',
      'PROCESSING': 'badge-primary',
      'SHIPPED': 'badge-primary',
      'DELIVERED': 'badge-success',
      'CANCELLED': 'badge-danger',
      'REFUNDED': 'badge-danger'
    };
    return classes[status] || 'badge-primary';
  }
}
