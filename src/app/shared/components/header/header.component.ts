import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, CartService } from '@core/services';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <div class="header-container">
        <a routerLink="/" class="logo">
          <span class="material-icons">store</span>
          <span class="logo-text">E-Store</span>
        </a>

        <nav class="nav-menu">
          <a routerLink="/products" routerLinkActive="active">Products</a>
          @if (authService.isAuthenticated()) {
            <a routerLink="/orders" routerLinkActive="active">My Orders</a>
          }
        </nav>

        <div class="header-actions">
          @if (authService.isAuthenticated()) {
            <a routerLink="/cart" class="cart-link" routerLinkActive="active">
              <span class="material-icons">shopping_cart</span>
              @if (cartItemCount() > 0) {
                <span class="cart-badge">{{ cartItemCount() }}</span>
              }
            </a>

            <div class="user-menu">
              <button class="user-btn" (click)="toggleUserMenu()">
                <span class="material-icons">account_circle</span>
                <span class="user-name">{{ authService.currentUser()?.firstName || authService.currentUser()?.username }}</span>
                <span class="material-icons dropdown-icon">expand_more</span>
              </button>

              @if (showUserMenu) {
                <div class="dropdown-menu">
                  <div class="dropdown-header">
                    <span class="user-email">{{ authService.currentUser()?.email }}</span>
                    <span class="user-role badge badge-primary">{{ authService.currentUser()?.role }}</span>
                  </div>
                  <a routerLink="/orders" class="dropdown-item" (click)="closeUserMenu()">
                    <span class="material-icons">receipt_long</span>
                    My Orders
                  </a>
                  <hr class="dropdown-divider" />
                  <button class="dropdown-item logout" (click)="logout()">
                    <span class="material-icons">logout</span>
                    Sign Out
                  </button>
                </div>
              }
            </div>
          } @else {
            <a routerLink="/auth/login" class="btn btn-outline btn-sm">Sign In</a>
            <a routerLink="/auth/register" class="btn btn-primary btn-sm">Sign Up</a>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: var(--card-background);
      box-shadow: var(--shadow);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 1rem;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-primary);
      font-weight: 700;
      font-size: 1.25rem;
    }

    .logo .material-icons {
      color: var(--primary-color);
    }

    .nav-menu {
      display: flex;
      gap: 2rem;
    }

    .nav-menu a {
      color: var(--text-secondary);
      font-weight: 500;
      transition: color 0.2s;
    }

    .nav-menu a:hover,
    .nav-menu a.active {
      color: var(--primary-color);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .cart-link {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      color: var(--text-secondary);
      border-radius: var(--radius);
      transition: all 0.2s;
    }

    .cart-link:hover,
    .cart-link.active {
      background: var(--background-color);
      color: var(--primary-color);
    }

    .cart-badge {
      position: absolute;
      top: 0;
      right: 0;
      min-width: 18px;
      height: 18px;
      background: var(--primary-color);
      color: white;
      font-size: 0.7rem;
      font-weight: 600;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .user-menu {
      position: relative;
    }

    .user-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: none;
      border: none;
      padding: 0.5rem;
      color: var(--text-primary);
      cursor: pointer;
      border-radius: var(--radius);
      transition: background 0.2s;
    }

    .user-btn:hover {
      background: var(--background-color);
    }

    .user-name {
      font-weight: 500;
    }

    .dropdown-icon {
      font-size: 1.25rem;
      color: var(--text-secondary);
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      min-width: 220px;
      background: var(--card-background);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      padding: 0.5rem;
      z-index: 1000;
    }

    .dropdown-header {
      padding: 0.75rem;
      border-bottom: 1px solid var(--border-color);
      margin-bottom: 0.5rem;
    }

    .user-email {
      display: block;
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: 0.25rem;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      color: var(--text-primary);
      border-radius: var(--radius);
      transition: background 0.2s;
      width: 100%;
      border: none;
      background: none;
      text-align: left;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .dropdown-item:hover {
      background: var(--background-color);
    }

    .dropdown-item .material-icons {
      font-size: 1.25rem;
      color: var(--text-secondary);
    }

    .dropdown-item.logout {
      color: var(--danger-color);
    }

    .dropdown-item.logout .material-icons {
      color: var(--danger-color);
    }

    .dropdown-divider {
      border: none;
      border-top: 1px solid var(--border-color);
      margin: 0.5rem 0;
    }

    @media (max-width: 768px) {
      .nav-menu {
        display: none;
      }

      .user-name {
        display: none;
      }
    }
  `]
})
export class HeaderComponent {
  authService = inject(AuthService);
  private cartService = inject(CartService);

  showUserMenu = false;
  cartItemCount = this.cartService.cartItemCount;

  constructor() {}

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  logout(): void {
    this.closeUserMenu();
    this.cartService.resetCartState();
    this.authService.logout();
  }
}
