const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const axios = require('axios');

export default async (req, res) => {
    if (req.method == 'POST') {
        const sig = req.headers['stripe-signature'];
        let event;
        let bodyChunks = [];

        req
            .on('data', chunk => bodyChunks.push(chunk))
            .on('end', async () => {
                const rawBody = Buffer.concat(bodyChunks).toString('utf8');

                try {
                    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
                } catch (err) {
                    return res.status(400).send(`Webhook Error: ${err.message}`);
                }
 
                try {
                    let cards = [];
                    const {
                        data: {
                            object: {
                                charge,
                                reason,
                                evidence: {
                                    customer_email_address,
                                    customer_purchase_ip

                                }
                            }
                        }
                    } = req.body;
                    const chargeObject = await stripe.charges.retrieve(charge);
                    const paymentMethods = await stripe.paymentMethods.list({
                        customer: chargeObject.customer,
                        type: 'card'
                    });
                    paymentMethods.data.forEach((paymentMethod) => cards.push(paymentMethod.card.fingerprint))
                    const payload = {
                        customer_email_address,
                        customer_purchase_ip,
                        cards,
                        reason,
                        secret: process.env.SECRET
                    };
                    await notifyMaster(payload);
                    return res.status(200).json({
                        success: true
                    });
                } catch (ex) {
                    return res.status(500).json({
                        success: false
                    });
                }
            });
    }
    else{
        return res.status(404).json({
            success: false
        });
    }
}
export const config = {
    api: {
        bodyParser: false
    },
};
async function notifyMaster(payload) {
    await axios.post('https://hoc.projectindustries.gg/notify', payload)
}