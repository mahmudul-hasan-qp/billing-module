import { Test, TestingModule } from '@nestjs/testing';
import { Coupon, User } from '../../types';
import { StandardCouponStrategy } from '../standard-coupon.strategy';

describe('StandardCouponStrategy', () => {
  let strategy: StandardCouponStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StandardCouponStrategy],
    }).compile();

    strategy = module.get<StandardCouponStrategy>(StandardCouponStrategy);
  });

  it('should only handle coupons that are NOT third-party', () => {
    const coupon = { isThirdParty: false } as Coupon;
    expect(strategy.canApply(coupon)).toBe(true);
  });

  it('should successfully calculate the discounted price', async () => {
    const user: User = { id: 'usr_1', assignedCouponCodes: ['SAVE20'] };
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2);

    const coupon: Coupon = {
      code: 'SAVE20',
      discountAmount: 20,
      expiryDate: futureDate,
      isThirdParty: false,
    };

    const result = await strategy.calculate(user, coupon, 100);
    expect(result).toBe(80);
  });

  it('should return full price if the coupon is expired', async () => {
    const user: User = { id: 'usr_1', assignedCouponCodes: ['OLD20'] };
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 2);

    const coupon: Coupon = {
      code: 'OLD20',
      discountAmount: 20,
      expiryDate: pastDate,
      isThirdParty: false,
    };

    const result = await strategy.calculate(user, coupon, 100);
    expect(result).toBe(100);
  });
});
