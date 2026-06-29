import { Injectable, NotFoundException } from '@nestjs/common';
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
    const user = await this.pricingRepository.findUserWithSpecificCoupon(
      userId,
      couponCode,
    );

    if (!user || !user.assignedCoupons?.length) {
      throw new NotFoundException(
        `Invalid User ID or this coupon is not assigned to the user.`,
      );
    }

    // From this point down, 'user' is guaranteed to be a valid User entity by TypeScript
    const coupon = user.assignedCoupons[0];

    const matchedStrategy = this.strategies.find((strategy) =>
      strategy.canApply(coupon),
    );
    if (!matchedStrategy) return originalSubscriptionPrice;

    return matchedStrategy.calculate(user, coupon, originalSubscriptionPrice);
  }
}
