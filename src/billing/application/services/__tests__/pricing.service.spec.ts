import { Test, TestingModule } from '@nestjs/testing';
import { StandardCouponStrategy } from '../../strategies/standard-coupon.strategy';
import { ThirdPartyCouponStrategy } from '../../strategies/third-party-coupon.strategy';
import { Coupon, User } from '../../types';
import { PricingService } from '../pricing.service';

describe('PricingService (Traffic Cop Test)', () => {
  let service: PricingService;
  let standardStrategy: StandardCouponStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingService,
        StandardCouponStrategy,
        ThirdPartyCouponStrategy,
      ],
    }).compile();

    service = module.get<PricingService>(PricingService);
    standardStrategy = module.get<StandardCouponStrategy>(
      StandardCouponStrategy,
    );
  });

  it('should route the coupon to the matching active strategy tool', async () => {
    const user = { id: 'u1' } as User;
    const coupon = { code: 'S20', isThirdParty: false } as Coupon;

    const calculateSpy = jest
      .spyOn(standardStrategy, 'calculate')
      .mockResolvedValue(80);

    const result = await service.applyDiscount(user, coupon, 100);

    expect(calculateSpy).toHaveBeenCalledWith(user, coupon, 100);
    expect(result).toBe(80);
  });
});
