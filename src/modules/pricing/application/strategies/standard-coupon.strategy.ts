import { Injectable } from '@nestjs/common';
import { Coupon } from '../../domain/entities/coupon.entity';
import { User } from '../../domain/entities/user.entity';
import { CouponStrategy } from '../types/coupon';

@Injectable()
export class StandardCouponStrategy implements CouponStrategy {
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
    if (!user.assignedCoupons || !Array.isArray(user.assignedCoupons))
      return false;

    const normalizedUserCodes = user.assignedCoupons.map((coupon) =>
      coupon.code?.trim()?.toUpperCase(),
    );
    const normalizedCouponCode = coupon.code.trim().toUpperCase();

    return normalizedUserCodes.includes(normalizedCouponCode);
  }
}
