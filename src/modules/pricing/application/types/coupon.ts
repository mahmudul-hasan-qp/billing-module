import { Coupon } from '../../domain/entities/coupon.entity';
import { User } from '../../domain/entities/user.entity';

export interface CouponStrategy {
  canApply(coupon: Coupon): boolean;
  calculate(user: User, coupon: Coupon, price: number): Promise<number>;
}
