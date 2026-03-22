// GoGlobal Hoops Penang - Backend Server
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Stripe setup
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// API Route: Create PaymentIntent
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { name, email, ageGroup, sessions } = req.body;

        // Validate required fields
        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        // Calculate total based on selected sessions
        const sessionPrices = {
            morning: 299,
            afternoon: 299
        };

        let amount = 0;
        if (sessions && sessions.length > 0) {
            amount = sessions.reduce((total, sessionId) => {
                return total + (sessionPrices[sessionId] || 0);
            }, 0);
        } else {
            // Default to morning session
            amount = 299;
        }

        // Create PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, // Amount in cents (RM 299 = 29900 cents)
            currency: 'myr', // Malaysian Ringgit
            metadata: {
                name,
                email,
                ageGroup,
                sessions: JSON.stringify(sessions || ['morning'])
            },
            receipt_email: email
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            amount: amount / 100 // Return in Ringgit for display
        });

    } catch (error) {
        console.error('Stripe error:', error);
        res.status(500).json({ error: 'Failed to create PaymentIntent' });
    }
});

// API Route: Webhook endpoint for Stripe events
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'] || '';

    let event;

    try {
        // Verify the webhook signature
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntentSucceeded = event.data.object;
            console.log('PaymentIntent succeeded:', paymentIntentSucceeded.id);
            break;
        case 'charge.succeeded':
            const chargeSucceeded = event.data.object;
            console.log('Charge succeeded:', chargeSucceeded.id);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Stripe configured with key ending in: ${process.env.STRIPE_SECRET_KEY?.slice(-4) || 'N/A'}`);
});