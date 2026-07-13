const uid = "Xoaw0vm2fzQi3f0NFb9ifajF4ds2";
const purchasedProducts = [{ id: 'ban-content' }];

fetch('https://btailabs.vercel.app/api/admin/sync-rtdb', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ uid, purchasedProducts })
})
.then(res => res.json())
.then(data => {
  console.log(data);
  process.exit(0);
})
.catch(err => {
  console.error(err);
  process.exit(1);
});
