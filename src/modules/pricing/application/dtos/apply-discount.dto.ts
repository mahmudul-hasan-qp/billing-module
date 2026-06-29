import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class ApplyDiscountDto {
  @ApiProperty({
    description: 'The unique identification string of the customer',
    example: 'usr_123',
    type: String,
  })
  @IsNotEmpty({ message: 'userId is mandatory' })
  @IsString({ message: 'userId must be a valid text string' })
  userId!: string;

  @ApiProperty({
    description: 'The unique code string of the coupon being claimed',
    example: 'SUMMER50',
    type: String,
  })
  @IsNotEmpty({ message: 'couponCode is mandatory' })
  @IsString({ message: 'couponCode must be a valid text string' })
  couponCode!: string;

  @ApiProperty({
    description:
      'The baseline price of the subscription package before discount modifications are evaluated',
    example: 99.99,
    type: Number,
  })
  @IsNotEmpty({ message: 'originalSubscriptionPrice is mandatory' })
  @IsNumber({}, { message: 'originalSubscriptionPrice must be a valid number' })
  @IsPositive({ message: 'originalSubscriptionPrice must be greater than 0' })
  originalSubscriptionPrice!: number;
}
