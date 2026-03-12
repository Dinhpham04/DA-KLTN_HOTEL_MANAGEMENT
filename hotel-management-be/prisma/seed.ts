import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 12;

async function main(): Promise<void> {
  const connectionString = process.env['DATABASE_URL'];
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  await prisma.$connect();

  console.log('Seeding database...');

  // ─── Admin ─────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', BCRYPT_ROUNDS);

  const admin = await prisma.staff.upsert({
    where: { mail: 'admin@hotel.com' },
    update: {},
    create: {
      staffType: 1, // ADMIN
      staffName: 'System Admin',
      staffNameEn: 'System Admin',
      staffNameShort: 'Admin',
      sex: 9,
      mail: 'admin@hotel.com',
      loginPassword: adminPassword,
      dataStatus: 1,
      orderNum: 1,
      displayInAttendance: false,
    },
  });

  console.log(`  Admin created: ${admin.mail} (ID: ${admin.staffId})`);

  // ─── Manager ───────────────────────────────────────
  const managerPassword = await bcrypt.hash('manager123', BCRYPT_ROUNDS);

  const manager = await prisma.staff.upsert({
    where: { mail: 'manager@hotel.com' },
    update: {},
    create: {
      staffType: 2, // MANAGER
      staffName: 'Nguyen Van Binh',
      staffNameEn: 'Nguyen Van Binh',
      staffNameShort: 'Binh',
      sex: 1,
      mail: 'manager@hotel.com',
      loginPassword: managerPassword,
      tel: '090-1234-5678',
      dataStatus: 1,
      orderNum: 2,
      displayInAttendance: true,
      createdBy: { connect: { staffId: admin.staffId } },
      updatedBy: { connect: { staffId: admin.staffId } },
    },
  });

  console.log(`  Manager created: ${manager.mail} (ID: ${manager.staffId})`);

  // ─── Staff members ─────────────────────────────────
  const staffPassword = await bcrypt.hash('staff123', BCRYPT_ROUNDS);

  const staffMembers = [
    {
      staffType: 3, // STAFF
      staffName: 'Tran Thi Cam',
      staffNameEn: 'Tran Thi Cam',
      staffNameShort: 'Cam',
      sex: 2,
      mail: 'cam.tran@hotel.com',
      tel: '090-2345-6789',
      orderNum: 3,
    },
    {
      staffType: 3,
      staffName: 'Le Van Duc',
      staffNameEn: 'Le Van Duc',
      staffNameShort: 'Duc',
      sex: 1,
      mail: 'duc.le@hotel.com',
      tel: '090-3456-7890',
      orderNum: 4,
    },
    {
      staffType: 3,
      staffName: 'Pham Thi Em',
      staffNameEn: 'Pham Thi Em',
      staffNameShort: 'Em',
      sex: 2,
      mail: 'em.pham@hotel.com',
      tel: '090-4567-8901',
      orderNum: 5,
    },
  ] as const;

  for (const data of staffMembers) {
    const staff = await prisma.staff.upsert({
      where: { mail: data.mail },
      update: {},
      create: {
        ...data,
        loginPassword: staffPassword,
        dataStatus: 1,
        displayInAttendance: true,
        createdBy: { connect: { staffId: admin.staffId } },
        updatedBy: { connect: { staffId: admin.staffId } },
      },
    });
    console.log(`  Staff created: ${staff.mail} (ID: ${staff.staffId})`);
  }

  // ─── Part-time staff ───────────────────────────────
  const partTimePassword = await bcrypt.hash('parttime123', BCRYPT_ROUNDS);

  const partTimeMembers = [
    {
      staffType: 4, // PART_TIME
      staffName: 'Hoang Van Phuc',
      staffNameEn: 'Hoang Van Phuc',
      staffNameShort: 'Phuc',
      sex: 1,
      mail: 'phuc.hoang@hotel.com',
      tel: '080-5678-9012',
      orderNum: 6,
    },
    {
      staffType: 4,
      staffName: 'Vo Thi Giang',
      staffNameEn: 'Vo Thi Giang',
      staffNameShort: 'Giang',
      sex: 2,
      mail: 'giang.vo@hotel.com',
      tel: '080-6789-0123',
      orderNum: 7,
    },
  ] as const;

  for (const data of partTimeMembers) {
    const staff = await prisma.staff.upsert({
      where: { mail: data.mail },
      update: {},
      create: {
        ...data,
        loginPassword: partTimePassword,
        dataStatus: 1,
        displayInAttendance: true,
        createdBy: { connect: { staffId: admin.staffId } },
        updatedBy: { connect: { staffId: admin.staffId } },
      },
    });
    console.log(`  Part-time created: ${staff.mail} (ID: ${staff.staffId})`);
  }

  // ─── Inactive staff (for testing filter) ───────────
  const inactive = await prisma.staff.upsert({
    where: { mail: 'inactive@hotel.com' },
    update: {},
    create: {
      staffType: 3,
      staffName: 'Nguyen Van Hung',
      staffNameEn: 'Nguyen Van Hung',
      staffNameShort: 'Hung',
      sex: 1,
      mail: 'inactive@hotel.com',
      loginPassword: staffPassword,
      dataStatus: 0, // UNAVAILABLE
      orderNum: 99,
      displayInAttendance: false,
      createdBy: { connect: { staffId: admin.staffId } },
      updatedBy: { connect: { staffId: admin.staffId } },
    },
  });

  console.log(`  Inactive created: ${inactive.mail} (ID: ${inactive.staffId})`);

  await prisma.$disconnect();

  console.log('\nSeed completed successfully!');
  console.log('\nLogin credentials:');
  console.log('  Admin:     admin@hotel.com     / admin123');
  console.log('  Manager:   manager@hotel.com   / manager123');
  console.log('  Staff:     cam.tran@hotel.com  / staff123');
  console.log('  Part-time: phuc.hoang@hotel.com / parttime123');
}

main().catch((e: unknown) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
