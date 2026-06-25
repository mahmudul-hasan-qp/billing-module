import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class PricingRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findUserWithSpecificCoupon(
    userId: string,
    couponCode: string,
  ): Promise<User> {
    const user = await this.userRepo.findOne({
      where: {
        id: userId,
        assignedCoupons: {
          code: couponCode,
        },
      },
      relations: {
        assignedCoupons: true,
      },
    });

    if (!user) {
      throw new NotFoundException(
        `Invalid User ID or this coupon is not assigned to the user.`,
      );
    }

    return user;
  }
}
