import { Injectable } from '@nestjs/common';
import { Coupon, DiscountStrategy, User } from '../types';

@Injectable()
export class ThirdPartyCouponStrategy implements DiscountStrategy {
  canApply(coupon: Coupon): boolean {
    return coupon.isThirdParty === true;
  }

  async calculate(user: User, coupon: Coupon, price: number): Promise<number> {
    const isValid = await this.verifyWithThirdPartyVendor(coupon.code);
    if (!isValid) return price;

    return Math.max(0, price - coupon.discountAmount);
  }

  private async verifyWithThirdPartyVendor(
    couponCode: string,
  ): Promise<boolean> {
    if (!couponCode) return false;
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return true;
    } catch {
      return false;
    }
  }
}
