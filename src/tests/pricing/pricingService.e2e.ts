import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { DataSource } from 'typeorm';
import { AppModule } from '../../app.module';
import { Coupon } from '../../modules/pricing/domain/entities/coupon.entity';
import { User } from '../../modules/pricing/domain/entities/user.entity';

describe('Pricing Service Flow (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let mysqlContainer: StartedTestContainer;

  beforeAll(async () => {
    mysqlContainer = await new GenericContainer('mysql:8.4')
      .withExposedPorts(3306)
      .withEnvironment({
        MYSQL_ROOT_PASSWORD: 'Test_Password_123!',
        MYSQL_DATABASE: 'test_db',
        MYSQL_USER: 'test_user',
        MYSQL_PASSWORD: 'Test_Password_123!',
      })
      .withCommand(['--character-set-server=utf8mb4'])
      .start();

    const mappedPort = mysqlContainer.getMappedPort(3306);
    process.env.DB_HOST = mysqlContainer.getHost();
    process.env.DB_PORT = mappedPort.toString();
    process.env.DB_USERNAME = 'test_user';
    process.env.DB_PASSWORD = 'Test_Password_123!';
    process.env.DB_DATABASE = 'test_db';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  }, 480000);

  afterEach(async () => {
    const entities = dataSource.entityMetadatas;
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const entity of entities) {
      for (const relation of entity.manyToManyRelations) {
        if (relation.joinTableName) {
          await queryRunner.query(
            `TRUNCATE TABLE \`${relation.joinTableName}\``,
          );
        }
      }
      await queryRunner.query(`TRUNCATE TABLE \`${entity.tableName}\``);
    }
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
    await queryRunner.release();
  });

  afterAll(async () => {
    await app.close();
    await mysqlContainer.stop();
  });

  it('should apply a standard discount successfully', async () => {
    const coupon = new Coupon();
    coupon.code = 'SAVE15';
    coupon.discountAmount = 15;
    coupon.isThirdParty = false;
    coupon.expiryDate = new Date('2030-12-31');
    await dataSource.getRepository(Coupon).save(coupon);

    const user = new User();
    user.id = 'usr_001';
    user.name = 'Test User';
    user.assignedCoupons = [coupon];
    await dataSource.getRepository(User).save(user);

    return request(app.getHttpServer())
      .post('/pricing/apply-discount')
      .send({
        userId: 'usr_001',
        couponCode: 'SAVE15',
        originalSubscriptionPrice: 100,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual({ finalPrice: 85 });
      });
  });

  it('should return a 404 if user does not own coupon or code is invalid', async () => {
    const coupon = new Coupon();
    coupon.code = 'STOLEN50';
    coupon.discountAmount = 50;
    coupon.isThirdParty = false;
    await dataSource.getRepository(Coupon).save(coupon);

    const user = new User();
    user.id = 'usr_001';
    user.name = 'Test User';
    user.assignedCoupons = [];
    await dataSource.getRepository(User).save(user);

    return request(app.getHttpServer())
      .post('/pricing/apply-discount')
      .send({
        userId: 'usr_001',
        couponCode: 'STOLEN50',
        originalSubscriptionPrice: 100,
      })
      .expect(404);
  });
});
