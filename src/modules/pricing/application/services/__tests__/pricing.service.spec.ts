import { Test, TestingModule } from '@nestjs/testing';
import { Coupon } from '../../../domain/entities/coupon.entity';
import { User } from '../../../domain/entities/user.entity';
import { PricingRepository } from '../../../domain/repositories/pricing.repository';
import { PricingService } from '../../services/pricing.service';
import { StandardCouponStrategy } from '../../strategies/standard-coupon.strategy';
import { ThirdPartyCouponStrategy } from '../../strategies/third-party-coupon.strategy';

describe('PricingService (Traffic Cop Test)', () => {
  let service: PricingService;
  let standardStrategy: StandardCouponStrategy;
  let thirdPartyStrategy: ThirdPartyCouponStrategy;
  let mockPricingRepository: { findUserWithSpecificCoupon: jest.Mock };

  let standardCanApplySpy: jest.SpyInstance;
  let thirdPartyCanApplySpy: jest.SpyInstance;

  beforeEach(async () => {
    mockPricingRepository = {
      findUserWithSpecificCoupon: jest.fn(),
    };

    const tempStandard = new StandardCouponStrategy();
    const tempThirdParty = new ThirdPartyCouponStrategy();

    standardCanApplySpy = jest.spyOn(tempStandard, 'canApply');
    thirdPartyCanApplySpy = jest.spyOn(tempThirdParty, 'canApply');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingService,
        { provide: StandardCouponStrategy, useValue: tempStandard },
        { provide: ThirdPartyCouponStrategy, useValue: tempThirdParty },
        {
          provide: PricingRepository,
          useValue: mockPricingRepository,
        },
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should route the coupon to the matching active strategy tool', async () => {
    const coupon = new Coupon();
    coupon.code = 'S20';
    coupon.isThirdParty = false;
    coupon.discountAmount = 20;

    const user = new User();
    user.id = 'u1';
    user.assignedCoupons = [coupon];

    mockPricingRepository.findUserWithSpecificCoupon.mockResolvedValue(user);

    const calculateSpy = jest
      .spyOn(standardStrategy, 'calculate')
      .mockResolvedValue(80);

    const result = await service.applyDiscount('u1', 'S20', 100);

    expect(result).toBe(80);
    expect(calculateSpy).toHaveBeenCalledWith(user, coupon, 100);
  });

  it('should return original price unchanged if no strategy handles the coupon criteria', async () => {
    standardCanApplySpy.mockReturnValue(false);
    thirdPartyCanApplySpy.mockReturnValue(false);

    const coupon = new Coupon();
    coupon.code = 'UNKNOWN_TYPE';
    coupon.isThirdParty = false;
    coupon.discountAmount = 20;

    const user = new User();
    user.id = 'u1';
    user.assignedCoupons = [coupon];

    mockPricingRepository.findUserWithSpecificCoupon.mockResolvedValue(user);

    const standardCalculateSpy = jest.spyOn(standardStrategy, 'calculate');
    const thirdPartyCalculateSpy = jest.spyOn(thirdPartyStrategy, 'calculate');

    const result = await service.applyDiscount('u1', 'UNKNOWN_TYPE', 130);

    expect(result).toBe(130);
    expect(standardCalculateSpy).not.toHaveBeenCalled();
    expect(thirdPartyCalculateSpy).not.toHaveBeenCalled();
  });
});
