import { Injectable } from '@nestjs/common';
import { Coupon, DiscountStrategy, User } from '../types';

@Injectable()
export class StandardCouponStrategy implements DiscountStrategy {
  canApply(coupon: Coupon): boolean {
    return coupon.isThirdParty === false;
  }

  calculate(user: User, coupon: Coupon, price: number): Promise<number> {
    if (this.isCouponExpired(coupon)) return Promise.resolve(price);
    if (!this.userHasCoupon(user, coupon)) return Promise.resolve(price);

    const finalPrice = Math.max(0, price - coupon.discountAmount);
    return Promise.resolve(finalPrice);
  }

  private isCouponExpired(coupon: Coupon): boolean {
    if (!coupon.expiryDate) return false;
    return new Date(coupon.expiryDate) < new Date();
  }

  private userHasCoupon(user: User, coupon: Coupon): boolean {
    if (!user.assignedCouponCodes || !Array.isArray(user.assignedCouponCodes))
      return false;

    const normalizedUserCodes = user.assignedCouponCodes.map((code) =>
      code.trim().toUpperCase(),
    );
    const normalizedCouponCode = coupon.code.trim().toUpperCase();

    return normalizedUserCodes.includes(normalizedCouponCode);
  }
}
