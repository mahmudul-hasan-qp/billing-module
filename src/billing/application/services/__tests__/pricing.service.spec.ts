import { Test, TestingModule } from '@nestjs/testing';
import { StandardCouponStrategy } from '../../strategies/standard-coupon.strategy';
import { ThirdPartyCouponStrategy } from '../../strategies/third-party-coupon.strategy';
import { Coupon, User } from '../../types';
import { PricingService } from '../pricing.service';

describe('PricingService (Traffic Cop Test)', () => {
  let service: PricingService;
  let standardStrategy: StandardCouponStrategy;
  let thirdPartyStrategy: ThirdPartyCouponStrategy;

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
    thirdPartyStrategy = module.get<ThirdPartyCouponStrategy>(
      ThirdPartyCouponStrategy,
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

  it('should return original price unchanged if no strategy handles the coupon criteria', async () => {
    const user = { id: 'u1' } as User;
    const coupon = {
      code: 'UNKNOWN_TYPE',
      isThirdParty: undefined,
      discountAmount: 20,
      expiryDate: new Date(),
    };

    const standardSpy = jest.spyOn(standardStrategy, 'calculate');
    const thirdPartySpy = jest.spyOn(thirdPartyStrategy, 'calculate');

    const result = await service.applyDiscount(user, coupon, 150);

    expect(result).toBe(150);
    expect(standardSpy).not.toHaveBeenCalled();
    expect(thirdPartySpy).not.toHaveBeenCalled();
  });
});
