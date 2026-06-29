import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { Coupon } from '../../modules/pricing/domain/entities/coupon.entity';
import { User } from '../../modules/pricing/domain/entities/user.entity';
import { startTestApp, truncateAllTables } from '../global/test-utils';
import { App } from 'supertest/types';

describe('Pricing Service Flow (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const testBeans = await startTestApp();
    app = testBeans.app;
    dataSource = testBeans.dataSource;
  }, 300000);

  afterEach(async () => {
    await truncateAllTables(dataSource);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  test('should apply a standard discount successfully', async () => {
    const coupon = new Coupon();
    coupon.code = 'SAVE15';
    coupon.discountAmount = 15;
    coupon.isThirdParty = false;
    coupon.expiryDate = new Date('2030-12-31');
    await dataSource.getRepository(Coupon).save(coupon);

    const user = new User();
    user.id = 'usr_001';
    user.name = 'Test User';
    user.assignedCoupons = [coupon];
    await dataSource.getRepository(User).save(user);

    return request(app.getHttpServer() as App)
      .post('/pricing/apply-discount')
      .send({
        userId: 'usr_001',
        couponCode: 'SAVE15',
        originalSubscriptionPrice: 100,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual({ finalPrice: 85 });
      });
  });

  test('should select correct coupon when user owns multiple valid options', async () => {
    const couponA = new Coupon();
    couponA.code = 'HALF_PRICE';
    couponA.discountAmount = 50;
    couponA.isThirdParty = false;
    couponA.expiryDate = new Date('2030-12-31');

    const couponB = new Coupon();
    couponB.code = 'QUARTER_PRICE';
    couponB.discountAmount = 25;
    couponB.isThirdParty = false;
    couponB.expiryDate = new Date('2030-12-31');

    await dataSource.getRepository(Coupon).save([couponA, couponB]);

    const user = new User();
    user.id = 'usr_multi_coupon';
    user.name = 'Multi Coupon User';
    user.assignedCoupons = [couponA, couponB];
    await dataSource.getRepository(User).save(user);

    return request(app.getHttpServer() as App)
      .post('/pricing/apply-discount')
      .send({
        userId: 'usr_multi_coupon',
        couponCode: 'HALF_PRICE',
        originalSubscriptionPrice: 200,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual({ finalPrice: 150 });
      });
  });

  test('should cap final price to 0 if discount amount matches or exceeds original price', async () => {
    const coupon = new Coupon();
    coupon.code = 'OVERKILL';
    coupon.discountAmount = 250;
    coupon.isThirdParty = false;
    coupon.expiryDate = new Date('2030-12-31');
    await dataSource.getRepository(Coupon).save(coupon);

    const user = new User();
    user.id = 'usr_002';
    user.name = 'Test User Two';
    user.assignedCoupons = [coupon];
    await dataSource.getRepository(User).save(user);

    return request(app.getHttpServer() as App)
      .post('/pricing/apply-discount')
      .send({
        userId: 'usr_002',
        couponCode: 'OVERKILL',
        originalSubscriptionPrice: 150,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual({ finalPrice: 0 });
      });
  });

  test('should bypass discount calculations and return original price if coupon is expired', async () => {
    const expiredCoupon = new Coupon();
    expiredCoupon.code = 'HISTORIC_OFFER';
    expiredCoupon.discountAmount = 40;
    expiredCoupon.isThirdParty = false;
    expiredCoupon.expiryDate = new Date('2021-01-01');
    await dataSource.getRepository(Coupon).save(expiredCoupon);

    const user = new User();
    user.id = 'usr_expired_test';
    user.name = 'Expired Coupon Owner';
    user.assignedCoupons = [expiredCoupon];
    await dataSource.getRepository(User).save(user);

    return request(app.getHttpServer() as App)
      .post('/pricing/apply-discount')
      .send({
        userId: 'usr_expired_test',
        couponCode: 'HISTORIC_OFFER',
        originalSubscriptionPrice: 100,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual({ finalPrice: 100 });
      });
  });

  test('should return a 404 if user does not own coupon or code is invalid', async () => {
    const coupon = new Coupon();
    coupon.code = 'STOLEN50';
    coupon.discountAmount = 50;
    coupon.isThirdParty = false;
    await dataSource.getRepository(Coupon).save(coupon);

    const user = new User();
    user.id = 'usr_001';
    user.name = 'Test User';
    user.assignedCoupons = [];
    await dataSource.getRepository(User).save(user);

    return request(app.getHttpServer() as App)
      .post('/pricing/apply-discount')
      .send({
        userId: 'usr_001',
        couponCode: 'STOLEN50',
        originalSubscriptionPrice: 100,
      })
      .expect(404);
  });

  test('should trigger a 400 Bad Request if client payload structure is corrupted', () => {
    return request(app.getHttpServer() as App)
      .post('/pricing/apply-discount')
      .send({
        userId: 'usr_invalid_price',
        couponCode: 'BAD_DATA_TEST',
        originalSubscriptionPrice: -50.25,
      })
      .expect(400);
  });
});
