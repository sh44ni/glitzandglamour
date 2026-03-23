const { PKPass } = require('passkit-generator');
const fs = require('fs');
const path = require('path');

async function test() {
    try {
        const passBuffers = {
            "pass.json": Buffer.from(JSON.stringify({
                "formatVersion": 1,
                "passTypeIdentifier": "pass.glitzglamours.loyalty",
                "serialNumber": "test-123",
                "teamIdentifier": "U8454YDTMK",
                "organizationName": "Glitz & Glamour Studio",
                "description": "Glitz & Glamour Loyalty Card",
                "logoText": "Glitz & Glamour",
                "foregroundColor": "rgb(255, 255, 255)",
                "backgroundColor": "rgb(26, 10, 18)",
                "labelColor": "rgb(255, 45, 120)",
                "storeCard": {
                    "primaryFields": [{ "key": "stamps", "label": "STAMPS COLLECTED", "value": "5" }],
                    "secondaryFields": [{ "key": "tier", "label": "TIER", "value": "⭐ Glam Insider" }],
                    "auxiliaryFields": [{ "key": "lifetime", "label": "LIFETIME STAMPS", "value": "15" }]
                },
                "barcode": {
                    "message": "test-123",
                    "format": "PKBarcodeFormatQR",
                    "messageEncoding": "iso-8859-1"
                }
            }))
        };
        const publicDir = path.join(process.cwd(), 'public');
        if (fs.existsSync(path.join(publicDir, 'favicon-glitz.png'))) {
            passBuffers["icon.png"] = fs.readFileSync(path.join(publicDir, 'favicon-glitz.png'));
            passBuffers["logo.png"] = fs.readFileSync(path.join(publicDir, 'favicon-glitz.png'));
        }
        if (fs.existsSync(path.join(publicDir, 'loyaltycard-banner.png'))) {
            passBuffers["strip.png"] = fs.readFileSync(path.join(publicDir, 'loyaltycard-banner.png'));
        }

        console.log("Creating PKPass instance...");
        const pkpass = new PKPass(passBuffers, {
            wwdr: fs.readFileSync('./certs/wwdr.pem'),
            signerCert: fs.readFileSync('./certs/pass.pem'),
            signerKey: fs.readFileSync('./certs/pass.pem'),
            // signerKeyPassphrase: 'password' // No passphrase needed since -nodes was used
        });

        console.log("Generating buffer...");
        const buffer = pkpass.getAsBuffer();
        console.log("Success! Buffer size:", buffer.length);
    } catch (err) {
        console.error("ERROR:", err);
    }
}
test();
