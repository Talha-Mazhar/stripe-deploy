const appearance = {
    theme: 'flat',
    variables: {
        fontFamily: ' "Gill Sans", sans-serif',
        fontLineHeight: '1.5',
        borderRadius: '10px',
        colorBackground: '#F6F8FA',
        accessibleColorOnColorPrimary: '#262626',
    },
    rules: {
        '.Block': {
            backgroundColor: 'var(--colorBackground)',
            boxShadow: 'none',
            padding: '12px',
        },
        '.Input': {
            padding: '12px',
        },
        '.Input:disabled, .Input--invalid:disabled': {
            color: 'lightgray',
        },
        '.Tab': {
            padding: '10px 12px 8px 12px',
            border: 'none',
        },
        '.Tab:hover': {
            border: 'none',
            boxShadow:
                '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 7px rgba(18, 42, 66, 0.04)',
        },
        '.Tab--selected, .Tab--selected:focus, .Tab--selected:hover': {
            border: 'none',
            backgroundColor: '#fff',
            boxShadow:
                '0 0 0 1.5px var(--colorPrimaryText), 0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 7px rgba(18, 42, 66, 0.04)',
        },
        '.Label': {
            fontWeight: '500',
        },
    },
}

const options = {
    layout: {
        type: 'tabs',
        defaultCollapsed: false,
    },
    mode: 'shipping',
}
initialize()

// Fetches a payment intent and captures the client secret
async function initialize() {
    const { publishableKey } = await fetch('/config').then(r => r.json())
    if (!publishableKey) {
        addMessage(
            'No publishable key returned from the server. Please check `.env` and try again'
        )
        alert('Please set your Stripe publishable API key in the .env file')
    }

    const stripe = Stripe(publishableKey)

    const { error: backendError, clientSecret } = await fetch(
        '/create-payment-intent'
    ).then(r => r.json())
    if (backendError) {
        addMessage(backendError.message)
    }
    addMessage(`Client secret returned.`)
    const elements = stripe.elements({ appearance, clientSecret })
    const addressElement = elements.create('address', options)
    const paymentElement = elements.create('payment', options)
    paymentElement.mount('#payment-element')
    addressElement.mount('#address-element')

    // const linkAuthenticationElement = elements.create('linkAuthentication')
    // linkAuthenticationElement.mount('#link-authentication-element')

    // When the form is submitted...
    const form = document.getElementById('payment-form')
    form.addEventListener('submit', handleSubmit)
    let submitted = false
    async function handleSubmit(e) {
        e.preventDefault()

        // Disable double submission of the form
        if (submitted) {
            return
        }
        submitted = true
        form.querySelector('button').disabled = true
        // Confirm the payment given the clientSecret
        // from the payment intent that was just created on
        // the server.
        const { error: stripeError } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/return`,
            },
        })

        if (stripeError) {
            addMessage(stripeError.message)

            // reenable the form.
            submitted = false
            form.querySelector('button').disabled = false
            return
        }
    }
}
