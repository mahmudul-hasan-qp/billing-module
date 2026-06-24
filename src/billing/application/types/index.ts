export class User {
  id!: string;
  assignedCouponCodes!: string[];
}

export class Coupon {
  code!: string;
  discountAmount!: number;
  expiryDate!: Date;
  isThirdParty?: boolean;
}

export interface DiscountStrategy {
  canApply(coupon: Coupon): boolean;
  calculate(user: User, coupon: Coupon, price: number): Promise<number>;
}
