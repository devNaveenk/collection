import { createHash } from 'node:crypto'

const [email, password] = process.argv.slice(2)
if (!email || !password) {
  console.error('Usage: node scripts/hash-password.mjs <email> "<password>"')
  process.exit(1)
}
const hash = createHash('sha256').update(`sonline|${email.trim().toLowerCase()}|${password}`).digest('hex')
console.log(`  { email: '${email.trim().toLowerCase()}', passwordHash: '${hash}' },`)
