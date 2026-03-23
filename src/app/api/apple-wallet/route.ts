import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { PKPass } from 'passkit-generator';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { loyaltyCard: true },
        });

        if (!user) {
            return new NextResponse('User not found', { status: 404 });
        }

        let loyaltyCard = user.loyaltyCard;
        if (!loyaltyCard) {
            // Auto-create a card if they somehow don't have one
            loyaltyCard = await prisma.loyaltyCard.create({
                data: { userId: user.id }
            });
            user.loyaltyCard = loyaltyCard;
        }

        const certPath = path.join(process.cwd(), 'certs', 'pass-cert.pem');
        const keyPath = path.join(process.cwd(), 'certs', 'pass-key.pem');
        const wwdrPath = path.join(process.cwd(), 'certs', 'wwdr.pem');

        if (!fs.existsSync(certPath) || !fs.existsSync(keyPath) || !fs.existsSync(wwdrPath)) {
            console.error('Apple Wallet certificates not found in certs/ directory.');
            return new NextResponse('Server configuration error (missing certificates)', { status: 500 });
        }

        // Assemble assets and json
        const publicDir = path.join(process.cwd(), 'public');
        const passBuffers: Record<string, Buffer> = {
            "pass.json": Buffer.from(JSON.stringify({
                "formatVersion": 1,
                "passTypeIdentifier": "pass.com.glitzandglamours.glitzglamour",
                "serialNumber": loyaltyCard.id,
                "teamIdentifier": "U8454YDTMK",
                "organizationName": "Glitz & Glamour Studio",
                "description": "Glitz & Glamour Loyalty Card",
                "logoText": "Glitz & Glamour",
                "foregroundColor": "rgb(255, 255, 255)",
                "backgroundColor": "rgb(26, 10, 18)",
                "labelColor": "rgb(255, 45, 120)",
                "storeCard": {
                    "headerFields": [
                        {
                            "key": "stamps",
                            "label": "STAMPS",
                            "value": loyaltyCard.currentStamps.toString(),
                            "textAlignment": "PKTextAlignmentRight"
                        }
                    ],
                    "secondaryFields": [
                        {
                            "key": "cardholder",
                            "label": "CARDHOLDER",
                            "value": user.name || "Valued Client"
                        },
                        {
                            "key": "tier",
                            "label": "TIER",
                            "value": loyaltyCard.isInsider ? "⭐ Glam Insider" : "💗 Glam Member"
                        }
                    ],
                    "auxiliaryFields": [
                        {
                            "key": "lifetime",
                            "label": "LIFETIME STAMPS",
                            "value": loyaltyCard.lifetimeStamps.toString()
                        }
                    ],
                    "backFields": [
                        {
                            "key": "terms",
                            "label": "Terms & Conditions",
                            "value": "Present this digital loyalty card at Glitz & Glamour Studio. Collect 10 stamps to unlock a free spin on the rewards wheel! Stamps are awarded for valid appointments."
                        },
                        {
                            "key": "contact",
                            "label": "Contact Us",
                            "value": "Visit our website or Instagram @glitzandglamours for bookings and inquiries."
                        }
                    ]
                },
                "barcode": {
                    "message": loyaltyCard.id,
                    "format": "PKBarcodeFormatQR",
                    "messageEncoding": "iso-8859-1"
                },
                "locations": [
                    {
                        "latitude": 33.1813,
                        "longitude": -117.2342,
                        "relevantText": "You're near Glitz & Glamour! 💅 Don't forget to use your loyalty stamps today."
                    }
                ]
            }))
        };

        if (fs.existsSync(path.join(publicDir, 'favicon-glitz.png'))) {
            passBuffers["icon.png"] = fs.readFileSync(path.join(publicDir, 'favicon-glitz.png'));
            passBuffers["logo.png"] = fs.readFileSync(path.join(publicDir, 'favicon-glitz.png'));
        }
        
        if (fs.existsSync(path.join(publicDir, 'loyaltycard-banner.png'))) {
            passBuffers["strip.png"] = fs.readFileSync(path.join(publicDir, 'loyaltycard-banner.png'));
        }

        // Initialize pass
        const pkpass = new PKPass(passBuffers, {
            wwdr: fs.readFileSync(wwdrPath),
            signerCert: fs.readFileSync(certPath),
            signerKey: fs.readFileSync(keyPath)
            // No passphrase needed since PEM is decrypted
        });

        // Generate the Buffer
        const buffer = pkpass.getAsBuffer();

        return new NextResponse(new Uint8Array(buffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.apple.pkpass',
                'Content-Disposition': 'attachment; filename="GlitzGlamour.pkpass"'
            }
        });

    } catch (error) {
        console.error('Apple Wallet generation error:', error);
        return new NextResponse('Failed to generate Wallet pass', { status: 500 });
    }
}
