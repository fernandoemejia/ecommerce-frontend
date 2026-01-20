import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse, Cart, AddToCartRequest, UpdateCartItemRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly apiUrl = `${environment.apiUrl}/cart`;

  private cartState = signal<Cart | null>(null);

  readonly cart = computed(() => this.cartState());
  readonly cartItems = computed(() => this.cartState()?.items ?? []);
  readonly cartTotal = computed(() => this.cartState()?.totalAmount ?? 0);
  readonly cartItemCount = computed(() => this.cartState()?.totalItems ?? 0);
  readonly isEmpty = computed(() => this.cartState()?.items.length === 0);

  constructor(private http: HttpClient) {}

  loadCart(): Observable<ApiResponse<Cart>> {
    return this.http.get<ApiResponse<Cart>>(this.apiUrl).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.cartState.set(response.data);
        }
      })
    );
  }

  addToCart(request: AddToCartRequest): Observable<ApiResponse<Cart>> {
    return this.http.post<ApiResponse<Cart>>(`${this.apiUrl}/items`, request).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.cartState.set(response.data);
        }
      })
    );
  }

  updateQuantity(productId: number, request: UpdateCartItemRequest): Observable<ApiResponse<Cart>> {
    return this.http.put<ApiResponse<Cart>>(`${this.apiUrl}/items/${productId}`, request).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.cartState.set(response.data);
        }
      })
    );
  }

  removeFromCart(productId: number): Observable<ApiResponse<Cart>> {
    return this.http.delete<ApiResponse<Cart>>(`${this.apiUrl}/items/${productId}`).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.cartState.set(response.data);
        }
      })
    );
  }

  clearCart(): Observable<ApiResponse<Cart>> {
    return this.http.delete<ApiResponse<Cart>>(this.apiUrl).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.cartState.set(response.data);
        }
      })
    );
  }

  resetCartState(): void {
    this.cartState.set(null);
  }
}
