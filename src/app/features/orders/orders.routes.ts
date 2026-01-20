import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./order-list/order-list.component').then(m => m.OrderListComponent),
    canActivate: [authGuard]
  },
  {
    path: ':id',
    loadComponent: () => import('./order-detail/order-detail.component').then(m => m.OrderDetailComponent),
    canActivate: [authGuard]
  }
];
