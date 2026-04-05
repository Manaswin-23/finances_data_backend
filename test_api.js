const fs = require('fs');
async function runAPI() {
  try {
    let result = "Sending login request to http://localhost:3000/api/auth/login...\n";
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'password123' })
    });
    
    let loginData = await loginRes.json();
    result += '\n--- Login Response ---\n' + JSON.stringify(loginData, null, 2) + '\n';

    if (!loginData.token) {
        result += '\nFailed to get token, creating user...\n';
        const registerRes = await fetch('http://localhost:3000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@example.com', password: 'password123', name: 'Admin Demo' })
        });
        loginData = await registerRes.json();
        result += '\n--- Register Response ---\n' + JSON.stringify(loginData, null, 2) + '\n';
    }

    if (loginData.token) {
        result += '\nSending GET request to http://localhost:3000/api/dashboard/summary...\n';
        const dashRes = await fetch('http://localhost:3000/api/dashboard/summary', {
            headers: { 'Authorization': `Bearer ${loginData.token}` }
        });
        const dashData = await dashRes.json();
        result += '\n--- Dashboard Summary Response ---\n' + JSON.stringify(dashData, null, 2) + '\n';
    }
    fs.writeFileSync('output.txt', result);
  } catch (err) {
    fs.writeFileSync('output.txt', 'Failed to run: ' + err.message);
  }
}

runAPI();
