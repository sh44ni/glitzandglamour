import { google } from 'googleapis';

export async function updateGoogleWalletPass(loyaltyCardId: string, newStampCount: number) {
    try {
        const credentials = {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        };
        const issuerId = process.env.GOOGLE_ISSUER_ID;

        if (!credentials.client_email || !credentials.private_key || !issuerId) {
            console.log('Google Wallet credentials missing, skipping update.');
            return;
        }

        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/wallet_object.issuer']
        });

        const authClient = await auth.getClient();
        const objectId = `${issuerId}.${loyaltyCardId}`;

        // Patch the loyalty object with new points balance
        await authClient.request({
            url: `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/${objectId}`,
            method: 'PATCH',
            data: {
                loyaltyPoints: {
                    balance: { string: newStampCount.toString() }
                }
            }
        });

        console.log(`Successfully updated Google Wallet pass for card ${loyaltyCardId} to ${newStampCount} stamps.`);
    } catch (e: any) {
        console.error("Failed to update Google Wallet pass:", e.response ? e.response.data : e.message);
    }
}
