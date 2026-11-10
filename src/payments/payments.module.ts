import { Module } from '@nestjs/common';
import { AlphaWebhookController } from './alpha-webhook.controller';
import { AlphaPaymentGateway } from './alpha-payment.gateway';
import { BetaPaymentGateway } from './beta-payment.gateway';
import { PAYMENT_GATEWAY } from './payment-gateway';

@Module({
  controllers: [AlphaWebhookController],
  providers: [
    {
      provide: PAYMENT_GATEWAY,
      useFactory: () => {
        const provider = process.env.PAYMENT_PROVIDER ?? 'alpha';
        if (provider === 'alpha') {
          return new AlphaPaymentGateway(process.env.ALPHA_API_KEY ?? 'sk_test_tickethub');
        }
        if (provider === 'beta') {
          return new BetaPaymentGateway(process.env.BETA_MERCHANT_ID ?? 'tickethub');
        }
        throw new Error(`PAYMENT_PROVIDER non valido: ${provider}`);
      },
    },
  ],
  exports: [PAYMENT_GATEWAY],
})
export class PaymentsModule {}
