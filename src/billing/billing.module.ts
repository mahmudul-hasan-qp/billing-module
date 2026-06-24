import { Module } from '@nestjs/common';
import { PricingController } from './application/controllers/pricing.controller';
import { PricingService } from './application/services/pricing.service';
import { StandardCouponStrategy } from './application/strategies/standard-coupon.strategy';
import { ThirdPartyCouponStrategy } from './application/strategies/third-party-coupon.strategy';

@Module({
  controllers: [PricingController],
  providers: [PricingService, StandardCouponStrategy, ThirdPartyCouponStrategy],
})
export class BillingModule {}
