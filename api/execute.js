const stripe = require('stripe')(process.env.STRIPE_API_KEY);

export default async (req, res) => {
    const {
        secret,
        email,
        ip,
        cards
    } = req.body;
    if (secret != process.env.SECRET)
        return res.status(403).json({
            success: false
        });
    try {
        await stripe.radar.valueListItems.create({
            value_list: process.env.STRIPE_EMAIL_LIST,
            value: email,
        })
    } catch (error) {

    }
    try {
        await stripe.radar.valueListItems.create({
            value_list: process.env.STRIPE_IP_LIST,
            value: ip,
        })
    } catch (error) {

    }
    cards.forEach(async (card) => {
        try {
            await stripe.radar.valueListItems.create({
                value_list: process.env.STRIPE_CARD_FINGERPRINT_LIST,
                value: card,
            })
        } catch (error) {

        }
    });
    return res.status(200).json({
        success: true
    });
}