export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');

export type PaymentStatus = 'approved' | 'declined';

export interface PaymentRequest {
  amountCents: number;
  currency: 'EUR';
  reference: string;
  card: string;
}

export interface PaymentResult {
  paymentId: string;
  status: PaymentStatus;
}

export interface PaymentGateway {
  charge(request: PaymentRequest): Promise<PaymentResult>;
  refund(paymentId: string, amountCents: number): Promise<void>;
}
