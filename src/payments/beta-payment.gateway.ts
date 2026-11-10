import { BetaPayments } from '../../vendor/beta-pay';
import type { PaymentGateway, PaymentRequest, PaymentResult } from './payment-gateway';

export class BetaPaymentGateway implements PaymentGateway {
  constructor(private readonly merchantId: string) {}

  async charge(request: PaymentRequest): Promise<PaymentResult> {
    const beta = new BetaPayments(this.merchantId);
    console.log(`[beta] addebito ${request.reference} ${this.amount(request.amountCents)}`);
    const payment = await beta.createPayment({
      amount: this.amount(request.amountCents),
      currencyCode: request.currency,
      orderRef: request.reference,
      cardToken: request.card,
    });
    console.log(`[beta] esito ${payment.outcome} ${payment.id}`);
    return {
      paymentId: payment.id,
      status: payment.outcome === 'APPROVED' ? 'approved' : 'declined',
    };
  }

  async refund(paymentId: string, amountCents: number): Promise<void> {
    const beta = new BetaPayments(this.merchantId);
    console.log(`[beta] rimborso ${paymentId}`);
    await beta.reverse(paymentId, { amount: this.amount(amountCents) });
  }

  private amount(cents: number): string {
    return (cents / 100).toFixed(2);
  }
}
