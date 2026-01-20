import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, NotificationService } from '@core/services';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card card">
        <div class="auth-header">
          <h1>Create Account</h1>
          <p>Join us and start shopping</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
          @if (errorMessage()) {
            <div class="alert alert-error">{{ errorMessage() }}</div>
          }

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                class="form-input"
                formControlName="firstName"
                placeholder="First name"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                class="form-input"
                formControlName="lastName"
                placeholder="Last name"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="username">Username</label>
            <input
              type="text"
              id="username"
              class="form-input"
              [class.error]="isFieldInvalid('username')"
              formControlName="username"
              placeholder="Choose a username"
            />
            @if (isFieldInvalid('username')) {
              <span class="form-error">Username must be at least 3 characters</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label" for="email">Email</label>
            <input
              type="email"
              id="email"
              class="form-input"
              [class.error]="isFieldInvalid('email')"
              formControlName="email"
              placeholder="Enter your email"
            />
            @if (isFieldInvalid('email')) {
              <span class="form-error">Please enter a valid email</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input
              type="password"
              id="password"
              class="form-input"
              [class.error]="isFieldInvalid('password')"
              formControlName="password"
              placeholder="Create a password"
            />
            @if (isFieldInvalid('password')) {
              <span class="form-error">Password must be at least 8 characters</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label" for="phone">Phone (Optional)</label>
            <input
              type="tel"
              id="phone"
              class="form-input"
              formControlName="phone"
              placeholder="Phone number"
            />
          </div>

          <button type="submit" class="btn btn-primary btn-lg btn-block" [disabled]="loading()">
            @if (loading()) {
              <span class="loading-spinner"></span>
              Creating account...
            } @else {
              Create Account
            }
          </button>
        </form>

        <div class="auth-footer">
          <p>Already have an account? <a routerLink="/auth/login">Sign in</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .auth-card {
      width: 100%;
      max-width: 480px;
      padding: 2.5rem;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .auth-header h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .auth-header p {
      color: var(--text-secondary);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .auth-form {
      margin-bottom: 1.5rem;
    }

    .btn-block {
      width: 100%;
    }

    .auth-footer {
      text-align: center;
      color: var(--text-secondary);
    }

    .auth-footer a {
      font-weight: 500;
    }

    @media (max-width: 480px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      phone: ['']
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.registerForm.get(field);
    return control ? control.invalid && control.touched : false;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          this.notificationService.success('Account created successfully! Please sign in.');
          this.router.navigate(['/auth/login']);
        }
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(error.error?.message || 'Registration failed. Please try again.');
      }
    });
  }
}
