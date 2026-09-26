import fs from 'fs';
import path from 'path';

// Helper to load .env.local if not already loaded
function loadEnv() {
    if (!process.env.OPENAI_API_KEY) {
        const envPath = path.resolve(__dirname, '../.env.local');
        if (fs.existsSync(envPath)) {
            const lines = fs.readFileSync(envPath, 'utf8').split('\n');
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
                    const [key, ...vals] = trimmed.split('=');
                    const val = vals.join('=').replace(/^["']|["']$/g, '');
                    if (!process.env[key.trim()]) {
                        process.env[key.trim()] = val.trim();
                    }
                }
            }
        }
    }
}

async function main() {
    loadEnv();
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error('❌ Missing OPENAI_API_KEY. Please verify .env.local');
        process.exit(1);
    }

    const filePath = path.resolve(__dirname, '../data/fine_tune_hello_kitty.jsonl');
    if (!fs.existsSync(filePath)) {
        console.error(`❌ Training file not found at ${filePath}. Run generate-fine-tune-dataset.ts first.`);
        process.exit(1);
    }

    console.log('🚀 Step 1: Uploading training dataset to OpenAI...');
    const fileStats = fs.statSync(filePath);
    console.log(`📁 File size: ${(fileStats.size / 1024).toFixed(1)} KB`);

    const fileBlob = new Blob([fs.readFileSync(filePath)], { type: 'application/jsonl' });
    const formData = new FormData();
    formData.append('purpose', 'fine-tune');
    formData.append('file', fileBlob, 'fine_tune_hello_kitty.jsonl');

    const uploadRes = await fetch('https://api.openai.com/v1/files', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
    });

    if (!uploadRes.ok) {
        const err = await uploadRes.text();
        console.error(`❌ File upload failed (${uploadRes.status}):`, err);
        process.exit(1);
    }

    const fileData = await uploadRes.json();
    console.log(`✅ File uploaded successfully! File ID: ${fileData.id}`);

    // Wait for file processing
    console.log('⏳ Waiting for file to be processed by OpenAI...');
    let isProcessed = false;
    for (let i = 0; i < 15; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const checkRes = await fetch(`https://api.openai.com/v1/files/${fileData.id}`, {
            headers: { Authorization: `Bearer ${apiKey}` },
        });
        const checkData = await checkRes.json();
        if (checkData.status === 'processed') {
            isProcessed = true;
            console.log('✅ File status: processed');
            break;
        } else if (checkData.status === 'error') {
            console.error('❌ File validation failed:', checkData);
            process.exit(1);
        }
        process.stdout.write('.');
    }

    if (!isProcessed) {
        console.log('\n⚠️ File is taking longer to process, but proceeding to submit job...');
    }

    // Step 2: Create fine-tuning job
    console.log('\n🚀 Step 2: Launching fine-tuning job on gpt-4o-mini-2024-07-18...');
    const jobRes = await fetch('https://api.openai.com/v1/fine_tuning/jobs', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            training_file: fileData.id,
            model: 'gpt-4o-mini-2024-07-18',
            hyperparameters: {
                n_epochs: 3,
            },
        }),
    });

    if (!jobRes.ok) {
        const err = await jobRes.text();
        console.error(`❌ Fine-tuning job creation failed (${jobRes.status}):`, err);
        process.exit(1);
    }

    const jobData = await jobRes.json();
    console.log('\n════════════════════════════════════════════════════════');
    console.log('🎉 FINE-TUNING JOB SUBMITTED SUCCESSFULLY!');
    console.log('════════════════════════════════════════════════════════');
    console.log(`Job ID:           ${jobData.id}`);
    console.log(`Base Model:       ${jobData.model}`);
    console.log(`Status:           ${jobData.status}`);
    console.log(`Training File ID: ${jobData.training_file}`);
    console.log(`Created At:       ${new Date(jobData.created_at * 1000).toLocaleString()}`);
    console.log('════════════════════════════════════════════════════════\n');
    console.log('💡 Note: OpenAI fine-tuning takes about 10–20 minutes to complete.');
    console.log('Once completed, OpenAI will email you or you can check status.');
    console.log(`When complete, set OPENAI_MODEL=${jobData.id} (or the resulting ft:gpt-4o-mini:... ID) in .env.local!`);
}

main().catch(console.error);
