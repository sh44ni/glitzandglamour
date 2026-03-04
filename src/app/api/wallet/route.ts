import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { SignJWT, importPKCS8 } from 'jose';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { loyaltyCard: true },
        });

        if (!user || !user.loyaltyCard) {
            return NextResponse.json({ error: 'Loyalty card not found' }, { status: 404 });
        }

        const credentials = {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            issuer_id: process.env.GOOGLE_ISSUER_ID
        };

        if (!credentials.client_email || !credentials.private_key || !credentials.issuer_id) {
            return NextResponse.json({ error: 'Google Wallet configuration is missing on server' }, { status: 500 });
        }

        // Use the exact pre-existing class ID from the Google Pay Console
        const classId = `${credentials.issuer_id}.glitz_loyalty`;
        const objectId = `${credentials.issuer_id}.${user.loyaltyCard.id}`;

        const claims = {
            iss: credentials.client_email,
            aud: 'google',
            typ: 'savetowallet',
            payload: {
                loyaltyClasses: [{
                    id: classId,
                    issuerName: 'Glitz & Glamour Studio',
                    programName: 'GLITZ & GLAMOUR',
                    programLogo: {
                        sourceUri: { uri: 'https://raw.githubusercontent.com/sh44ni/glitzandglamour/master/public/herobg.jpeg' }
                    },
                    heroImage: {
                        sourceUri: { uri: 'https://raw.githubusercontent.com/sh44ni/glitzandglamour/master/public/herobg.jpeg' }
                    },
                    rewardsTier: 'Glam Member ✦',
                    reviewStatus: 'UNDER_REVIEW',
                    hexBackgroundColor: '#1A0A12',
                    // Define the stamp-style loyalty points layout
                    loyaltyPoints: {
                        label: 'Stamps Collected',
                        pointsType: 'stamps',
                        pointsConfig: {
                            stampsRound: {
                                maxStamps: 10
                            }
                        }
                    }
                }],
                loyaltyObjects: [{
                    id: objectId,
                    classId: classId,
                    state: 'ACTIVE',
                    accountId: user.id,
                    accountName: session.user.name || 'Glamour Client',
                    // Show the user's profile picture as a thumbnail if they have one
                    ...(user.image ? {
                        heroImage: {
                            sourceUri: { uri: user.image }
                        }
                    } : {}),
                    loyaltyPoints: {
                        balance: { string: user.loyaltyCard.currentStamps.toString() }
                    }
                }]
            }
        };

        // Parse key using jose
        const privateKey = await importPKCS8(credentials.private_key, 'RS256');

        // Sign token using jose
        const token = await new SignJWT(claims)
            .setProtectedHeader({ alg: 'RS256' })
            .setIssuedAt()
            .sign(privateKey);

        const saveUrl = `https://pay.google.com/gp/v/save/${token}`;

        return NextResponse.json({ saveUrl });
    } catch (error) {
        console.error('Wallet generation error:', error);
        return NextResponse.json({ error: 'Failed to generate Wallet link' }, { status: 500 });
    }
}
