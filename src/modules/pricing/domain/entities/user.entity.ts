import { Column, Entity, JoinTable, ManyToMany, PrimaryColumn } from 'typeorm';
import { Coupon } from './coupon.entity';

@Entity('users')
export class User {
  @PrimaryColumn()
  id!: string;

  @Column()
  name!: string;

  @ManyToMany(() => Coupon, (coupon) => coupon.users)
  @JoinTable({
    name: 'user_coupons',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'coupon_code', referencedColumnName: 'code' },
  })
  assignedCoupons!: Coupon[];
}
