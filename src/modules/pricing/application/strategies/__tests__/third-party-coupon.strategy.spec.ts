import { Test, TestingModule } from '@nestjs/testing';
import { Coupon } from '../../../domain/entities/coupon.entity';
import { User } from '../../../domain/entities/user.entity';
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
    const coupon = new Coupon();
    coupon.isThirdParty = true;

    expect(strategy.canApply(coupon)).toBe(true);
  });

  it('should apply discount if external vendor confirms validity', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);

    const coupon = new Coupon();
    coupon.code = 'VENDOR50';
    coupon.discountAmount = 50;
    coupon.isThirdParty = true;
    coupon.expiryDate = futureDate;

    const user = new User();
    user.id = 'usr_1';
    user.name = 'Test Vendor User';
    user.assignedCoupons = [coupon];

    jest
      .spyOn(
        strategy,
        'verifyWithThirdPartyVendor' as keyof ThirdPartyCouponStrategy,
      )
      .mockResolvedValue(2);

    const result = await strategy.calculate(user, coupon, 100);

    expect(result).toBe(50);
  });
});
