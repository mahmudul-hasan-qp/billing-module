# Billing Module: Discount Architecture

This module implements the **Strategy Design Pattern** to manage subscription pricing and coupon discounts. Instead of keeping all conditional calculation rules in a single giant file, each coupon type lives in its own isolated, pluggable strategy file.

## Complete Architecture Workflow

Data flows linearly from the external API endpoint down to our specialized calculation tools:

```
[ Client Request ]
       │
       ▼
 [ PricingController ]  --> Handles HTTP route & structural DTO validation
       │
       ▼
  [ PricingService ]    --> The main service, Finds the right tool in its tool array
       │
       ├──► [ StandardCouponStrategy ]     --> Handles normal internal coupons
       └──► [ ThirdPartyCouponStrategy ]   --> Handles external vendor API coupons

```

## Database & Environment Setup

This application uses **MySQL 8.4** managed via Docker Compose and **TypeORM** for secure data persistence. Follow these instructions to set up your local environment.

### Prerequisites

Make sure you have the following installed on your machine:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Node.js (v18+) & pnpm / npm

### 1. Environment Configuration (`.env`)

Create a `.env` file in the **root directory** of the project (next to `package.json`) and configure the following database connection credentials:

```env
# Database Connection Settings
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=test_user
DB_PASSWORD=Test_Password_123!
DB_DATABASE=test_db
```

### 2. Docker Container Setup

The database credentials match the strict native complexity requirements of MySQL 8.4. To pull the image, configure the tables, and seed the test dataset:

```bash
# Stop any conflicting containers and wipe old volume caches
docker compose down -v

# Start the MySQL container in the background
docker compose up -d
```

#### Verifying the Container Status

You can check the initialization logs to ensure the database successfully executed the local `init.sql` seed script:

```bash
docker logs test_mysql_container
```

Look for `port: 3306  MySQL Community Server - GPL` and `ready for connections` in the terminal output.

### 3. Running the Application

Once the Docker container is up and running, install dependencies and launch the NestJS development server:

```bash
# Install packages
pnpm install

# Run backend development environment
pnpm run start:dev
```

The application will automatically read the configuration parameters from your `.env` file, bind securely to the running Docker instance, and sync the TypeORM data models.

Here is a dedicated troubleshooting markdown block that you can add directly to your project's **`README.md`** to help other developers resolve this `pnpm` build script security blocker on their machines.

## 🔍 Troubleshooting: `pnpm` Ignored Build Scripts

When installing dependencies or running `pnpm build`, you may encounter the following error:

```
[ERR_PNPM_IGNORED_BUILDS] Ignored build scripts: cpu-features, protobufjs, ssh2, unrs-resolver
Run "pnpm approve-builds" to pick which dependencies should be allowed to run scripts.
```

### ❓ Why this happens

Newer versions of `pnpm` implement strict supply-chain security policies. They automatically block third-party packages (required internally by tools like `testcontainers`) from executing native C++/binary compilation scripts during installation unless they are explicitly authorized.

### 🛠️ How to Fix

Choose **one** of the following methods to resolve the issue on your machine:

#### Method 1: Interactive Approval (Recommended)

Run the built-in interactive approval command in your terminal:

```bash
pnpm approve-builds
```

- Use your arrow keys to navigate the menu.
- Press a to select all or Space to select `cpu-features`, `protobufjs`, `ssh2`, and `unrs-resolver`.
- Press Enter to submit and unblock the installation.

#### Method 2: Global Script Bypass (Fastest)

If the interactive menu fails or you want to bypass native compilation restrictions globally for this project workspace, turn off script enforcement and rebuild:

```bash
# Force pnpm to skip native build script blocking
pnpm config set ignore-scripts true

# Reinstall and verify the build
pnpm install
pnpm build
```

#### Method 3: Local `.npmrc` File Configuration

Create or update a `.npmrc` file in the root directory of this repository to automatically authorize these dependencies for anyone cloning the project:

```text
only-built-dependencies[]=cpu-features
only-built-dependencies[]=protobufjs
only-built-dependencies[]=ssh2
only-built-dependencies[]=unrs-resolver
```

After saving the file, wipe your local cache and reinstall:

```bash
pnpm install
pnpm build
```
