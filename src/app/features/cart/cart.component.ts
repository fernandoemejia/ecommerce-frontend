import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CartService, NotificationService } from '@core/services';
import { Cart, CartItem } from '@core/models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="cart-page container">
      <h1 class="page-title">Shopping Cart</h1>

      @if (loading()) {
        <div class="loading-container">
          <div class="loading-spinner large"></div>
          <p>Loading cart...</p>
        </div>
      } @else if (cartItems().length === 0) {
        <div class="empty-cart card">
          <span class="material-icons">shopping_cart</span>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any items yet.</p>
          <a routerLink="/products" class="btn btn-primary">Start Shopping</a>
        </div>
      } @else {
        <div class="cart-content">
          <div class="cart-items">
            @for (item of cartItems(); track item.id) {
              <div class="cart-item card">
                <div class="item-image">
                  @if (item.productImageUrl) {
                    <img [src]="item.productImageUrl" [alt]="item.productName" />
                  } @else {
                    <div class="placeholder-image">
                      <span class="material-icons">image</span>
                    </div>
                  }
                </div>

                <div class="item-details">
                  <a [routerLink]="['/products', item.productId]" class="item-name">
                    {{ item.productName }}
                  </a>
                  <p class="item-price">\${{ item.unitPrice | number:'1.2-2' }} each</p>

                  @if (!item.inStock) {
                    <span class="out-of-stock-warning">
                      <span class="material-icons">warning</span>
                      Out of stock
                    </span>
                  } @else if (item.quantity > item.availableStock) {
                    <span class="out-of-stock-warning">
                      <span class="material-icons">warning</span>
                      Only {{ item.availableStock }} available
                    </span>
                  }
                </div>

                <div class="item-quantity">
                  <button
                    class="qty-btn"
                    (click)="updateQuantity(item, item.quantity - 1)"
                    [disabled]="updatingItem() === item.id || item.quantity <= 1"
                  >-</button>
                  <span class="qty-value">{{ item.quantity }}</span>
                  <button
                    class="qty-btn"
                    (click)="updateQuantity(item, item.quantity + 1)"
                    [disabled]="updatingItem() === item.id || item.quantity >= item.availableStock"
                  >+</button>
                </div>

                <div class="item-total">
                  <span class="total-label">Total</span>
                  <span class="total-value">\${{ item.totalPrice | number:'1.2-2' }}</span>
                </div>

                <button
                  class="remove-btn"
                  (click)="removeItem(item)"
                  [disabled]="removingItem() === item.id"
                  title="Remove item"
                >
                  @if (removingItem() === item.id) {
                    <span class="loading-spinner small"></span>
                  } @else {
                    <span class="material-icons">delete</span>
                  }
                </button>
              </div>
            }
          </div>

          <div class="cart-summary card">
            <h2>Order Summary</h2>

            <div class="summary-row">
              <span>Subtotal ({{ cartItemCount() }} items)</span>
              <span>\${{ cartTotal() | number:'1.2-2' }}</span>
            </div>

            <div class="summary-row">
              <span>Shipping</span>
              <span class="free-shipping">Free</span>
            </div>

            <div class="summary-row total">
              <span>Total</span>
              <span>\${{ cartTotal() | number:'1.2-2' }}</span>
            </div>

            <button
              class="btn btn-primary btn-lg btn-block"
              (click)="proceedToCheckout()"
              [disabled]="!canCheckout()"
            >
              Proceed to Checkout
            </button>

            <button
              class="btn btn-outline btn-block mt-2"
              (click)="clearCart()"
              [disabled]="clearing()"
            >
              @if (clearing()) {
                <span class="loading-spinner"></span>
              }
              Clear Cart
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .cart-page {
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

    .loading-spinner.small {
      width: 16px;
      height: 16px;
    }

    .empty-cart {
      text-align: center;
      padding: 4rem 2rem;
    }

    .empty-cart .material-icons {
      font-size: 4rem;
      color: var(--text-secondary);
      margin-bottom: 1rem;
    }

    .empty-cart h2 {
      margin-bottom: 0.5rem;
    }

    .empty-cart p {
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
    }

    .cart-content {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 2rem;
      align-items: start;
    }

    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .cart-item {
      display: grid;
      grid-template-columns: 100px 1fr auto auto auto;
      gap: 1.5rem;
      padding: 1.5rem;
      align-items: center;
    }

    .item-image {
      width: 100px;
      height: 100px;
      border-radius: var(--radius);
      overflow: hidden;
      background: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .placeholder-image {
      color: #cbd5e1;
    }

    .item-details {
      min-width: 0;
    }

    .item-name {
      font-weight: 600;
      color: var(--text-primary);
      display: block;
      margin-bottom: 0.25rem;
    }

    .item-price {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .out-of-stock-warning {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      color: var(--danger-color);
      font-size: 0.75rem;
      margin-top: 0.5rem;
    }

    .out-of-stock-warning .material-icons {
      font-size: 1rem;
    }

    .item-quantity {
      display: flex;
      align-items: center;
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
    }

    .qty-btn {
      width: 32px;
      height: 32px;
      border: none;
      background: none;
      cursor: pointer;
      font-size: 1rem;
    }

    .qty-btn:hover:not(:disabled) {
      background: var(--background-color);
    }

    .qty-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .qty-value {
      width: 40px;
      text-align: center;
      font-weight: 500;
    }

    .item-total {
      text-align: right;
      min-width: 80px;
    }

    .total-label {
      display: block;
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .total-value {
      font-weight: 700;
      font-size: 1.125rem;
    }

    .remove-btn {
      width: 40px;
      height: 40px;
      border: none;
      background: none;
      color: var(--text-secondary);
      cursor: pointer;
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .remove-btn:hover:not(:disabled) {
      background: rgba(239, 68, 68, 0.1);
      color: var(--danger-color);
    }

    .cart-summary {
      position: sticky;
      top: 100px;
      padding: 1.5rem;
    }

    .cart-summary h2 {
      font-size: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--border-color);
    }

    .summary-row.total {
      font-weight: 700;
      font-size: 1.125rem;
      border-bottom: none;
      margin-bottom: 1.5rem;
    }

    .free-shipping {
      color: var(--success-color);
      font-weight: 500;
    }

    .btn-block {
      width: 100%;
    }

    @media (max-width: 1024px) {
      .cart-content {
        grid-template-columns: 1fr;
      }

      .cart-summary {
        position: static;
      }
    }

    @media (max-width: 768px) {
      .cart-item {
        grid-template-columns: 80px 1fr;
        gap: 1rem;
      }

      .item-quantity,
      .item-total,
      .remove-btn {
        grid-column: 2;
      }

      .item-total {
        text-align: left;
      }
    }
  `]
})
export class CartComponent implements OnInit {
  loading = signal(true);
  updatingItem = signal<number | null>(null);
  removingItem = signal<number | null>(null);
  clearing = signal(false);

  private cartService = inject(CartService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  cartItems = this.cartService.cartItems;
  cartTotal = this.cartService.cartTotal;
  cartItemCount = this.cartService.cartItemCount;

  constructor() {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading.set(true);
    this.cartService.loadCart().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false)
    });
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1 || newQuantity > item.availableStock) return;

    this.updatingItem.set(item.id);
    this.cartService.updateQuantity(item.productId, { quantity: newQuantity }).subscribe({
      next: () => this.updatingItem.set(null),
      error: () => {
        this.updatingItem.set(null);
        this.notificationService.error('Failed to update quantity');
      }
    });
  }

  removeItem(item: CartItem): void {
    this.removingItem.set(item.id);
    this.cartService.removeFromCart(item.productId).subscribe({
      next: () => {
        this.removingItem.set(null);
        this.notificationService.success('Item removed from cart');
      },
      error: () => {
        this.removingItem.set(null);
        this.notificationService.error('Failed to remove item');
      }
    });
  }

  clearCart(): void {
    this.clearing.set(true);
    this.cartService.clearCart().subscribe({
      next: () => {
        this.clearing.set(false);
        this.notificationService.success('Cart cleared');
      },
      error: () => {
        this.clearing.set(false);
        this.notificationService.error('Failed to clear cart');
      }
    });
  }

  canCheckout(): boolean {
    return this.cartItems().length > 0 &&
      this.cartItems().every(item => item.inStock && item.quantity <= item.availableStock);
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }
}
