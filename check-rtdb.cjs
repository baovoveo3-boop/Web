const https = require('https');

const uid = "Xoaw0vm2fzQi3f0NFb9ifajF4ds2";
const url = `https://webapptool-d9e7e-default-rtdb.firebaseio.com/users/${uid}.json`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(data);
  });
}).on('error', (err) => {
  console.log("Error: " + err.message);
});
