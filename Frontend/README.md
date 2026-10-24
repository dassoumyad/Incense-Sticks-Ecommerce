# Serein Incense Storefront

Responsive React storefront and admin workspace for the Incense Sticks Ecommerce project.

## Run locally

1. Start the backend on port `8500`.
2. Copy `.env.example` to `.env` and set the Razorpay public key used by checkout.
3. Run `npm install` once, then `npm run dev`.

The storefront defaults to `http://localhost:8500/api`. Set `VITE_API_URL` if your backend runs elsewhere. Razorpay checkout requires `VITE_RAZORPAY_KEY_ID`.

## Pages

Customer pages include Home, Shop, Product details, Bag, Checkout, Account, Registration, Orders and Contact. Admin pages are available at `/admin/login` and cover the dashboard, product catalogue, product creation, categories, coupons and orders.

The bag is stored in the browser so guests can add items before signing in. At checkout, the current bag is synchronized to the authenticated backend cart using product IDs and quantities; the backend rechecks product prices and stock before creating the Razorpay order. The backend does not yet expose an admin order listing endpoint, so order reporting remains unavailable until that route is added.
