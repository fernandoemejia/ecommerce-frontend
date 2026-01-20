import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService, CartService, NotificationService, AuthService } from '@core/services';
import { Product, Category, PageResponse } from '@core/models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="products-page">
      <aside class="filters-sidebar">
        <div class="filter-section">
          <h3>Categories</h3>
          <ul class="category-list">
            <li>
              <a
                (click)="selectCategory(null)"
                [class.active]="!selectedCategoryId()"
              >
                All Products
              </a>
            </li>
            @for (category of categories(); track category.id) {
              <li>
                <a
                  (click)="selectCategory(category.id)"
                  [class.active]="selectedCategoryId() === category.id"
                >
                  {{ category.name }}
                </a>
              </li>
            }
          </ul>
        </div>

        <div class="filter-section">
          <h3>Search</h3>
          <input
            type="text"
            class="form-input"
            placeholder="Search products..."
            [(ngModel)]="searchKeyword"
            (keyup.enter)="searchProducts()"
          />
          <button class="btn btn-primary btn-sm mt-2" (click)="searchProducts()">Search</button>
        </div>
      </aside>

      <main class="products-main">
        <div class="products-header">
          <h1 class="page-title">
            @if (selectedCategoryId()) {
              {{ getCategoryName() }}
            } @else if (searchKeyword) {
              Search: "{{ searchKeyword }}"
            } @else {
              All Products
            }
          </h1>
          <p class="results-count">{{ totalProducts() }} products found</p>
        </div>

        @if (loading()) {
          <div class="loading-container">
            <div class="loading-spinner large"></div>
            <p>Loading products...</p>
          </div>
        } @else if (products().length === 0) {
          <div class="empty-state">
            <span class="material-icons">inventory_2</span>
            <h2>No products found</h2>
            <p>Try adjusting your filters or search terms</p>
          </div>
        } @else {
          <div class="products-grid grid grid-cols-4">
            @for (product of products(); track product.id) {
              <div class="product-card card">
                <div class="product-image">
                  @if (product.imageUrl) {
                    <img [src]="product.imageUrl" [alt]="product.name" />
                  } @else {
                    <div class="placeholder-image">
                      <span class="material-icons">image</span>
                    </div>
                  }
                  @if (product.featured) {
                    <span class="badge badge-primary featured-badge">Featured</span>
                  }
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
      </main>
    </div>
  `,
  styles: [`
    .products-page {
      display: grid;
      grid-template-columns: 250px 1fr;
      gap: 2rem;
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .filters-sidebar {
      position: sticky;
      top: 80px;
      height: fit-content;
    }

    .filter-section {
      background: var(--card-background);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      margin-bottom: 1rem;
      box-shadow: var(--shadow);
    }

    .filter-section h3 {
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
      margin-bottom: 1rem;
    }

    .category-list {
      list-style: none;
    }

    .category-list li a {
      display: block;
      padding: 0.5rem 0;
      color: var(--text-primary);
      cursor: pointer;
      transition: color 0.2s;
    }

    .category-list li a:hover,
    .category-list li a.active {
      color: var(--primary-color);
    }

    .category-list li a.active {
      font-weight: 500;
    }

    .products-header {
      margin-bottom: 2rem;
    }

    .results-count {
      color: var(--text-secondary);
      margin-top: 0.25rem;
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
      padding: 4rem;
      color: var(--text-secondary);
    }

    .empty-state .material-icons {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
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

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;
      padding: 1rem;
    }

    .page-info {
      color: var(--text-secondary);
    }

    @media (max-width: 1024px) {
      .products-page {
        grid-template-columns: 1fr;
      }

      .filters-sidebar {
        position: static;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }
    }

    @media (max-width: 640px) {
      .filters-sidebar {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProductListComponent implements OnInit {
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  addingToCart = signal<number | null>(null);
  selectedCategoryId = signal<number | null>(null);
  currentPage = signal(0);
  totalPages = signal(0);
  totalProducts = signal(0);
  searchKeyword = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCategories();

    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategoryId.set(+params['category']);
      }
      if (params['search']) {
        this.searchKeyword = params['search'];
      }
      this.loadProducts();
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (response) => {
        if (response.success) {
          this.categories.set(response.data);
        }
      }
    });
  }

  loadProducts(): void {
    this.loading.set(true);

    const categoryId = this.selectedCategoryId();

    if (this.searchKeyword) {
      this.productService.searchProducts(this.searchKeyword, this.currentPage()).subscribe({
        next: (response) => this.handleProductsResponse(response),
        error: () => this.loading.set(false)
      });
    } else if (categoryId) {
      this.productService.getProductsByCategory(categoryId, this.currentPage()).subscribe({
        next: (response) => this.handleProductsResponse(response),
        error: () => this.loading.set(false)
      });
    } else {
      this.productService.getProducts(this.currentPage()).subscribe({
        next: (response) => this.handleProductsResponse(response),
        error: () => this.loading.set(false)
      });
    }
  }

  private handleProductsResponse(response: any): void {
    this.loading.set(false);
    if (response.success && response.data) {
      this.products.set(response.data.content);
      this.totalPages.set(response.data.totalPages);
      this.totalProducts.set(response.data.totalElements);
    }
  }

  selectCategory(categoryId: number | null): void {
    this.selectedCategoryId.set(categoryId);
    this.searchKeyword = '';
    this.currentPage.set(0);
    this.loadProducts();
  }

  searchProducts(): void {
    this.selectedCategoryId.set(null);
    this.currentPage.set(0);
    this.loadProducts();
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadProducts();
  }

  getCategoryName(): string {
    const category = this.categories().find(c => c.id === this.selectedCategoryId());
    return category?.name || '';
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
