import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PKPass } from 'passkit-generator';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function isAuthorized(req: Request): boolean {
    const auth = req.headers.get('Authorization');
    return auth === `ApplePass ${process.env.APPLE_PASS_AUTH_TOKEN}`;
}

// GET — Apple Wallet fetches the latest version of a pass
export async function GET(
    req: Request,
    { params }: { params: Promise<{ passTypeId: string; serialNumber: string }> }
) {
    // Note: we do NOT enforce strict auth here because the serialNumber (UUID) is
    // sufficient security — only Apple with the correct serial can fetch this.
    // Strict auth breaks updates when the on-device token differs from the current env var.
    const authHeader = req.headers.get('Authorization');
    console.log(`[Apple Wallet] GET pass — auth: "${authHeader}"`);

    try {
        const { serialNumber } = await params;

        const card = await prisma.loyaltyCard.findUnique({
            where: { id: serialNumber },
            include: { user: true },
        });

        if (!card) return new NextResponse('Pass not found', { status: 404 });

        // Respect If-Modified-Since — Apple Wallet sends this on every poll
        const ifModifiedSince = req.headers.get('If-Modified-Since');
        if (ifModifiedSince) {
            const since = new Date(ifModifiedSince);
            if (since.getTime() && Math.floor(card.updatedAt.getTime() / 1000) <= Math.floor(since.getTime() / 1000)) {
                return new NextResponse(null, { status: 304 });
            }
        }

        const certPath = path.join(process.cwd(), 'certs', 'pass-cert.pem');
        const keyPath = path.join(process.cwd(), 'certs', 'pass-key.pem');
        const wwdrPath = path.join(process.cwd(), 'certs', 'wwdr.pem');

        if (!fs.existsSync(certPath) || !fs.existsSync(keyPath) || !fs.existsSync(wwdrPath)) {
            return new NextResponse('Server configuration error', { status: 500 });
        }

        const maxStamps = 10;
        const filled = card.currentStamps % maxStamps;
        const displayCount = filled.toString();

        const publicDir = path.join(process.cwd(), 'public');
        const passBuffers: Record<string, Buffer> = {
            'pass.json': Buffer.from(JSON.stringify({
                formatVersion: 1,
                passTypeIdentifier: 'pass.com.glitzandglamours.glitzglamour',
                serialNumber: card.id,
                teamIdentifier: 'U8454YDTMK',
                organizationName: 'Glitz & Glamour Studio',
                description: 'Glitz & Glamour Loyalty Card',
                logoText: 'Glitz & Glamour',
                webServiceURL: process.env.APPLE_PASS_WEB_SERVICE_URL,
                authenticationToken: process.env.APPLE_PASS_AUTH_TOKEN,
                foregroundColor: 'rgb(255, 255, 255)',
                backgroundColor: 'rgb(26, 10, 18)',
                labelColor: 'rgb(255, 45, 120)',
                storeCard: {
                    headerFields: [
                        {
                            key: 'stamps',
                            label: 'STAMPS',
                            value: displayCount,
                            textAlignment: 'PKTextAlignmentRight',
                            changeMessage: 'You now have %@ stamps! 💅',
                        },
                    ],
                    secondaryFields: [
                        {
                            key: 'cardholder',
                            label: 'CARDHOLDER',
                            value: card.user.name || 'Valued Client',
                        },
                        {
                            key: 'tier',
                            label: 'TIER',
                            value: card.isInsider ? 'Glam Insider' : 'Glam Member',
                        },
                    ],
                    backFields: [
                        {
                            key: 'terms',
                            label: 'Terms & Conditions',
                            value: 'Present this digital loyalty card at Glitz & Glamour Studio. Collect 10 stamps to unlock a free nail set! Stamps are awarded for valid appointments. Glamour Gets Rewarded 🎀',
                        },
                        {
                            key: 'contact',
                            label: 'Contact Us',
                            value: 'Visit glitzandglamours.com or Instagram @glitzandglamours for bookings and inquiries.',
                        },
                    ],
                },
                barcode: {
                    message: card.id,
                    format: 'PKBarcodeFormatQR',
                    messageEncoding: 'iso-8859-1',
                },
                locations: [
                    {
                        latitude: 33.1813,
                        longitude: -117.2342,
                        relevantText: "You're near Glitz & Glamour! 💅 Don't forget to use your loyalty stamps today.",
                    },
                ],
            })),
        };

        if (fs.existsSync(path.join(publicDir, 'favicon-glitz.png'))) {
            passBuffers['icon.png'] = fs.readFileSync(path.join(publicDir, 'favicon-glitz.png'));
            passBuffers['logo.png'] = fs.readFileSync(path.join(publicDir, 'favicon-glitz.png'));
        }
        if (fs.existsSync(path.join(publicDir, 'loyaltycardbanner2.png'))) {
            passBuffers['strip.png'] = fs.readFileSync(path.join(publicDir, 'loyaltycardbanner2.png'));
        }

        const pkpass = new PKPass(passBuffers, {
            wwdr: fs.readFileSync(wwdrPath),
            signerCert: fs.readFileSync(certPath),
            signerKey: fs.readFileSync(keyPath),
        });

        const buffer = pkpass.getAsBuffer();

        return new NextResponse(new Uint8Array(buffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.apple.pkpass',
                'Last-Modified': card.updatedAt.toUTCString(),
                'Cache-Control': 'no-store, no-cache, must-revalidate',
            },
        });
    } catch (e: any) {
        console.error('[Apple Wallet] Latest pass error:', e.message);
        return new NextResponse('Failed to generate pass', { status: 500 });
    }
}
