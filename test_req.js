import http from 'http';
import fs from 'fs';

const data = JSON.stringify({ email: "admin@example.com", password: "password123" });

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const { token } = JSON.parse(body);
    http.get('http://localhost:3000/api/transactions?page=1&limit=10', {
      headers: { Authorization: `Bearer ${token}` }
    }, (res2) => {
      let body2 = '';
      res2.on('data', d => body2 += d);
      res2.on('end', () => fs.writeFileSync('out2.json', body2));
    });
  });
});
req.write(data);
req.end();
