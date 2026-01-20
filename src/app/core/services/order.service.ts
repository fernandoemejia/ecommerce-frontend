import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse, PageResponse, Order, CreateOrderRequest, CreatePaymentRequest, Payment } from '../models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly ordersUrl = `${environment.apiUrl}/orders`;
  private readonly paymentsUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  getMyOrders(page = 0, size = 20): Observable<ApiResponse<PageResponse<Order>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<PageResponse<Order>>>(`${this.ordersUrl}/my-orders`, { params });
  }

  getOrderById(id: number): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.ordersUrl}/${id}`);
  }

  getOrderByNumber(orderNumber: string): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.ordersUrl}/number/${orderNumber}`);
  }

  checkout(request: CreateOrderRequest): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(`${this.ordersUrl}/checkout`, request);
  }

  createOrder(request: CreateOrderRequest): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(this.ordersUrl, request);
  }

  cancelOrder(orderId: number): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(`${this.ordersUrl}/${orderId}/cancel`, {});
  }

  createPayment(request: CreatePaymentRequest): Observable<ApiResponse<Payment>> {
    return this.http.post<ApiResponse<Payment>>(this.paymentsUrl, request);
  }

  processPayment(paymentId: number, providerReference?: string): Observable<ApiResponse<Payment>> {
    return this.http.post<ApiResponse<Payment>>(`${this.paymentsUrl}/${paymentId}/process`, {
      providerReference
    });
  }

  getPaymentByOrderId(orderId: number): Observable<ApiResponse<Payment>> {
    return this.http.get<ApiResponse<Payment>>(`${this.paymentsUrl}/order/${orderId}`);
  }
}
