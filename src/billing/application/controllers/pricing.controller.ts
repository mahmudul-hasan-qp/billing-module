import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApplyDiscountDto } from '../dtos/apply-discount.dto';
import { PricingService } from '../services/pricing.service';

@ApiTags('Pricing')
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post('apply-discount')
  @ApiOperation({ summary: 'Calculate final price after applying a coupon' })
  @ApiResponse({
    status: 201,
    description: 'Returns the final calculated price.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request if calculations fail.',
  })
  async calculateDiscount(
    @Body() body: ApplyDiscountDto,
  ): Promise<{ finalPrice: number }> {
    const finalPrice = await this.pricingService.applyDiscount(
      body.user,
      body.coupon,
      body.originalSubscriptionPrice,
    );

    return { finalPrice };
  }
}
