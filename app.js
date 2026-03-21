
(function() {
    'use strict';

    // Initialize Stripe
    const stripePromise = fetch('/env/.env.local')
        .then(response => response.text())
        .then(text => {
            // Extract STRIPE_PUBLISHABLE_KEY from .env.local
            const match = text.match(/STRIPE_PUBLISHABLE_KEY=([^ ]+)/);
            if (match && match[1]) {
                return match[1];
            }
            throw new Error('Could not find STRIPE_PUBLISHABLE_KEY in .env.local');
        })
        .catch(() => {
            // Fallback for development/testing - replace with your actual key when ready
            console.warn('Using fallback Stripe key. Set STRIPE_PUBLISHABLE_KEY in .env.local.');
            return 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY';
        });

    let stripe = null;
    let elements = null;
    let confirmPaymentPromise = null;

    async function initStripe() {
        try {
            const publishableKey = await stripePromise;
            
            if (!publishableKey || publishableKey === 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY') {
                throw new Error('Invalid Stripe key. Please add your STRIPE_PUBLISHABLE_KEY to .env.local');
            }

            stripe = Stripe(publishableKey);
            elements = stripe.elements();

            // Create a custom button style for the island theme
            const customButton = elements.create('cardElement', {
                style: {
                    base: {
                        color: '#306178',
                        fontFamily: '"Segoe UI", sans-serif',
                        fontSmoothing: 'antialiased',
                        fontSize: '16px',
                        '::placeholder': {
                            color: '#aab7c4'
                        }
                    },
                    icons: 'solid'
                },
                hidePostalCode: true // Simplified form
            });

            customButton.on('change', ({error}) => {
                if (error) {
                    console.error(error);
                }
            });

            return { stripe, elements, customButton };
        } catch (error) {
            console.error('Failed to initialize Stripe:', error);
            throw error;
        }
    }

    async function handlePayment(event) {
        event.preventDefault();

        const form = document.getElementById('checkout-form');
        const resultDiv = document.getElementById('payment-result');

        if (!stripe || !elements) {
            resultDiv.className = 'error';
            resultDiv.textContent = 'Error: Stripe not initialized. Please check your .env.local file for STRIPE_PUBLISHABLE_KEY.';
            return;
        }

        try {
            // Collect form data
            const formData = new FormData(form);
            
            if (!formData.get('name') || !formData.get('email')) {
                throw new Error('Please fill in all required fields');
            }

            resultDiv.className = '';
            resultDiv.textContent = 'Processing payment...';

            // Create a PaymentIntent on your server
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.get('name'),
                    email: formData.get('email'),
                    ageGroup: formData.get('age'),
                    sessions: Array.from(formData.selectedOptions, option => option.value)
                })
            });

            const data = await response.json();

            if (!data.clientSecret) {
                throw new Error('Failed to create PaymentIntent');
            }

            // Confirm the payment
            const result = await stripe.confirmCardPayment(data.clientSecret, {
                payment_method: {
                    card: elements.card,
                    billing_details: {
                        name: formData.get('name'),
                        email: formData.get('email')
                    }
                },
                redirect: 'none' // We'll handle the UI ourselves
            });

            if (result.error) {
                throw result.error;
            }

            if (result.paymentIntent.status === 'succeeded') {
                resultDiv.className = 'success';
                resultDiv.innerHTML = `
                    <strong>Payment Successful!</strong><br>
                    Amount: RM ${(data.amount || 299).toFixed(2)}<br>
                    Transaction ID: ${result.paymentIntent.id}
                `;
            } else {
                throw new Error('Payment failed');
            }

        } catch (error) {
            console.error('Payment error:', error);
            
            if (error.type === 'card_error' || error.type === 'api_error') {
                resultDiv.className = 'error';
                resultDiv.textContent = `Error: ${error.message}`;
            } else {
                resultDiv.className = 'error';
                resultDiv.textContent = `Error: ${error.message || 'Payment failed. Please try again.'}`;
            }
        }
    }

    // Initialize on DOM load
    document.addEventListener('DOMContentLoaded', async () => {
        try {
            await initStripe();
            
            const form = document.getElementById('checkout-form');
            if (form) {
                form.addEventListener('submit', handlePayment);
            }

            console.log('GoGlobal Hoops Penang checkout initialized successfully!');
        } catch (error) {
            console.error('Initialization error:', error);
            
            const resultDiv = document.getElementById('payment-result');
            if (resultDiv) {
                resultDiv.className = 'error';
                resultDiv.textContent = `Error: ${error.message || 'Failed to initialize checkout. Please check your .env.local file for STRIPE_PUBLISHABLE_KEY.'}`;
            }
        }
    });

})();