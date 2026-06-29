import { Column, Entity, ManyToMany, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('coupons')
export class Coupon {
  @PrimaryColumn()
  code!: string;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2 })
  discountAmount!: number;

  @Column({ name: 'expiry_date', type: 'datetime', nullable: true })
  expiryDate!: Date;

  @Column({ name: 'is_third_party', type: 'boolean', default: false })
  isThirdParty!: boolean;

  @ManyToMany(() => User, (user) => user.assignedCoupons)
  users!: User[];
}
