# Zenith Backend

Backend for Zenith: A comprehensive personal growth platform where users complete daily challenges across multiple categories, get AI-powered coaching, track progress with streaks and leaderboards, and redeem earned points for real cash rewards via automated UPI payouts.

**Frontend Repository**: [zenith-frontend](https://github.com/Yash-007/Zenith-frontend)

## Tech Stack

- Node.js + TypeScript + Express
- PostgreSQL + Prisma ORM
- Razorpay (Payments)
- Google Gemini (AI Chat)
- Redis (Caching)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/zenith"
PORT=3000
JWT_SECRET=your-jwt-secret

RAZORPAY_API_URL=https://api.razorpay.com/v1
RAZORPAY_API_KEY=your-key
RAZORPAY_API_SECRET=your-secret
RAZORPAY_MERCHANT_ACCOUNT_NUMBER=your-account-number
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

GEMINI_API_KEY=your-gemini-key

REDIS_HOST=localhost
REDIS_PORT=6379
```

3. Run migrations and start server:
```bash
npx prisma migrate dev
npx prisma generate
npm run dev
```

## Few API Examples

### Create Reward (Redeem Points)
```bash
curl -X POST 'http://localhost:3000/reward' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer YOUR_TOKEN' \
-d '{
    "pointsRewarded": 3000,
    "amount": 20000,
    "vpaAddress": "user@upi",
    "rewardType": "CASHBACK"
}'
```

### Get Rewards History
```bash
curl -X GET 'http://localhost:3000/reward/history' \
-H 'Authorization: Bearer YOUR_TOKEN'
```

### Get All Transactions
```bash
curl -X GET 'http://localhost:3000/transaction' \
-H 'Authorization: Bearer YOUR_TOKEN'
```

### Create Contact
```bash
curl -X POST 'http://localhost:3000/transaction/contact' \
-H 'Content-Type: application/json' \
-d '{
    "name": "John Doe",
    "email": "john@example.com",
    "contact": "9876543210"
}'
```

## Webhooks

Configure Razorpay webhook URL: `https://yourdomain.com/transaction/webhook`

Events: `payout.processed`, `payout.rejected`, `payout.reversed`

## Project Structure

```
src/
├── clients/        # External services (Redis, Gemini)
├── controllers/    # Request handlers
├── jobs/          # Background jobs
├── middlewares/   # Auth, file upload
├── prisma/        # Database schema
├── repo/          # Database queries
├── routes/        # API routes
├── types/         # TypeScript types
└── utils/         # Helper functions
```

## Important

- Reward redemption: 3000 points = ₹200 (fixed)
- All authenticated endpoints require JWT Bearer token
- Amounts are in paise (smallest currency unit)
