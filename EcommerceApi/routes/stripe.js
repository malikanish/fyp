const { verifyToken } = require("./verifyToken");
const dotenv = require("dotenv");
dotenv.config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const router = require("express") .Router();

router.get("/config-stripe",async (req, res)=>{
    return res.status(200).send(JSON.stringify(
            
        process.env.STRIPE_KEY
        )
    )
})
router.post("/create-payment-intent",async (req, res)=>{
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            currency: "usd",
            amount: 1999,
            automatic_payment_methods: {
                enabled: true,
            },
        });
        
        res.status(200).send(JSON.stringify(paymentIntent.client_secret));
    } catch (error) {
        console.log(error)
        res.status(500).send(JSON.stringify("error occured creating payment intent"));
    }
})

module.exports = router;