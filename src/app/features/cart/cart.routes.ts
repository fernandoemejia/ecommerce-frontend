import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const CART_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./cart.component').then(m => m.CartComponent),
    canActivate: [authGuard]
  }
];

export const CHECKOUT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./checkout/checkout.component').then(m => m.CheckoutComponent),
    canActivate: [authGuard]
  }
];
