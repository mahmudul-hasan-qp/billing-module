import { Injectable } from '@nestjs/common';
import { PricingRepository } from '../../domain/repositories/pricing.repository';
import { StandardCouponStrategy } from '../strategies/standard-coupon.strategy';
import { ThirdPartyCouponStrategy } from '../strategies/third-party-coupon.strategy';
import { CouponStrategy } from '../types/coupon';

@Injectable()
export class PricingService {
  private readonly strategies: CouponStrategy[];

  constructor(
    private readonly pricingRepository: PricingRepository,
    private readonly standardStrategy: StandardCouponStrategy,
    private readonly thirdPartyStrategy: ThirdPartyCouponStrategy,
  ) {
    this.strategies = [this.standardStrategy, this.thirdPartyStrategy];
  }

  async applyDiscount(
    userId: string,
    couponCode: string,
    originalSubscriptionPrice: number,
  ): Promise<number> {
    // 1. Single database hit! Fetches user and the verified coupon together
    const user = await this.pricingRepository.findUserWithSpecificCoupon(
      userId,
      couponCode,
    );

    // 2. Extract the matched coupon from the loaded relationship array
    const coupon = user.assignedCoupons[0];

    // 3. Find and run the runtime business logic calculation tool
    const matchedStrategy = this.strategies.find((strategy) =>
      strategy.canApply(coupon),
    );
    if (!matchedStrategy) return originalSubscriptionPrice;

    return matchedStrategy.calculate(user, coupon, originalSubscriptionPrice);
  }
}
