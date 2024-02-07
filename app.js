const express = require('express')
const { engine } = require('express-handlebars')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const keys = require('./config/keys')
const { stripePublishableKey } = require('./config/keys_dev')
const app = express()

dotenv.config()

const stripe = require('stripe')(keys.stripeSecretKey)

//HandleBars MiddleWare
app.engine('handlebars', engine({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

//Body Parser MiddleWare
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

//Middleware For Statis folder
app.use(express.static(`${__dirname}/public`))

//Route Init
app.get('/', (req, res) => {
    res.render('index')
})
//Route Init
app.get('/return', (req, res) => {
    res.render('return')
})

//Send Publishable key
app.get('/config', (req, res) => {
    res.send({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    })
})

//Success Route
app.get('/success', (req, res) => {
    res.render('success')
})
app.get('/create-payment-intent', async (req, res) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            currency: 'USD',
            amount: 25 * 100,
            automatic_payment_methods: { enabled: true },
        })

        // Send publishable key and PaymentIntent details to client
        res.send({
            clientSecret: paymentIntent.client_secret,
        })
    } catch (e) {
        return res.status(400).send({
            error: {
                message: e.message,
            },
        })
    }
})

const port = process.env.PORT || 5000

app.listen(port, () => console.log(`Server started on port ${port}`))
