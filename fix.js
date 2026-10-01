const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src', 'routes');
fs.readdirSync(dir).filter(f => f.endsWith('.js')).forEach(f => {
  const p = path.join(dir, f);
  let c = fs.readFileSync(p, 'utf8');
  if (c.includes('../middleware/authMiddleware')) {
    fs.writeFileSync(p, c.replace(/\.\.\/middleware\/authMiddleware/g, '../middlewares/authMiddleware'));
    console.log('Fixed ' + f);
  }
});
