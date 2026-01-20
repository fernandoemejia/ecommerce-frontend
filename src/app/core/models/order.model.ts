export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productSku?: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  totalPrice: number;
}

export interface Payment {
  id: number;
  transactionId: string;
  orderId: number;
  orderNumber?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paymentProvider?: string;
  providerReference?: string;
  failureReason?: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  refundedAt?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  userEmail?: string;
  orderItems: OrderItem[];
  payment?: Payment;
  status: OrderStatus;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  shippingAddress: string;
  billingAddress?: string;
  notes?: string;
  trackingNumber?: string;
  totalItems: number;
  createdAt: string;
  updatedAt: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface CreateOrderRequest {
  items?: OrderItemRequest[];
  shippingAddress: string;
  billingAddress?: string;
  notes?: string;
}

export interface OrderItemRequest {
  productId: number;
  quantity: number;
}

export interface CreatePaymentRequest {
  orderId: number;
  paymentMethod: PaymentMethod;
  paymentProvider?: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentMethod =
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'PAYPAL'
  | 'BANK_TRANSFER'
  | 'CASH_ON_DELIVERY'
  | 'CRYPTO';

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED'
  | 'CANCELLED';
