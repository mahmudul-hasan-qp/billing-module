import * as fs from 'fs';
import * as path from 'path';
import { StartedTestContainer } from 'testcontainers';

declare global {
  var __MYSQL_CONTAINER__: StartedTestContainer | undefined;
}

export default async (): Promise<void> => {
  console.log('\n Stopping global E2E Test container...');

  const container = globalThis.__MYSQL_CONTAINER__;
  if (container) {
    await container.stop();
  }

  const configPath = path.join(__dirname, 'container-config.json');
  if (fs.existsSync(configPath)) {
    fs.unlinkSync(configPath);
  }
  console.log('✨ Clean up finished successfully.');
};
