import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  // Success Cases

  it('should apply a standard discount successfully', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return request(app.getHttpServer())
      .post('/pricing/apply-discount')
      .send({
        user: { id: 'usr_001', assignedCouponCodes: ['SAVE15'] },
        coupon: {
          code: 'SAVE15',
          discountAmount: 15,
          expiryDate: tomorrow,
          isThirdParty: false,
        },
        originalSubscriptionPrice: 100,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual({ finalPrice: 85 });
      });
  });

  it('should cap final price to 0 if discount exceeds original price', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return request(app.getHttpServer())
      .post('/pricing/apply-discount')
      .send({
        user: { id: 'usr_001', assignedCouponCodes: ['MEGA100'] },
        coupon: {
          code: 'MEGA100',
          discountAmount: 500,
          expiryDate: tomorrow,
          isThirdParty: false,
        },
        originalSubscriptionPrice: 50,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual({ finalPrice: 0 });
      });
  });

  // Reject Cases

  it('should return original price unchanged if user does not own coupon', () => {
    return request(app.getHttpServer())
      .post('/pricing/apply-discount')
      .send({
        user: { id: 'usr_001', assignedCouponCodes: ['WELCOME5'] },
        coupon: { code: 'STOLEN50', discountAmount: 50, isThirdParty: false },
        originalSubscriptionPrice: 100,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual({ finalPrice: 100 });
      });
  });

  it('should return original price unchanged if coupon is expired', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    return request(app.getHttpServer())
      .post('/pricing/apply-discount')
      .send({
        user: { id: 'usr_001', assignedCouponCodes: ['EXPIRED20'] },
        coupon: {
          code: 'EXPIRED20',
          discountAmount: 20,
          expiryDate: yesterday,
          isThirdParty: false,
        },
        originalSubscriptionPrice: 100,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual({ finalPrice: 100 });
      });
  });

  // Fail Cases

  it('should trigger a 400 Bad Request if validation rules fail (Negative price)', () => {
    return request(app.getHttpServer())
      .post('/pricing/apply-discount')
      .send({
        user: { id: 'usr_001', assignedCouponCodes: ['SAVE15'] },
        coupon: { code: 'SAVE15', discountAmount: 15, isThirdParty: false },
        originalSubscriptionPrice: -20,
      })
      .expect(400);
  });

  afterEach(async () => {
    await app.close();
  });
});
