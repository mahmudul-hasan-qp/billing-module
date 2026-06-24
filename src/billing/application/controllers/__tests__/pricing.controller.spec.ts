import { Test, TestingModule } from '@nestjs/testing';
import { PricingService } from '../../services/pricing.service';
import { StandardCouponStrategy } from '../../strategies/standard-coupon.strategy';
import { ThirdPartyCouponStrategy } from '../../strategies/third-party-coupon.strategy';
import { PricingController } from '../pricing.controller';

describe('PricingController', () => {
  let controller: PricingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PricingController],
      providers: [
        PricingService,
        StandardCouponStrategy,
        ThirdPartyCouponStrategy,
      ],
    }).compile();

    controller = module.get<PricingController>(PricingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
