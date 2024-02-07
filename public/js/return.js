document.addEventListener('DOMContentLoaded', async () => {
    const { publishableKey } = await fetch('/config').then(r => r.json())
    if (!publishableKey) {
        addMessage(
            'No publishable key returned from the server. Please check `.env` and try again'
        )
        alert('Please set your Stripe publishable API key in the .env file')
    }

    const stripe = Stripe(publishableKey)

    const url = new URL(window.location)
    const clientSecret = url.searchParams.get('payment_intent_client_secret')

    const { error, paymentIntent } = await stripe.retrievePaymentIntent(
        clientSecret
    )
    if (error) {
        addMessage(error.message)
    }
    addMessage(`Payment ${paymentIntent.status}: ${paymentIntent.id}`)
})
