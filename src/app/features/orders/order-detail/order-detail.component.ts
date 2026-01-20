import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService, NotificationService } from '@core/services';
import { Order, OrderStatus } from '@core/models';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (loading()) {
      <div class="loading-container">
        <div class="loading-spinner large"></div>
        <p>Loading order...</p>
      </div>
    } @else if (order()) {
      <div class="order-detail container">
        <div class="page-header">
          <a routerLink="/orders" class="back-link">
            <span class="material-icons">arrow_back</span>
            Back to Orders
          </a>
          <div class="header-content">
            <div>
              <h1 class="page-title">Order #{{ order()?.orderNumber }}</h1>
              <p class="order-date">Placed on {{ order()?.createdAt | date:'fullDate' }}</p>
            </div>
            <span class="badge badge-lg" [class]="getStatusClass(order()!.status)">
              {{ formatStatus(order()!.status) }}
            </span>
          </div>
        </div>

        <div class="order-content">
          <div class="order-main">
            <div class="order-items card">
              <h2>Order Items</h2>
              <div class="items-list">
                @for (item of order()?.orderItems; track item.id) {
                  <div class="item">
                    <div class="item-info">
                      <a [routerLink]="['/products', item.productId]" class="item-name">
                        {{ item.productName }}
                      </a>
                      @if (item.productSku) {
                        <span class="item-sku">SKU: {{ item.productSku }}</span>
                      }
                    </div>
                    <div class="item-qty">x{{ item.quantity }}</div>
                    <div class="item-price">
                      <span class="unit-price">\${{ item.unitPrice | number:'1.2-2' }} each</span>
                      <span class="total-price">\${{ item.totalPrice | number:'1.2-2' }}</span>
                    </div>
                  </div>
                }
              </div>
            </div>

            <div class="addresses card">
              <div class="address-section">
                <h3>Shipping Address</h3>
                <p>{{ order()?.shippingAddress }}</p>
              </div>
              @if (order()?.billingAddress && order()?.billingAddress !== order()?.shippingAddress) {
                <div class="address-section">
                  <h3>Billing Address</h3>
                  <p>{{ order()?.billingAddress }}</p>
                </div>
              }
            </div>

            @if (order()?.trackingNumber) {
              <div class="tracking card">
                <h3>Tracking Information</h3>
                <p><strong>Tracking Number:</strong> {{ order()?.trackingNumber }}</p>
              </div>
            }

            @if (order()?.notes) {
              <div class="notes card">
                <h3>Order Notes</h3>
                <p>{{ order()?.notes }}</p>
              </div>
            }
          </div>

          <div class="order-sidebar">
            <div class="order-summary card">
              <h2>Order Summary</h2>

              <div class="summary-row">
                <span>Subtotal</span>
                <span>\${{ order()?.subtotal | number:'1.2-2' }}</span>
              </div>
              <div class="summary-row">
                <span>Shipping</span>
                <span>\${{ order()?.shippingAmount | number:'1.2-2' }}</span>
              </div>
              <div class="summary-row">
                <span>Tax</span>
                <span>\${{ order()?.taxAmount | number:'1.2-2' }}</span>
              </div>
              @if (order()?.discountAmount && order()!.discountAmount > 0) {
                <div class="summary-row discount">
                  <span>Discount</span>
                  <span>-\${{ order()?.discountAmount | number:'1.2-2' }}</span>
                </div>
              }
              <div class="summary-row total">
                <span>Total</span>
                <span>\${{ order()?.totalAmount | number:'1.2-2' }}</span>
              </div>
            </div>

            @if (order()?.payment) {
              <div class="payment-info card">
                <h3>Payment Information</h3>
                <div class="payment-detail">
                  <span class="label">Method:</span>
                  <span>{{ formatPaymentMethod(order()!.payment!.paymentMethod) }}</span>
                </div>
                <div class="payment-detail">
                  <span class="label">Status:</span>
                  <span class="badge badge-sm" [class]="getPaymentStatusClass(order()!.payment!.status)">
                    {{ order()?.payment?.status }}
                  </span>
                </div>
                @if (order()?.payment?.paidAt) {
                  <div class="payment-detail">
                    <span class="label">Paid:</span>
                    <span>{{ order()?.payment?.paidAt | date:'medium' }}</span>
                  </div>
                }
              </div>
            }

            @if (canCancel()) {
              <button
                class="btn btn-danger btn-block"
                (click)="cancelOrder()"
                [disabled]="cancelling()"
              >
                @if (cancelling()) {
                  <span class="loading-spinner"></span>
                }
                Cancel Order
              </button>
            }
          </div>
        </div>
      </div>
    } @else {
      <div class="not-found container">
        <span class="material-icons">error_outline</span>
        <h2>Order Not Found</h2>
        <p>The order you're looking for doesn't exist or has been removed.</p>
        <a routerLink="/orders" class="btn btn-primary">View All Orders</a>
      </div>
    }
  `,
  styles: [`
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

    .order-detail {
      padding: 2rem 1rem;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-secondary);
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }

    .back-link:hover {
      color: var(--primary-color);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .order-date {
      color: var(--text-secondary);
      margin-top: 0.25rem;
    }

    .badge-lg {
      font-size: 0.875rem;
      padding: 0.5rem 1rem;
    }

    .order-content {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 2rem;
      align-items: start;
    }

    .order-main {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .order-items,
    .addresses,
    .tracking,
    .notes {
      padding: 1.5rem;
    }

    .order-items h2,
    .addresses h3,
    .tracking h3,
    .notes h3 {
      margin-bottom: 1rem;
    }

    .items-list {
      display: flex;
      flex-direction: column;
    }

    .item {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid var(--border-color);
    }

    .item:last-child {
      border-bottom: none;
    }

    .item-name {
      font-weight: 500;
      color: var(--text-primary);
    }

    .item-sku {
      display: block;
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-top: 0.25rem;
    }

    .item-qty {
      color: var(--text-secondary);
    }

    .item-price {
      text-align: right;
    }

    .unit-price {
      display: block;
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .total-price {
      font-weight: 600;
    }

    .addresses {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .address-section p {
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .order-sidebar {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .order-summary,
    .payment-info {
      padding: 1.5rem;
    }

    .order-summary h2,
    .payment-info h3 {
      margin-bottom: 1rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
    }

    .summary-row.discount {
      color: var(--success-color);
    }

    .summary-row.total {
      font-weight: 700;
      font-size: 1.125rem;
      border-top: 1px solid var(--border-color);
      margin-top: 0.5rem;
      padding-top: 1rem;
    }

    .payment-detail {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      font-size: 0.875rem;
    }

    .payment-detail .label {
      color: var(--text-secondary);
    }

    .btn-block {
      width: 100%;
    }

    .not-found {
      text-align: center;
      padding: 4rem 1rem;
    }

    .not-found .material-icons {
      font-size: 4rem;
      color: var(--text-secondary);
      margin-bottom: 1rem;
    }

    .not-found h2 {
      margin-bottom: 0.5rem;
    }

    .not-found p {
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
    }

    @media (max-width: 1024px) {
      .order-content {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 640px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
      }

      .addresses {
        grid-template-columns: 1fr;
      }

      .item {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }

      .item-price {
        text-align: left;
      }
    }
  `]
})
export class OrderDetailComponent implements OnInit {
  order = signal<Order | null>(null);
  loading = signal(true);
  cancelling = signal(false);

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const orderId = +params['id'];
      this.loadOrder(orderId);
    });
  }

  loadOrder(id: number): void {
    this.loading.set(true);
    this.orderService.getOrderById(id).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          this.order.set(response.data);
        }
      },
      error: () => {
        this.loading.set(false);
        this.order.set(null);
      }
    });
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

  getPaymentStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'PENDING': 'badge-warning',
      'PROCESSING': 'badge-primary',
      'COMPLETED': 'badge-success',
      'FAILED': 'badge-danger',
      'REFUNDED': 'badge-danger',
      'CANCELLED': 'badge-danger'
    };
    return classes[status] || 'badge-primary';
  }

  formatPaymentMethod(method: string): string {
    return method.replace(/_/g, ' ');
  }

  canCancel(): boolean {
    const order = this.order();
    return order !== null &&
      (order.status === 'PENDING' || order.status === 'CONFIRMED');
  }

  cancelOrder(): void {
    const order = this.order();
    if (!order) return;

    this.cancelling.set(true);
    this.orderService.cancelOrder(order.id).subscribe({
      next: (response) => {
        this.cancelling.set(false);
        if (response.success) {
          this.order.set(response.data);
          this.notificationService.success('Order cancelled successfully');
        }
      },
      error: (error) => {
        this.cancelling.set(false);
        this.notificationService.error(error.error?.message || 'Failed to cancel order');
      }
    });
  }
}
