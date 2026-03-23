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

        if (!user || !user.loyaltyCard) {
            return new NextResponse('Loyalty card not found', { status: 404 });
        }

        const certPath = path.join(process.cwd(), 'certs', 'pass.p12');
        const wwdrPath = path.join(process.cwd(), 'certs', 'wwdr.cer');

        if (!fs.existsSync(certPath) || !fs.existsSync(wwdrPath)) {
            console.error('Apple Wallet certificates not found in certs/ directory.');
            return new NextResponse('Server configuration error (missing certificates)', { status: 500 });
        }

        // Assemble assets and json
        const publicDir = path.join(process.cwd(), 'public');
        const passBuffers: Record<string, Buffer> = {
            "pass.json": Buffer.from(JSON.stringify({
                "formatVersion": 1,
                "passTypeIdentifier": "pass.glitzglamours.loyalty",
                "serialNumber": user.loyaltyCard.id,
                "teamIdentifier": "U8454YDTMK",
                "organizationName": "Glitz & Glamour Studio",
                "description": "Glitz & Glamour Loyalty Card",
                "logoText": "Glitz & Glamour",
                "foregroundColor": "rgb(255, 255, 255)",
                "backgroundColor": "rgb(26, 10, 18)",
                "labelColor": "rgb(255, 45, 120)",
                "storeCard": {
                    "primaryFields": [
                        {
                            "key": "stamps",
                            "label": "STAMPS COLLECTED",
                            "value": user.loyaltyCard.currentStamps.toString()
                        }
                    ],
                    "secondaryFields": [
                        {
                            "key": "tier",
                            "label": "TIER",
                            "value": user.loyaltyCard.isInsider ? "⭐ Glam Insider" : "💗 Glam Member"
                        }
                    ],
                    "auxiliaryFields": [
                        {
                            "key": "lifetime",
                            "label": "LIFETIME STAMPS",
                            "value": user.loyaltyCard.lifetimeStamps.toString()
                        }
                    ]
                },
                "barcode": {
                    "message": user.loyaltyCard.id,
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
            signerCert: fs.readFileSync(certPath), // pass.p12 contains both
            signerKey: fs.readFileSync(certPath),
            signerKeyPassphrase: 'GlitzGlam2026!'
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
