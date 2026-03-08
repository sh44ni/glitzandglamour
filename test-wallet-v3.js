require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

async function test() {
    const credentials = {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };
    const issuerId = process.env.GOOGLE_ISSUER_ID;
    const classId = `${issuerId}.glitz_loyalty_v4`;

    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/wallet_object.issuer']
    });

    const client = await auth.getClient();

    // Step 1: Try to insert the class
    try {
        const res = await client.request({
            url: 'https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass',
            method: 'POST',
            data: {
                id: classId,
                issuerName: 'Glitz & Glamour Studio',
                programName: 'LOYALTY CARD',
                programLogo: {
                    sourceUri: { uri: 'https://raw.githubusercontent.com/sh44ni/glitzandglamour/master/public/favicon-glitz.png' },
                    contentDescription: { defaultValue: { language: 'en-US', value: 'Glitz & Glamour Logo' } }
                },
                heroImage: {
                    sourceUri: { uri: 'https://raw.githubusercontent.com/sh44ni/glitzandglamour/master/public/loyaltycard-banner.png' },
                    contentDescription: { defaultValue: { language: 'en-US', value: 'Glitz & Glamour Loyalty Card' } }
                },
                rewardsTier: 'Glam Member',
                reviewStatus: 'UNDER_REVIEW',
                hexBackgroundColor: '#1A0A12',
                loyaltyPoints: {
                    label: 'Stamps',
                    pointsType: 'points'
                }
            }
        });
        console.log('CLASS INSERT SUCCESS:', JSON.stringify(res.data, null, 2));
    } catch (e) {
        const errMsg = e.response ? JSON.stringify(e.response.data, null, 2) : e.message;
        if (e.response?.status === 409) {
            console.log('Class already exists (OK)');
        } else {
            console.log('CLASS ERROR:', errMsg);
        }
    }
}

test();
