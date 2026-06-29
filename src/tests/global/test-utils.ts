import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { AppModule } from '../../app.module';

export interface TestAppBeans {
  app: INestApplication;
  dataSource: DataSource;
}

export const startTestApp = async (): Promise<TestAppBeans> => {
  const configPath = path.join(__dirname, 'container-config.json');
  if (!fs.existsSync(configPath)) {
    throw new Error(
      'Container config file missing. Ensure global-setup executed successfully.',
    );
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8')) as {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };

  // Inject active shared container values into process parameters
  process.env.DB_HOST = config.host;
  process.env.DB_PORT = config.port.toString();
  process.env.DB_USERNAME = config.username;
  process.env.DB_PASSWORD = config.password;
  process.env.DB_DATABASE = config.database;

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.init();

  const dataSource = moduleFixture.get<DataSource>(DataSource);

  return { app, dataSource };
};

export const truncateAllTables = async (
  dataSource: DataSource,
): Promise<void> => {
  if (!dataSource || !dataSource.isInitialized) return;

  const entities = dataSource.entityMetadatas;
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const entity of entities) {
    for (const relation of entity.manyToManyRelations) {
      if (relation.joinTableName) {
        await queryRunner.query(`TRUNCATE TABLE \`${relation.joinTableName}\``);
      }
    }
    await queryRunner.query(`TRUNCATE TABLE \`${entity.tableName}\``);
  }
  await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
  await queryRunner.release();
};
