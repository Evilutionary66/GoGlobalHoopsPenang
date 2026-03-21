# GoGlobal Hoops Penang - Weekend Basketball Training Camp

A signup and deposit page for weekend basketball training camps in Penang, Malaysia with a tropical island theme.

## Features

- 🏀 **Basketball-focused registration form** with age groups and session selection
- 🌴 **Malaysia/Island theme** with palm leaves, sunset gradients, and tropical colors
- 💳 **Stripe integration** for secure payments in Malaysian Ringgit (MYR)
- 📱 **Responsive design** that works on all devices
- 🎨 **Beautiful UI** with smooth animations and island-inspired aesthetics

## Project Structure

```
GoGlobalHoopsPenang/
├── index.html          # Main HTML page
├── styles.css           # Island-themed CSS styling
├── app.js               # Frontend JavaScript for Stripe integration
├── server.js            # Backend Express server with Stripe API
├── package.json         # Node.js dependencies
├── .env.example         # Template for environment variables
└── README.md            # This file
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web framework
- `stripe` - Stripe API client
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Stripe credentials:

```env
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
PORT=3001
```

> **Important**: Never commit `.env.local` to version control! It contains sensitive credentials.

### 3. Set Up Stripe Webhooks (Required for Production)

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Developers** → **Webhooks**
3. Click **Add endpoint**
4. Enter your server URL: `http://localhost:3001/webhook` (for testing) or your production URL
5. Select the events you want to listen for (e.g., `payment_intent.succeeded`, `charge.succeeded`)
6. Copy the **Webhook Signing Secret** and paste it into your `.env.local` as `STRIPE_WEBHOOK_SECRET`

### 4. Run the Server

```bash
npm start
```

The server will run on port 3001 by default.

### 5. Open the Application

Open `index.html` in your browser or visit:

- Frontend: `http://localhost:3000/index.html` (if served via a static server)
- Backend API: `http://localhost:3001`

## Payment Flow

1. User fills out the registration form on the frontend
2. Frontend sends data to `/api/create-payment-intent` endpoint
3. Server creates a Stripe PaymentIntent with MYR currency
4. Frontend uses Stripe.js to collect card details and confirm payment
5. Stripe processes the payment and returns success/failure

## Customization

### Colors (in `styles.css`)

```css
:root {
    --primary-blue: #1a5f7a;   /* Deep ocean blue */
    --secondary-teal: #268bd2;  /* Tropical teal */
    --accent-gold: #d4af37;     /* Sunset gold */
    --sand-beige: #f5e6c8;      /* Beach sand */
    --palm-green: #2d6a4f;      /* Lush greenery */
    --coral-sunset: #ff6b6b;    /* Island sunset */
}
```

### Pricing

Edit `server.js` to adjust the session prices:

```javascript
const sessionPrices = {
    morning: 299,   // RM 2.99 (in cents)
    afternoon: 299  // RM 2.99 (in cents)
};
```

## Testing Payments

Use Stripe's test cards for development:

- Card number: `4242 4242 4242 4242`
- Expiry: Any future date
- CVV: Any 3 digits

## License

MIT License - Feel free to modify and distribute.

---

**GoGlobal Hoops Penang** 🏀🌴  
*Elevate Your Game on the Island of Dreams*