import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService, CartService, NotificationService, AuthService } from '@core/services';
import { Product, Category } from '@core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-page">
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-content">
          <h1>Welcome to E-Store</h1>
          <p>Discover amazing products at great prices</p>
          <a routerLink="/products" class="btn btn-primary btn-lg">Shop Now</a>
        </div>
      </section>

      <!-- Categories Section -->
      <section class="section container">
        <div class="section-header">
          <h2>Shop by Category</h2>
          <a routerLink="/products" class="view-all">View All</a>
        </div>
        <div class="categories-grid grid grid-cols-4">
          @for (category of categories(); track category.id) {
            <a [routerLink]="['/products']" [queryParams]="{category: category.id}" class="category-card card">
              <div class="category-icon">
                <span class="material-icons">category</span>
              </div>
              <h3>{{ category.name }}</h3>
              <p>{{ category.description }}</p>
            </a>
          }
        </div>
      </section>

      <!-- Featured Products Section -->
      <section class="section container">
        <div class="section-header">
          <h2>Featured Products</h2>
          <a routerLink="/products" class="view-all">View All</a>
        </div>

        @if (loadingProducts()) {
          <div class="loading-container">
            <div class="loading-spinner large"></div>
          </div>
        } @else {
          <div class="products-grid grid grid-cols-4">
            @for (product of featuredProducts(); track product.id) {
              <div class="product-card card">
                <div class="product-image">
                  @if (product.imageUrl) {
                    <img [src]="product.imageUrl" [alt]="product.name" />
                  } @else {
                    <div class="placeholder-image">
                      <span class="material-icons">image</span>
                    </div>
                  }
                  <span class="badge badge-primary featured-badge">Featured</span>
                </div>
                <div class="product-info">
                  <a [routerLink]="['/products', product.id]" class="product-name">
                    {{ product.name }}
                  </a>
                  <p class="product-category">{{ product.categoryName }}</p>
                  <div class="product-price">
                    @if (product.discountPrice) {
                      <span class="original-price">\${{ product.price | number:'1.2-2' }}</span>
                      <span class="sale-price">\${{ product.discountPrice | number:'1.2-2' }}</span>
                    } @else {
                      <span class="current-price">\${{ product.price | number:'1.2-2' }}</span>
                    }
                  </div>
                  <div class="product-actions">
                    @if (product.inStock) {
                      <button
                        class="btn btn-primary btn-sm"
                        (click)="addToCart(product)"
                        [disabled]="addingToCart() === product.id"
                      >
                        @if (addingToCart() === product.id) {
                          <span class="loading-spinner"></span>
                        } @else {
                          <span class="material-icons">add_shopping_cart</span>
                        }
                        Add to Cart
                      </button>
                    } @else {
                      <span class="out-of-stock">Out of Stock</span>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <div class="cta-content container">
          <h2>Join Our Newsletter</h2>
          <p>Get the latest updates on new products and special offers</p>
          <div class="cta-form">
            <input type="email" class="form-input" placeholder="Enter your email" />
            <button class="btn btn-primary">Subscribe</button>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .hero {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 6rem 1rem;
      text-align: center;
    }

    .hero-content h1 {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }

    .hero-content p {
      font-size: 1.25rem;
      opacity: 0.9;
      margin-bottom: 2rem;
    }

    .section {
      padding: 4rem 1rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .section-header h2 {
      font-size: 1.75rem;
      font-weight: 700;
    }

    .view-all {
      color: var(--primary-color);
      font-weight: 500;
    }

    .categories-grid {
      gap: 1.5rem;
    }

    .category-card {
      padding: 1.5rem;
      text-align: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .category-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .category-icon {
      width: 60px;
      height: 60px;
      background: rgba(59, 130, 246, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
    }

    .category-icon .material-icons {
      font-size: 1.75rem;
      color: var(--primary-color);
    }

    .category-card h3 {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--text-primary);
    }

    .category-card p {
      font-size: 0.875rem;
      color: var(--text-secondary);
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
      margin: 0 auto;
    }

    .product-card {
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .product-image {
      position: relative;
      aspect-ratio: 1;
      background: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .placeholder-image {
      color: #cbd5e1;
    }

    .placeholder-image .material-icons {
      font-size: 3rem;
    }

    .featured-badge {
      position: absolute;
      top: 0.5rem;
      left: 0.5rem;
    }

    .product-info {
      padding: 1rem;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .product-name {
      font-weight: 600;
      color: var(--text-primary);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-bottom: 0.25rem;
    }

    .product-category {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
    }

    .product-price {
      margin-bottom: 1rem;
    }

    .current-price,
    .sale-price {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .sale-price {
      color: var(--danger-color);
    }

    .original-price {
      text-decoration: line-through;
      color: var(--text-secondary);
      font-size: 0.875rem;
      margin-right: 0.5rem;
    }

    .product-actions {
      margin-top: auto;
    }

    .product-actions .btn {
      width: 100%;
    }

    .out-of-stock {
      display: block;
      text-align: center;
      padding: 0.5rem;
      color: var(--danger-color);
      font-weight: 500;
    }

    .cta-section {
      background: var(--background-color);
      padding: 4rem 1rem;
      text-align: center;
    }

    .cta-content h2 {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .cta-content p {
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
    }

    .cta-form {
      display: flex;
      gap: 0.5rem;
      max-width: 400px;
      margin: 0 auto;
    }

    .cta-form .form-input {
      flex: 1;
    }

    @media (max-width: 768px) {
      .hero-content h1 {
        font-size: 2rem;
      }

      .cta-form {
        flex-direction: column;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  categories = signal<Category[]>([]);
  featuredProducts = signal<Product[]>([]);
  loadingProducts = signal(true);
  addingToCart = signal<number | null>(null);

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadFeaturedProducts();
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (response) => {
        if (response.success) {
          this.categories.set(response.data.slice(0, 4));
        }
      }
    });
  }

  loadFeaturedProducts(): void {
    this.loadingProducts.set(true);
    this.productService.getFeaturedProducts().subscribe({
      next: (response) => {
        this.loadingProducts.set(false);
        if (response.success) {
          this.featuredProducts.set(response.data);
        }
      },
      error: () => this.loadingProducts.set(false)
    });
  }

  addToCart(product: Product): void {
    if (!this.authService.isAuthenticated()) {
      this.notificationService.warning('Please sign in to add items to cart');
      return;
    }

    this.addingToCart.set(product.id);
    this.cartService.addToCart({ productId: product.id, quantity: 1 }).subscribe({
      next: () => {
        this.addingToCart.set(null);
        this.notificationService.success(`${product.name} added to cart`);
      },
      error: () => {
        this.addingToCart.set(null);
        this.notificationService.error('Failed to add item to cart');
      }
    });
  }
}
