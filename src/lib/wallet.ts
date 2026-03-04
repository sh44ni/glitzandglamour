import { SignJWT, importPKCS8 } from 'jose';

export async function updateGoogleWalletPass(loyaltyCardId: string, newStampCount: number) {
    try {
        const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
        const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        const issuerId = process.env.GOOGLE_ISSUER_ID;

        if (!clientEmail || !privateKey || !issuerId) {
            console.log('Google Wallet credentials missing, skipping update.');
            return;
        }

        // 1. Create a signed JWT to request an access token
        const iat = Math.floor(Date.now() / 1000);
        const exp = iat + 3600;

        const jwtPayload = {
            iss: clientEmail,
            scope: 'https://www.googleapis.com/auth/wallet_object.issuer',
            aud: 'https://oauth2.googleapis.com/token',
            exp,
            iat
        };

        const key = await importPKCS8(privateKey, 'RS256');
        const token = await new SignJWT(jwtPayload)
            .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
            .sign(key);

        // 2. Fetch the access token
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: token,
            })
        });

        const tokenData = await tokenRes.json();
        if (!tokenRes.ok || !tokenData.access_token) {
            console.error('Failed to get Google API token:', tokenData);
            return;
        }

        // Must match the _v3 suffix used in route.ts
        const objectId = `${issuerId}.${loyaltyCardId}_v3`;
        const updateRes = await fetch(`https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/${objectId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                loyaltyPoints: {
                    balance: { string: newStampCount.toString() }
                }
            })
        });

        if (!updateRes.ok) {
            const errBody = await updateRes.text();
            console.error('Failed to update Google Wallet pass:', errBody);
            return;
        }

        console.log(`Successfully updated Google Wallet pass for card ${loyaltyCardId} to ${newStampCount} stamps.`);
    } catch (e: any) {
        console.error("Error updating Google Wallet pass:", e.message);
    }
}
