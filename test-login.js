const http = require('http');

async function test() {
    const res = await fetch('http://localhost:3000/api/auth/callback/admin-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'password=glitzandglamour&redirect=false',
        redirect: 'manual'
    });

    const text = await res.text();
    const cookies = res.headers.get('set-cookie');
    console.log('Login Status:', res.status);
    console.log('Login Cookies:', cookies);

    if (!cookies) return console.log('No cookie, login failed');

    // Now fetch /admin
    const res2 = await fetch('http://localhost:3000/admin', {
        headers: { 'Cookie': cookies },
        redirect: 'manual'
    });

    console.log('/admin Redirect Status:', res2.status, res2.headers.get('location'));
}

test();
