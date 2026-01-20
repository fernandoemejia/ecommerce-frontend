import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse, User, LoginRequest, LoginResponse, RegisterRequest, AuthState } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  private authState = signal<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false
  });

  readonly currentUser = computed(() => this.authState().user);
  readonly isAuthenticated = computed(() => this.authState().isAuthenticated);
  readonly isAdmin = computed(() => this.authState().user?.role === 'ADMIN');
  readonly isSeller = computed(() => this.authState().user?.role === 'SELLER');
  readonly token = computed(() => this.authState().token);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userJson = localStorage.getItem(this.USER_KEY);

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as User;
        this.authState.set({
          user,
          token,
          isAuthenticated: true
        });
      } catch {
        this.clearAuth();
      }
    }
  }

  login(credentials: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setAuth(response.data.token, response.data.user);
        }
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  register(data: RegisterRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.apiUrl}/register`, data);
  }

  logout(): void {
    this.clearAuth();
    this.router.navigate(['/auth/login']);
  }

  getCurrentUser(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/me`).pipe(
      tap(response => {
        if (response.success && response.data) {
          const token = this.authState().token;
          if (token) {
            this.setAuth(token, response.data);
          }
        }
      })
    );
  }

  private setAuth(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.authState.set({
      user,
      token,
      isAuthenticated: true
    });
  }

  private clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.authState.set({
      user: null,
      token: null,
      isAuthenticated: false
    });
  }

  getToken(): string | null {
    return this.authState().token;
  }
}
