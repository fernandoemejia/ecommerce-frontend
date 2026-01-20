import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService, CartService, NotificationService, AuthService } from '@core/services';
import { Product } from '@core/models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    @if (loading()) {
      <div class="loading-container">
        <div class="loading-spinner large"></div>
        <p>Loading product...</p>
      </div>
    } @else if (product()) {
      <div class="product-detail container">
        <nav class="breadcrumb">
          <a routerLink="/products">Products</a>
          <span>/</span>
          @if (product()?.categoryName) {
            <a [routerLink]="['/products']" [queryParams]="{category: product()?.categoryId}">
              {{ product()?.categoryName }}
            </a>
            <span>/</span>
          }
          <span class="current">{{ product()?.name }}</span>
        </nav>

        <div class="product-content">
          <div class="product-gallery">
            <div class="main-image">
              @if (product()?.imageUrl) {
                <img [src]="product()?.imageUrl" [alt]="product()?.name" />
              } @else {
                <div class="placeholder-image">
                  <span class="material-icons">image</span>
                </div>
              }
            </div>
          </div>

          <div class="product-info">
            @if (product()?.featured) {
              <span class="badge badge-primary mb-2">Featured Product</span>
            }

            <h1 class="product-title">{{ product()?.name }}</h1>

            <div class="product-meta">
              @if (product()?.sku) {
                <span class="sku">SKU: {{ product()?.sku }}</span>
              }
              @if (product()?.categoryName) {
                <span class="category">{{ product()?.categoryName }}</span>
              }
            </div>

            <div class="product-price">
              @if (product()?.discountPrice) {
                <span class="original-price">\${{ product()?.price | number:'1.2-2' }}</span>
                <span class="sale-price">\${{ product()?.discountPrice | number:'1.2-2' }}</span>
                <span class="discount-badge">
                  {{ getDiscountPercentage() }}% OFF
                </span>
              } @else {
                <span class="current-price">\${{ product()?.price | number:'1.2-2' }}</span>
              }
            </div>

            <div class="stock-status">
              @if (product()?.inStock) {
                <span class="in-stock">
                  <span class="material-icons">check_circle</span>
                  In Stock ({{ product()?.stockQuantity }} available)
                </span>
              } @else {
                <span class="out-of-stock">
                  <span class="material-icons">cancel</span>
                  Out of Stock
                </span>
              }
            </div>

            @if (product()?.description) {
              <div class="product-description">
                <h3>Description</h3>
                <p>{{ product()?.description }}</p>
              </div>
            }

            @if (product()?.inStock) {
              <div class="purchase-section">
                <div class="quantity-selector">
                  <label>Quantity:</label>
                  <div class="quantity-input">
                    <button
                      class="qty-btn"
                      (click)="decreaseQuantity()"
                      [disabled]="quantity() <= 1"
                    >-</button>
                    <input
                      type="number"
                      [(ngModel)]="quantityValue"
                      [min]="1"
                      [max]="product()?.stockQuantity ?? null"
                      (change)="validateQuantity()"
                    />
                    <button
                      class="qty-btn"
                      (click)="increaseQuantity()"
                      [disabled]="quantity() >= (product()?.stockQuantity || 0)"
                    >+</button>
                  </div>
                </div>

                <button
                  class="btn btn-primary btn-lg add-to-cart-btn"
                  (click)="addToCart()"
                  [disabled]="addingToCart()"
                >
                  @if (addingToCart()) {
                    <span class="loading-spinner"></span>
                    Adding...
                  } @else {
                    <span class="material-icons">add_shopping_cart</span>
                    Add to Cart
                  }
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    } @else {
      <div class="not-found container">
        <span class="material-icons">error_outline</span>
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist or has been removed.</p>
        <a routerLink="/products" class="btn btn-primary">Browse Products</a>
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

    .product-detail {
      padding: 2rem 1rem;
    }

    .breadcrumb {
      display: flex;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: 2rem;
    }

    .breadcrumb a {
      color: var(--text-secondary);
    }

    .breadcrumb a:hover {
      color: var(--primary-color);
    }

    .breadcrumb .current {
      color: var(--text-primary);
    }

    .product-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
    }

    .product-gallery {
      position: sticky;
      top: 100px;
    }

    .main-image {
      background: #f8fafc;
      border-radius: var(--radius-lg);
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .main-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .placeholder-image {
      color: #cbd5e1;
    }

    .placeholder-image .material-icons {
      font-size: 6rem;
    }

    .product-title {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .product-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
    }

    .product-price {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .current-price,
    .sale-price {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .sale-price {
      color: var(--danger-color);
    }

    .original-price {
      font-size: 1.25rem;
      text-decoration: line-through;
      color: var(--text-secondary);
    }

    .discount-badge {
      background: var(--danger-color);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .stock-status {
      margin-bottom: 1.5rem;
    }

    .in-stock,
    .out-of-stock {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
    }

    .in-stock {
      color: var(--success-color);
    }

    .out-of-stock {
      color: var(--danger-color);
    }

    .product-description {
      margin-bottom: 2rem;
    }

    .product-description h3 {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .product-description p {
      color: var(--text-secondary);
      line-height: 1.7;
    }

    .purchase-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .quantity-selector {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .quantity-selector label {
      font-weight: 500;
    }

    .quantity-input {
      display: flex;
      align-items: center;
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
    }

    .qty-btn {
      width: 40px;
      height: 40px;
      border: none;
      background: none;
      font-size: 1.25rem;
      cursor: pointer;
      transition: background 0.2s;
    }

    .qty-btn:hover:not(:disabled) {
      background: var(--background-color);
    }

    .qty-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .quantity-input input {
      width: 60px;
      height: 40px;
      border: none;
      border-left: 1px solid var(--border-color);
      border-right: 1px solid var(--border-color);
      text-align: center;
      font-size: 1rem;
    }

    .quantity-input input:focus {
      outline: none;
    }

    .add-to-cart-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
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

    @media (max-width: 768px) {
      .product-content {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .product-gallery {
        position: static;
      }

      .product-title {
        font-size: 1.5rem;
      }

      .current-price,
      .sale-price {
        font-size: 1.5rem;
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  product = signal<Product | null>(null);
  loading = signal(true);
  addingToCart = signal(false);
  quantity = signal(1);
  quantityValue = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = +params['id'];
      this.loadProduct(productId);
    });
  }

  loadProduct(id: number): void {
    this.loading.set(true);
    this.productService.getProductById(id).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          this.product.set(response.data);
        }
      },
      error: () => {
        this.loading.set(false);
        this.product.set(null);
      }
    });
  }

  getDiscountPercentage(): number {
    const product = this.product();
    if (product?.price && product?.discountPrice) {
      return Math.round((1 - product.discountPrice / product.price) * 100);
    }
    return 0;
  }

  increaseQuantity(): void {
    const max = this.product()?.stockQuantity || 1;
    if (this.quantity() < max) {
      this.quantity.update(q => q + 1);
      this.quantityValue = this.quantity();
    }
  }

  decreaseQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
      this.quantityValue = this.quantity();
    }
  }

  validateQuantity(): void {
    const max = this.product()?.stockQuantity || 1;
    if (this.quantityValue < 1) {
      this.quantityValue = 1;
    } else if (this.quantityValue > max) {
      this.quantityValue = max;
    }
    this.quantity.set(this.quantityValue);
  }

  addToCart(): void {
    if (!this.authService.isAuthenticated()) {
      this.notificationService.warning('Please sign in to add items to cart');
      this.router.navigate(['/auth/login']);
      return;
    }

    const product = this.product();
    if (!product) return;

    this.addingToCart.set(true);
    this.cartService.addToCart({
      productId: product.id,
      quantity: this.quantity()
    }).subscribe({
      next: () => {
        this.addingToCart.set(false);
        this.notificationService.success(`${product.name} added to cart`);
      },
      error: (error) => {
        this.addingToCart.set(false);
        this.notificationService.error(error.error?.message || 'Failed to add item to cart');
      }
    });
  }
}
