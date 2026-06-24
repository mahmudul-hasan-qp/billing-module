import { Test, TestingModule } from '@nestjs/testing';
import { Coupon, User } from '../../types';
import { ThirdPartyCouponStrategy } from '../third-party-coupon.strategy';

describe('ThirdPartyCouponStrategy', () => {
  let strategy: ThirdPartyCouponStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ThirdPartyCouponStrategy],
    }).compile();

    strategy = module.get<ThirdPartyCouponStrategy>(ThirdPartyCouponStrategy);
  });

  it('should only handle coupons that ARE third-party', () => {
    const coupon = { isThirdParty: true } as Coupon;
    expect(strategy.canApply(coupon)).toBe(true);
  });

  it('should apply discount if external vendor confirms validity', async () => {
    const user: User = { id: 'usr_1', assignedCouponCodes: ['VENDOR50'] };
    const coupon: Coupon = {
      code: 'VENDOR50',
      discountAmount: 50,
      isThirdParty: true,
      expiryDate: new Date(),
    };

    jest
      .spyOn(strategy as any, 'verifyWithThirdPartyVendor')
      .mockResolvedValue(true);

    const result = await strategy.calculate(user, coupon, 100);
    expect(result).toBe(50);
  });
});
