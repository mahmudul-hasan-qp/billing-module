import { Injectable } from '@nestjs/common';
import { StandardCouponStrategy } from '../strategies/standard-coupon.strategy';
import { ThirdPartyCouponStrategy } from '../strategies/third-party-coupon.strategy';
import { Coupon, DiscountStrategy, User } from '../types';

@Injectable()
export class PricingService {
  private readonly strategies: DiscountStrategy[];

  constructor(
    private readonly standardStrategy: StandardCouponStrategy,
    private readonly thirdPartyStrategy: ThirdPartyCouponStrategy,
  ) {
    this.strategies = [this.standardStrategy, this.thirdPartyStrategy];
  }

  async applyDiscount(
    user: User,
    coupon: Coupon,
    originalSubscriptionPrice: number,
  ): Promise<number> {
    if (
      !user ||
      !coupon ||
      originalSubscriptionPrice <= 0 ||
      coupon.discountAmount <= 0
    ) {
      throw new Error('Invalid coupon information');
    }

    // Find the exact discount strategy that matched
    const matchedStrategy = this.strategies.find((strategy) =>
      strategy.canApply(coupon),
    );

    // If no strategies match, fall back to the original price safely
    if (!matchedStrategy) {
      return originalSubscriptionPrice;
    }

    return matchedStrategy.calculate(user, coupon, originalSubscriptionPrice);
  }
}
