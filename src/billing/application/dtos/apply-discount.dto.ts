import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsObject, IsPositive } from 'class-validator';
import { Coupon, User } from '../types';

export class ApplyDiscountDto {
  @ApiProperty({
    description: 'The user applying the coupon',
    example: { id: 'usr_123', assignedCouponCodes: ['SUMMER50', 'WELCOME10'] },
  })
  @IsNotEmpty()
  @IsObject()
  user!: User;

  @ApiProperty({
    description: 'The coupon details',
    example: {
      code: 'SUMMER50',
      discountAmount: 15,
      expiryDate: '2027-12-31',
      isThirdParty: false,
    },
  })
  @IsNotEmpty()
  @IsObject()
  coupon!: Coupon;

  @ApiProperty({
    description: 'The baseline price of the subscription before discount',
    example: 99.99,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  originalSubscriptionPrice!: number;
}
