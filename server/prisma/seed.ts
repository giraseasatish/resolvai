// prisma/seed.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. Create the initial Products
  const products = ['Tech Support', 'Sales Inquiry', 'Billing Issue']

  console.log('Starting Seeding...')

  for (const name of products) {
    const product = await prisma.product.upsert({
      where: { name: name },
      update: {},
      create: { name: name },
    })
    console.log(`Created product: ${product.name}`)
  }
  
  console.log('Seeding Finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })