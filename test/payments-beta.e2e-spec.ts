import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApp } from './helpers';

const BETA_OK = 'tok_ok';
const BETA_REFUSE = 'tok_refuse';

describe('Pagamenti con BetaPayments', () => {
  let app: INestApplication;
  let previousProvider: string | undefined;

  beforeEach(async () => {
    previousProvider = process.env.PAYMENT_PROVIDER;
    process.env.PAYMENT_PROVIDER = 'beta';
    app = await createApp();
  });

  afterEach(async () => {
    await app.close();
    if (previousProvider === undefined) {
      delete process.env.PAYMENT_PROVIDER;
    } else {
      process.env.PAYMENT_PROVIDER = previousProvider;
    }
  });

  function buy(body: Record<string, unknown>) {
    return request(app.getHttpServer())
      .post('/orders')
      .send({ card: BETA_OK, holderName: 'Giulia Rossi', email: 'giulia@example.com', ...body });
  }

  it('vende un posto in PLATEA con BetaPayments e registra il paymentId', async () => {
    const res = await buy({ eventId: 'e-2', seats: [{ seatId: 'PLATEA-1-1' }] }).expect(201);
    expect(res.body.order.total).toBe(50.4);
    expect(res.body.order.status).toBe('paid');
    expect(res.body.order.paymentId).toMatch(/^BP-/);
  });

  it('risponde 402 con tok_refuse e lascia il posto libero', async () => {
    await buy({ eventId: 'e-2', seats: [{ seatId: 'PLATEA-1-2' }], card: BETA_REFUSE }).expect(402);
    await buy({ eventId: 'e-2', seats: [{ seatId: 'PLATEA-1-2' }] }).expect(201);
  });

  it('annulla un ordine pagato con Beta e lo porta a refunded', async () => {
    const bought = await buy({ eventId: 'e-2', seats: [{ seatId: 'PLATEA-1-3' }] }).expect(201);
    const orderId = bought.body.order.id;

    const cancelled = await request(app.getHttpServer()).post(`/orders/${orderId}/cancel`).expect(201);
    expect(cancelled.body.order.status).toBe('refunded');

    await buy({ eventId: 'e-2', seats: [{ seatId: 'PLATEA-1-3' }] }).expect(201);
  });
});
