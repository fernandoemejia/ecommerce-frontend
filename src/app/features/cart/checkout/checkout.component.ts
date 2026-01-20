import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService, OrderService, NotificationService, AuthService } from '@core/services';
import { PaymentMethod } from '@core/models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="checkout-page container">
      <h1 class="page-title">Checkout</h1>

      @if (cartItems().length === 0) {
        <div class="empty-cart card">
          <span class="material-icons">shopping_cart</span>
          <h2>Your cart is empty</h2>
          <p>Add some items to your cart before checking out.</p>
          <a routerLink="/products" class="btn btn-primary">Browse Products</a>
        </div>
      } @else {
        <div class="checkout-content">
          <div class="checkout-form card">
            <form [formGroup]="checkoutForm" (ngSubmit)="placeOrder()">
              <div class="form-section">
                <h2>Shipping Address</h2>
                <div class="form-group">
                  <label class="form-label">Full Address *</label>
                  <textarea
                    class="form-input"
                    [class.error]="isFieldInvalid('shippingAddress')"
                    formControlName="shippingAddress"
                    rows="3"
                    placeholder="Enter your complete shipping address"
                  ></textarea>
                  @if (isFieldInvalid('shippingAddress')) {
                    <span class="form-error">Shipping address is required</span>
                  }
                </div>
              </div>

              <div class="form-section">
                <h2>Billing Address</h2>
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    [checked]="sameAsShipping()"
                    (change)="toggleSameAsShipping()"
                  />
                  Same as shipping address
                </label>

                @if (!sameAsShipping()) {
                  <div class="form-group mt-3">
                    <label class="form-label">Billing Address</label>
                    <textarea
                      class="form-input"
                      formControlName="billingAddress"
                      rows="3"
                      placeholder="Enter your billing address"
                    ></textarea>
                  </div>
                }
              </div>

              <div class="form-section">
                <h2>Payment Method</h2>
                <div class="payment-methods">
                  @for (method of paymentMethods; track method.value) {
                    <label class="payment-option" [class.selected]="selectedPaymentMethod() === method.value">
                      <input
                        type="radio"
                        name="paymentMethod"
                        [value]="method.value"
                        [checked]="selectedPaymentMethod() === method.value"
                        (change)="selectPaymentMethod(method.value)"
                      />
                      <span class="material-icons">{{ method.icon }}</span>
                      <span>{{ method.label }}</span>
                    </label>
                  }
                </div>
              </div>

              <div class="form-section">
                <h2>Order Notes (Optional)</h2>
                <div class="form-group">
                  <textarea
                    class="form-input"
                    formControlName="notes"
                    rows="2"
                    placeholder="Any special instructions for your order"
                  ></textarea>
                </div>
              </div>
            </form>
          </div>

          <div class="order-summary card">
            <h2>Order Summary</h2>

            <div class="summary-items">
              @for (item of cartItems(); track item.id) {
                <div class="summary-item">
                  <span class="item-name">{{ item.productName }}</span>
                  <span class="item-qty">x{{ item.quantity }}</span>
                  <span class="item-price">\${{ item.totalPrice | number:'1.2-2' }}</span>
                </div>
              }
            </div>

            <div class="summary-totals">
              <div class="summary-row">
                <span>Subtotal</span>
                <span>\${{ cartTotal() | number:'1.2-2' }}</span>
              </div>
              <div class="summary-row">
                <span>Shipping</span>
                <span class="free">Free</span>
              </div>
              <div class="summary-row">
                <span>Tax</span>
                <span>\$0.00</span>
              </div>
              <div class="summary-row total">
                <span>Total</span>
                <span>\${{ cartTotal() | number:'1.2-2' }}</span>
              </div>
            </div>

            <button
              type="submit"
              class="btn btn-primary btn-lg btn-block"
              (click)="placeOrder()"
              [disabled]="processing() || checkoutForm.invalid"
            >
              @if (processing()) {
                <span class="loading-spinner"></span>
                Processing...
              } @else {
                Place Order
              }
            </button>

            <a routerLink="/cart" class="back-to-cart">
              <span class="material-icons">arrow_back</span>
              Back to Cart
            </a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .checkout-page {
      padding: 2rem 1rem;
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

    .checkout-content {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 2rem;
      align-items: start;
    }

    .checkout-form {
      padding: 1.5rem;
    }

    .form-section {
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid var(--border-color);
    }

    .form-section:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }

    .form-section h2 {
      font-size: 1.125rem;
      margin-bottom: 1rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .checkbox-label input {
      width: 18px;
      height: 18px;
    }

    .payment-methods {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .payment-option {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      border: 2px solid var(--border-color);
      border-radius: var(--radius);
      cursor: pointer;
      transition: all 0.2s;
    }

    .payment-option:hover {
      border-color: var(--primary-color);
    }

    .payment-option.selected {
      border-color: var(--primary-color);
      background: rgba(59, 130, 246, 0.05);
    }

    .payment-option input {
      display: none;
    }

    .payment-option .material-icons {
      color: var(--text-secondary);
    }

    .payment-option.selected .material-icons {
      color: var(--primary-color);
    }

    .order-summary {
      position: sticky;
      top: 100px;
      padding: 1.5rem;
    }

    .order-summary h2 {
      font-size: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .summary-items {
      margin-bottom: 1.5rem;
      max-height: 200px;
      overflow-y: auto;
    }

    .summary-item {
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

    .summary-totals {
      border-top: 1px solid var(--border-color);
      padding-top: 1rem;
      margin-bottom: 1.5rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
    }

    .summary-row.total {
      font-weight: 700;
      font-size: 1.25rem;
      border-top: 1px solid var(--border-color);
      margin-top: 0.5rem;
      padding-top: 1rem;
    }

    .free {
      color: var(--success-color);
    }

    .btn-block {
      width: 100%;
    }

    .back-to-cart {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 1rem;
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .back-to-cart:hover {
      color: var(--primary-color);
    }

    @media (max-width: 1024px) {
      .checkout-content {
        grid-template-columns: 1fr;
      }

      .order-summary {
        position: static;
      }
    }

    @media (max-width: 640px) {
      .payment-methods {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private router = inject(Router);

  checkoutForm: FormGroup;
  processing = signal(false);
  sameAsShipping = signal(true);
  selectedPaymentMethod = signal<PaymentMethod>('CREDIT_CARD');

  cartItems = this.cartService.cartItems;
  cartTotal = this.cartService.cartTotal;

  paymentMethods = [
    { value: 'CREDIT_CARD' as PaymentMethod, label: 'Credit Card', icon: 'credit_card' },
    { value: 'DEBIT_CARD' as PaymentMethod, label: 'Debit Card', icon: 'payment' },
    { value: 'PAYPAL' as PaymentMethod, label: 'PayPal', icon: 'account_balance_wallet' },
    { value: 'CASH_ON_DELIVERY' as PaymentMethod, label: 'Cash on Delivery', icon: 'local_shipping' }
  ];

  constructor() {
    this.checkoutForm = this.fb.group({
      shippingAddress: ['', Validators.required],
      billingAddress: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    if (this.cartItems().length === 0) {
      this.cartService.loadCart().subscribe();
    }

    const user = this.authService.currentUser();
    if (user?.address) {
      this.checkoutForm.patchValue({ shippingAddress: user.address });
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.checkoutForm.get(field);
    return control ? control.invalid && control.touched : false;
  }

  toggleSameAsShipping(): void {
    this.sameAsShipping.update(v => !v);
    if (this.sameAsShipping()) {
      this.checkoutForm.patchValue({ billingAddress: '' });
    }
  }

  selectPaymentMethod(method: PaymentMethod): void {
    this.selectedPaymentMethod.set(method);
  }

  placeOrder(): void {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.processing.set(true);

    const formValue = this.checkoutForm.value;
    const orderRequest = {
      shippingAddress: formValue.shippingAddress,
      billingAddress: this.sameAsShipping() ? formValue.shippingAddress : formValue.billingAddress,
      notes: formValue.notes
    };

    this.orderService.checkout(orderRequest).subscribe({
      next: (response) => {
        if (response.success) {
          const orderId = response.data.id;

          this.orderService.createPayment({
            orderId,
            paymentMethod: this.selectedPaymentMethod()
          }).subscribe({
            next: (paymentResponse) => {
              if (paymentResponse.success) {
                this.orderService.processPayment(paymentResponse.data.id, 'SIMULATED_' + Date.now()).subscribe({
                  next: () => {
                    this.processing.set(false);
                    this.notificationService.success('Order placed successfully!');
                    this.router.navigate(['/orders', orderId]);
                  },
                  error: () => {
                    this.processing.set(false);
                    this.notificationService.warning('Order placed but payment processing pending');
                    this.router.navigate(['/orders', orderId]);
                  }
                });
              }
            },
            error: () => {
              this.processing.set(false);
              this.notificationService.success('Order placed! Payment pending.');
              this.router.navigate(['/orders', orderId]);
            }
          });
        }
      },
      error: (error) => {
        this.processing.set(false);
        this.notificationService.error(error.error?.message || 'Failed to place order');
      }
    });
  }
}
