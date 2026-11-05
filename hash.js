const bcrypt = require('bcrypt');

async function generarHash() {
  const hash = await bcrypt.hash('Password123!', 10);
  console.log('--- COPIA ESTE HASH ---');
  console.log(hash);
  console.log('-----------------------');
}

generarHash();