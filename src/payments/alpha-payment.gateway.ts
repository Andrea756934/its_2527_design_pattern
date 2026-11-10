import { AlphaPayClient, AlphaTimeoutError } from '../../vendor/alpha-pay';
import type { PaymentGateway, PaymentRequest, PaymentResult } from './payment-gateway';

export class AlphaPaymentGateway implements PaymentGateway {
  constructor(private readonly apiKey: string) {}

  async charge(request: PaymentRequest): Promise<PaymentResult> {
    const alpha = new AlphaPayClient(this.apiKey);
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`[alpha] addebito tentativo ${attempt} ${request.reference} ${request.amountCents / 100}`);
        const charge = await alpha.charge({
          amountCents: request.amountCents,
          currency: request.currency,
          reference: request.reference,
          card: request.card,
        });
        console.log(`[alpha] esito ${charge.status} ${charge.chargeId}`);
        return {
          paymentId: charge.chargeId,
          status: charge.status === 'succeeded' ? 'approved' : 'declined',
        };
      } catch (err) {
        if (err instanceof AlphaTimeoutError && attempt < 3) {
          console.log('[alpha] timeout, riprovo');
          continue;
        }
        throw err;
      }
    }
    throw new AlphaTimeoutError();
  }

  async refund(paymentId: string, amountCents: number): Promise<void> {
    const alpha = new AlphaPayClient(this.apiKey);
    let done = false;
    for (let attempt = 1; attempt <= 2 && !done; attempt++) {
      try {
        console.log(`[alpha] rimborso tentativo ${attempt} ${paymentId}`);
        await alpha.refund(paymentId, amountCents);
        done = true;
      } catch (err) {
        if (err instanceof AlphaTimeoutError) {
          console.log('[alpha] timeout rimborso');
          continue;
        }
        throw err;
      }
    }
    if (!done) throw new AlphaTimeoutError();
  }
}
