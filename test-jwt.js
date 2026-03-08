const { SignJWT, importPKCS8 } = require('jose');
require('dotenv').config({ path: '.env.local' });

async function run() {
    try {
        const credentials = {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            issuer_id: process.env.GOOGLE_ISSUER_ID
        };

        const classId = `${credentials.issuer_id}.GlitzLoyalty`;
        const objectId = `${credentials.issuer_id}.TestNodeObj`;

        const claims = {
            iss: credentials.client_email,
            aud: 'google',
            typ: 'savetowallet',
            origins: [],
            payload: {
                loyaltyClasses: [{
                    id: classId,
                    issuerName: 'Glitz & Glamour Studio',
                    programName: 'Glitz & Glamour Studio',
                    programLogo: {
                        sourceUri: { uri: 'https://glitzandglamours.com/icons/icon-512.png' }
                    },
                    rewardsTier: 'Glam Member',
                    reviewStatus: 'UNDER_REVIEW',
                    hexBackgroundColor: '#FF2D78'
                }],
                loyaltyObjects: [{
                    id: objectId,
                    classId: classId,
                    state: 'ACTIVE',
                    accountId: 'test-user-node',
                    accountName: 'Glamour Client Node',
                    loyaltyPoints: {
                        label: 'Stamps',
                        balance: { int: 5 }
                    }
                }]
            }
        };

        const privateKey = await importPKCS8(credentials.private_key, 'RS256');
        const token = await new SignJWT(claims)
            .setProtectedHeader({ alg: 'RS256' })
            .setIssuedAt()
            .sign(privateKey);

        const saveUrl = `https://pay.google.com/gp/v/save/${token}`;
        console.log('JWT:', saveUrl);

        const res = await fetch(saveUrl);
        const text = await res.text();
        if (text.includes('Something went wrong') || text.includes('error')) {
            console.log('ERROR FOUND IN PAYLOAD');
            const errorMatch = text.match(/error_message[^>]*>([^<]+)</i) || text.match(/"error_message":"([^"]+)"/i) || text.match(/<div class="error-message">([^<]+)<\/div>/i);
            if (errorMatch) {
                console.log('Error details:', errorMatch[1]);
            } else {
                console.log('Could not extract error details purely from HTML text');
                const fs = require('fs');
                fs.writeFileSync('error_preview.html', text);
            }
        } else {
            console.log('No obvious error in HTML');
        }
    } catch (e) {
        console.error('EXCEPTION:', e);
    }
}
run();
