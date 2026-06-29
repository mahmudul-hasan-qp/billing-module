import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricingController } from './application/controllers/pricing.controller';
import { PricingService } from './application/services/pricing.service';
import { StandardCouponStrategy } from './application/strategies/standard-coupon.strategy';
import { ThirdPartyCouponStrategy } from './application/strategies/third-party-coupon.strategy';
import { Coupon } from './domain/entities/coupon.entity';
import { User } from './domain/entities/user.entity';
import { PricingRepository } from './domain/repositories/pricing.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User, Coupon])],
  controllers: [PricingController],
  providers: [
    PricingService,
    PricingRepository,
    StandardCouponStrategy,
    ThirdPartyCouponStrategy,
  ],
})
export class PricingModule {}
