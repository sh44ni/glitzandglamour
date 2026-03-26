const testGroq = async () => {
    const groqApiKey = process.env.GROQ_API_KEY;
    const payload = {
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: 'Hello' }]
    };

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Data:", data);
};

testGroq();
