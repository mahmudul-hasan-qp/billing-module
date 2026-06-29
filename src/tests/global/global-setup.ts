import * as fs from 'fs';
import * as path from 'path';
import { GenericContainer, StartedTestContainer } from 'testcontainers';

declare global {
  var __MYSQL_CONTAINER__: StartedTestContainer | undefined;
}

export default async (): Promise<void> => {
  console.log('\n Starting global E2E Testcontainer...');

  if (!process.env.DOCKER_HOST) {
    process.env.DOCKER_HOST = 'unix:///var/run/docker.sock';
  }

  const dbUser = process.env.E2E_DB_USERNAME || 'test_user';
  const dbPassword = process.env.E2E_DB_PASSWORD || 'Test_Password_123!';
  const dbName = process.env.E2E_DB_DATABASE || 'test_db';

  const container = await new GenericContainer('mysql:8.4')
    .withExposedPorts(3306)
    .withEnvironment({
      MYSQL_ROOT_PASSWORD: dbPassword,
      MYSQL_DATABASE: dbName,
      MYSQL_USER: dbUser,
      MYSQL_PASSWORD: dbPassword,
    })
    .withCommand(['--character-set-server=utf8mb4'])
    .start();

  const mappedPort = container.getMappedPort(3306);

  const config = {
    host: container.getHost(),
    port: mappedPort,
    username: dbUser,
    password: dbPassword,
    database: dbName,
  };

  fs.writeFileSync(
    path.join(__dirname, 'container-config.json'),
    JSON.stringify(config),
  );

  globalThis.__MYSQL_CONTAINER__ = container;
  console.log(`✅ Container ready on port ${mappedPort}\n`);
};
