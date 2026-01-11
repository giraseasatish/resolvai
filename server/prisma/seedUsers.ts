// prisma/seedUsers.ts

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting User Seeding (Admin & Agent)...')

  // --- 1. CONFIGURATION ---
  const ADMIN_EMAIL = 'admin@resolvai.com'
  const ADMIN_PASS = 'admin123'

  const AGENT_EMAIL = 'agent@resolvai.com'
  const AGENT_PASS = 'agent123'


  // Hash passwords
  const adminHash = await bcrypt.hash(ADMIN_PASS, 10)
  const agentHash = await bcrypt.hash(AGENT_PASS, 10)

  // --- 2. CREATE ADMIN ---
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      name: 'Super Admin',
      email: ADMIN_EMAIL,
      password: adminHash,
      role: 'ADMIN' // Creates Admin Access
    },
  })
  console.log(`Admin Created: ${admin.email} (Pass: ${ADMIN_PASS})`)

  // --- 3. CREATE AGENT ---
  const agent = await prisma.user.upsert({
    where: { email: AGENT_EMAIL },
    update: {},
    create: {
      name: 'Support Agent 01',
      email: AGENT_EMAIL,
      password: agentHash,
      role: 'AGENT' // Creates Agent Access
    },
  })
  console.log(`Agent Created: ${agent.email} (Pass: ${AGENT_PASS})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })