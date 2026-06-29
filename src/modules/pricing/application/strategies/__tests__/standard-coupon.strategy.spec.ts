import { Coupon } from '../../../domain/entities/coupon.entity';
import { User } from '../../../domain/entities/user.entity';
import { StandardCouponStrategy } from '../standard-coupon.strategy';

describe('StandardCouponStrategy', () => {
  let strategy: StandardCouponStrategy;

  beforeEach(() => {
    strategy = new StandardCouponStrategy();
  });

  it('should successfully calculate the discounted price', async () => {
    const coupon = new Coupon();
    coupon.code = 'S20';
    coupon.discountAmount = 20;
    coupon.isThirdParty = false;
    coupon.expiryDate = new Date('2030-12-31');

    const user = new User();
    user.id = 'u1';
    user.assignedCoupons = [coupon];

    const result = await strategy.calculate(user, coupon, 100);

    expect(result).toBe(80);
  });
});
