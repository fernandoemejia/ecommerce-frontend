import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse, PageResponse, Product, Category } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = `${environment.apiUrl}/products`;
  private readonly categoriesUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  getProducts(page = 0, size = 20): Observable<ApiResponse<PageResponse<Product>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<PageResponse<Product>>>(this.apiUrl, { params });
  }

  getProductById(id: number): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.apiUrl}/${id}`);
  }

  getProductsByCategory(categoryId: number, page = 0, size = 20): Observable<ApiResponse<PageResponse<Product>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<PageResponse<Product>>>(`${this.apiUrl}/category/${categoryId}`, { params });
  }

  getFeaturedProducts(): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/featured`);
  }

  searchProducts(keyword: string, page = 0, size = 20): Observable<ApiResponse<PageResponse<Product>>> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<PageResponse<Product>>>(`${this.apiUrl}/search`, { params });
  }

  getProductsByPriceRange(minPrice: number, maxPrice: number, page = 0, size = 20): Observable<ApiResponse<PageResponse<Product>>> {
    const params = new HttpParams()
      .set('minPrice', minPrice.toString())
      .set('maxPrice', maxPrice.toString())
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<PageResponse<Product>>>(`${this.apiUrl}/price-range`, { params });
  }

  getCategories(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(this.categoriesUrl);
  }

  getCategoryById(id: number): Observable<ApiResponse<Category>> {
    return this.http.get<ApiResponse<Category>>(`${this.categoriesUrl}/${id}`);
  }

  getRootCategories(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(`${this.categoriesUrl}/root`);
  }
}
