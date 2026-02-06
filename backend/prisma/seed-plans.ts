import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding staking plans...')

  // Сначала удаляем все старые планы
  await prisma.stakingPlan.deleteMany({})
  console.log('🗑️  Deleted old plans')

  const plans = [
    {
      name: 'Starter',
      duration: 30,
      apy: 14,
      minAmount: 100,
      maxAmount: 999,
      currency: 'USDT',
      isActive: true,
      description: 'Perfect for beginners'
    },
    {
      name: 'Advanced',
      duration: 60,
      apy: 18,
      minAmount: 1000,
      maxAmount: 4999,
      currency: 'USDT',
      isActive: true,
      description: 'For experienced investors'
    },
    {
      name: 'Pro',
      duration: 90,
      apy: 22,
      minAmount: 5000,
      maxAmount: 9999,
      currency: 'USDT',
      isActive: true,
      description: 'Professional tier'
    },
    {
      name: 'Elite',
      duration: 180,
      apy: 28,
      minAmount: 10000,
      maxAmount: 999999,
      currency: 'USDT',
      isActive: true,
      description: 'VIP level investment'
    }
  ]

  for (const plan of plans) {
    const created = await prisma.stakingPlan.create({
      data: plan
    })
    console.log(`✅ Created plan: ${created.name} (ID: ${created.id})`)
  }

  console.log('✨ Seeding completed!')
  
  // Показываем все планы
  const allPlans = await prisma.stakingPlan.findMany()
  console.log('\n📋 All plans in database:')
  allPlans.forEach(p => {
    console.log(`  - ${p.name}: ${p.apy}% APY, ${p.duration} days, $${p.minAmount}-$${p.maxAmount}`)
  })
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })