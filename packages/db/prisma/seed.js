/**
 * @fileoverview Database seed script. Creates admin user, feature flags, and sample data.
 */

const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await argon2.hash('admin123456', {
    type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 4,
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@carverify.ai' },
    update: {},
    create: {
      email: 'admin@carverify.ai',
      passwordHash: adminPassword,
      name: 'Admin',
      role: 'admin',
      status: 'active',
      emailVerified: true,
    },
  });
  console.log(`  ✅ Admin user: ${admin.email}`);

  // Create test user
  const testPassword = await argon2.hash('test123456', {
    type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 4,
  });

  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      passwordHash: testPassword,
      name: 'Test User',
      role: 'user',
      status: 'active',
    },
  });

  // Create free subscription for test user
  await prisma.subscription.upsert({
    where: { id: `seed-sub-${testUser.id}` },
    update: {},
    create: {
      id: `seed-sub-${testUser.id}`,
      userId: testUser.id,
      plan: 'free',
      status: 'active',
      reportsPerMonth: 0,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Create usage quota
  const now = new Date();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  await prisma.usageQuota.upsert({
    where: { userId_quotaType_periodStart: { userId: testUser.id, quotaType: 'free_searches', periodStart: now } },
    update: {},
    create: {
      userId: testUser.id, quotaType: 'free_searches',
      limitValue: 3, usedValue: 0, periodStart: now, periodEnd: monthEnd,
    },
  });
  console.log(`  ✅ Test user: ${testUser.email}`);

  // Feature flags
  const flags = [
    { key: 'ai_reports_enabled', enabled: true, description: 'Enable AI-generated report narratives' },
    { key: 'chat_enabled', enabled: true, description: 'Enable AI chat for reports' },
    { key: 'hindi_support', enabled: true, description: 'Enable Hindi language output' },
    { key: 'subscriptions_enabled', enabled: false, description: 'Enable subscription-based billing' },
    { key: 'maintenance_mode', enabled: false, description: 'Put the app in maintenance mode' },
  ];

  for (const flag of flags) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: {},
      create: flag,
    });
  }
  console.log(`  ✅ Feature flags: ${flags.length} seeded`);

  console.log('\n✨ Seed complete!');
  console.log('  Admin login: admin@carverify.ai / admin123456');
  console.log('  Test login:  test@example.com / test123456');
}

seed()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
