// prisma/seedCustomer.ts

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting Customer Seeding...')

  // --- CONFIGURATION ---
  const CUSTOMER_EMAIL = 'alice@test.com'
  const CUSTOMER_NAME = 'Alice Customer'
  const CUSTOMER_PASS = 'user123'


  // 1. Hash Password
  const hashedPassword = await bcrypt.hash(CUSTOMER_PASS, 10)

  // 2. Create the Customer
  const customer = await prisma.user.upsert({
    where: { email: CUSTOMER_EMAIL },
    update: {}, 
    create: {
      name: CUSTOMER_NAME,
      email: CUSTOMER_EMAIL,
      password: hashedPassword,
      role: 'CUSTOMER' // Standard User Role
    },
  })

  console.log(`Customer Created!`)
  console.log(`   Email: ${customer.email}`)
  console.log(`   Pass:  ${CUSTOMER_PASS}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })