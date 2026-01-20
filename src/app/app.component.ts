import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { AuthService, CartService } from '@core/services';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, NotificationComponent],
  template: `
    <app-header />
    <main class="main-content">
      <router-outlet />
    </main>
    <app-notification />
  `,
  styles: [`
    .main-content {
      min-height: calc(100vh - 64px);
    }
  `]
})
export class AppComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.cartService.loadCart().subscribe();
    }
  }
}
