# Billing Module: Discount Architecture

This module implements the **Strategy Design Pattern** to manage subscription pricing and coupon discounts. Instead of keeping all conditional calculation rules in a single giant file, each coupon type lives in its own isolated, pluggable strategy file.

---

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

---

## 📁 Folder Structure

```text
src/pricing/
├── controllers/
│   └── pricing.controller.ts           # Exposes the HTTP endpoints
├── dtos/
│   └── apply-discount.dto.ts           # Front door: Validates incoming API
├── services/
│   └── pricing.service.ts              # Main Service
├── strategies/
│   ├── standard-coupon.strategy.ts      # Internal coupon math
│   └── third-party-coupon.strategy.ts   # External API vendor verification
└── pricing.module.ts

```

---

## Components Explained

### 1. The Controller (`pricing.controller.ts`)

- **Responsibility:** The front door. It listens for `POST /pricing/apply-discount` requests.
- **Defensive Rule:** It relies on the `ApplyDiscountDto` to block malformed data or negative prices before any code runs.

### 2. The Master Service (`pricing.service.ts`)

- **Responsibility:** The Traffic Cop. It injects a list (array) of all available strategies.
- **How it works:** It loops through its collection of strategies and calls `.canApply(coupon)`. When it finds the matching strategy, it immediately hands over execution by calling `.calculate()`.

### 3. The Strategy Interface (`discount-strategy.interface.ts`)

- **Responsibility:** It guarantees that every single strategy file has exactly the same two methods: `canApply()` and `calculate()`. This ensures the Master Service can interact with all strategies uniformly.

### 4. The Strategies (`strategies/*`)

- **Responsibility:** The calculation workers.
- `StandardCouponStrategy` takes care of standard database coupons, case-insensitivity sanitization, and expiration checks.
- `ThirdPartyCouponStrategy` deals with asynchronous network delays when contacting third-party verification APIs.

---

## 🚀 Why This Architecture? (Benefits)

1. **Open-Closed Principle:** To add a new discount type (e.g., _Holiday Bundle Discount_), we simply write a new strategy file and add it to our module. We **never** have to modify or rewrite the `PricingService` logic.
2. **Highly Testable:** Each calculation script is structurally isolated, allowing unit tests to cover distinct edge cases without spin-up blockages.
