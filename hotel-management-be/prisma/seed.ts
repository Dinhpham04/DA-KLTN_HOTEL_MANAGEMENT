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
      staffName: 'Quan Tri Vien',
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
      tel: '0901234567',
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
      tel: '0902345678',
      orderNum: 3,
    },
    {
      staffType: 3,
      staffName: 'Le Van Duc',
      staffNameEn: 'Le Van Duc',
      staffNameShort: 'Duc',
      sex: 1,
      mail: 'duc.le@hotel.com',
      tel: '0903456789',
      orderNum: 4,
    },
    {
      staffType: 3,
      staffName: 'Pham Thi Em',
      staffNameEn: 'Pham Thi Em',
      staffNameShort: 'Em',
      sex: 2,
      mail: 'em.pham@hotel.com',
      tel: '0904567890',
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
      tel: '0385678901',
      orderNum: 6,
    },
    {
      staffType: 4,
      staffName: 'Vo Thi Giang',
      staffNameEn: 'Vo Thi Giang',
      staffNameShort: 'Giang',
      sex: 2,
      mail: 'giang.vo@hotel.com',
      tel: '0386789012',
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

  // ─── Countries ──────────────────────────────────────
  console.log('\nSeeding countries...');

  const countriesData = [
    { countryName: 'Viet Nam', countryNameEn: 'Vietnam', code: 'VN', orderNum: 1 },
    { countryName: 'Nhat Ban', countryNameEn: 'Japan', code: 'JP', orderNum: 2 },
    { countryName: 'Hoa Ky', countryNameEn: 'United States', code: 'US', orderNum: 3 },
    { countryName: 'Trung Quoc', countryNameEn: 'China', code: 'CN', orderNum: 4 },
    { countryName: 'Han Quoc', countryNameEn: 'South Korea', code: 'KR', orderNum: 5 },
    { countryName: 'Thai Lan', countryNameEn: 'Thailand', code: 'TH', orderNum: 6 },
    { countryName: 'Campuchia', countryNameEn: 'Cambodia', code: 'KH', orderNum: 7 },
  ];

  for (const data of countriesData) {
    const country = await prisma.country.create({
      data: {
        ...data,
        createdBy: { connect: { staffId: admin.staffId } },
      },
    });
    console.log(`  Country created: ${country.countryName} (ID: ${country.countryId})`);
  }

  // ─── Facilities ─────────────────────────────────────
  console.log('\nSeeding facilities...');

  const facility1 = await prisma.facility.create({
    data: {
      facilityType: 1, // HOTEL
      facilityNo: '001',
      facilityName: 'Khach san Saigon Central',
      facilityNameEn: 'Saigon Central Hotel',
      zipCode: '700000',
      address: '123 Nguyen Hue, Phuong Ben Nghe, Quan 1, TP. Ho Chi Minh',
      addressEn: '123 Nguyen Hue, Ben Nghe Ward, District 1, Ho Chi Minh City',
      keyFunction: true,
      parkingFlag: true,
      deliveryboxFlag: true,
      orderNum: 1,
      colorOption: '#4A90D9',
      createdBy: { connect: { staffId: admin.staffId } },
    },
  });
  console.log(`  Facility created: ${facility1.facilityName} (ID: ${facility1.facilityId})`);

  const facility2 = await prisma.facility.create({
    data: {
      facilityType: 1, // HOTEL
      facilityNo: '002',
      facilityName: 'Khach san Saigon Riverside',
      facilityNameEn: 'Saigon Riverside Hotel',
      zipCode: '700000',
      address: '45 Ton Duc Thang, Phuong Ben Nghe, Quan 1, TP. Ho Chi Minh',
      addressEn: '45 Ton Duc Thang, Ben Nghe Ward, District 1, Ho Chi Minh City',
      keyFunction: true,
      parkingFlag: false,
      bicycleParkingFlag: true,
      orderNum: 2,
      colorOption: '#50C878',
      createdBy: { connect: { staffId: admin.staffId } },
    },
  });
  console.log(`  Facility created: ${facility2.facilityName} (ID: ${facility2.facilityId})`);

  const facility3 = await prisma.facility.create({
    data: {
      facilityType: 2, // TRUNK_ROOM
      facilityNo: '003',
      facilityName: 'Kho luu tru Tan Binh',
      facilityNameEn: 'Tan Binh Storage Center',
      zipCode: '700000',
      address: '78 Cong Hoa, Phuong 4, Quan Tan Binh, TP. Ho Chi Minh',
      addressEn: '78 Cong Hoa, Ward 4, Tan Binh District, Ho Chi Minh City',
      orderNum: 3,
      createdBy: { connect: { staffId: admin.staffId } },
    },
  });
  console.log(`  Facility created: ${facility3.facilityName} (ID: ${facility3.facilityId})`);

  // ─── Room Classes ───────────────────────────────────
  console.log('\nSeeding room classes...');

  const roomClassStandard = await prisma.roomClass.create({
    data: {
      roomClassName: 'Standard',
      orderNum: 1,
      createdBy: { connect: { staffId: admin.staffId } },
    },
  });
  console.log(
    `  RoomClass created: ${roomClassStandard.roomClassName} (ID: ${roomClassStandard.roomClassId})`,
  );

  const roomClassDeluxe = await prisma.roomClass.create({
    data: {
      roomClassName: 'Deluxe',
      orderNum: 2,
      createdBy: { connect: { staffId: admin.staffId } },
    },
  });
  console.log(
    `  RoomClass created: ${roomClassDeluxe.roomClassName} (ID: ${roomClassDeluxe.roomClassId})`,
  );

  const roomClassSuite = await prisma.roomClass.create({
    data: {
      roomClassName: 'Suite',
      orderNum: 3,
      createdBy: { connect: { staffId: admin.staffId } },
    },
  });
  console.log(
    `  RoomClass created: ${roomClassSuite.roomClassName} (ID: ${roomClassSuite.roomClassId})`,
  );

  // ─── Room Types ─────────────────────────────────────
  console.log('\nSeeding room types...');

  const roomTypeSingle = await prisma.roomType.create({
    data: {
      roomClass: { connect: { roomClassId: roomClassStandard.roomClassId } },
      roomTypeName: 'Phong Don',
      roomTypeNameShort: 'SGL',
      acreage: 18,
      orderNum: 1,
      createdBy: { connect: { staffId: admin.staffId } },
    },
  });
  console.log(
    `  RoomType created: ${roomTypeSingle.roomTypeName} (ID: ${roomTypeSingle.roomTypeId})`,
  );

  const roomTypeDouble = await prisma.roomType.create({
    data: {
      roomClass: { connect: { roomClassId: roomClassStandard.roomClassId } },
      roomTypeName: 'Phong Doi',
      roomTypeNameShort: 'DBL',
      acreage: 25,
      orderNum: 2,
      createdBy: { connect: { staffId: admin.staffId } },
    },
  });
  console.log(
    `  RoomType created: ${roomTypeDouble.roomTypeName} (ID: ${roomTypeDouble.roomTypeId})`,
  );

  const roomTypeTwin = await prisma.roomType.create({
    data: {
      roomClass: { connect: { roomClassId: roomClassDeluxe.roomClassId } },
      roomTypeName: 'Phong Twin',
      roomTypeNameShort: 'TWN',
      acreage: 30,
      orderNum: 3,
      createdBy: { connect: { staffId: admin.staffId } },
    },
  });
  console.log(`  RoomType created: ${roomTypeTwin.roomTypeName} (ID: ${roomTypeTwin.roomTypeId})`);

  const roomTypeDeluxeDouble = await prisma.roomType.create({
    data: {
      roomClass: { connect: { roomClassId: roomClassDeluxe.roomClassId } },
      roomTypeName: 'Deluxe Doi',
      roomTypeNameShort: 'DDBL',
      acreage: 35,
      orderNum: 4,
      createdBy: { connect: { staffId: admin.staffId } },
    },
  });
  console.log(
    `  RoomType created: ${roomTypeDeluxeDouble.roomTypeName} (ID: ${roomTypeDeluxeDouble.roomTypeId})`,
  );

  const roomTypeSuiteRoom = await prisma.roomType.create({
    data: {
      roomClass: { connect: { roomClassId: roomClassSuite.roomClassId } },
      roomTypeName: 'Phong Suite',
      roomTypeNameShort: 'STE',
      acreage: 50,
      orderNum: 5,
      createdBy: { connect: { staffId: admin.staffId } },
    },
  });
  console.log(
    `  RoomType created: ${roomTypeSuiteRoom.roomTypeName} (ID: ${roomTypeSuiteRoom.roomTypeId})`,
  );

  // ─── Rooms ──────────────────────────────────────────
  console.log('\nSeeding rooms...');

  const roomsData = [
    // Saigon Central - Standard Single
    {
      facilityId: facility1.facilityId,
      roomTypeId: roomTypeSingle.roomTypeId,
      roomNumber: '101',
      roomStatus: 1,
      mailboxPassword: '1234',
      orderNum: 1,
    },
    {
      facilityId: facility1.facilityId,
      roomTypeId: roomTypeSingle.roomTypeId,
      roomNumber: '102',
      roomStatus: 1,
      mailboxPassword: '1235',
      orderNum: 2,
    },
    {
      facilityId: facility1.facilityId,
      roomTypeId: roomTypeSingle.roomTypeId,
      roomNumber: '103',
      roomStatus: 2,
      mailboxPassword: '1236',
      orderNum: 3,
    },
    // Saigon Central - Standard Double
    {
      facilityId: facility1.facilityId,
      roomTypeId: roomTypeDouble.roomTypeId,
      roomNumber: '201',
      roomStatus: 1,
      mailboxPassword: '2234',
      orderNum: 4,
    },
    {
      facilityId: facility1.facilityId,
      roomTypeId: roomTypeDouble.roomTypeId,
      roomNumber: '202',
      roomStatus: 3,
      mailboxPassword: '2235',
      orderNum: 5,
    },
    // Saigon Central - Deluxe Twin
    {
      facilityId: facility1.facilityId,
      roomTypeId: roomTypeTwin.roomTypeId,
      roomNumber: '301',
      roomStatus: 1,
      mailboxPassword: '3234',
      orderNum: 6,
    },
    {
      facilityId: facility1.facilityId,
      roomTypeId: roomTypeTwin.roomTypeId,
      roomNumber: '302',
      roomStatus: 1,
      mailboxPassword: '3235',
      orderNum: 7,
    },
    // Saigon Central - Suite
    {
      facilityId: facility1.facilityId,
      roomTypeId: roomTypeSuiteRoom.roomTypeId,
      roomNumber: '501',
      roomStatus: 1,
      mailboxPassword: '5234',
      orderNum: 8,
    },
    // Saigon Riverside - Standard Single
    {
      facilityId: facility2.facilityId,
      roomTypeId: roomTypeSingle.roomTypeId,
      roomNumber: 'R101',
      roomStatus: 1,
      mailboxPassword: 'R123',
      orderNum: 9,
    },
    {
      facilityId: facility2.facilityId,
      roomTypeId: roomTypeSingle.roomTypeId,
      roomNumber: 'R102',
      roomStatus: 2,
      mailboxPassword: 'R124',
      orderNum: 10,
    },
    // Saigon Riverside - Deluxe Double
    {
      facilityId: facility2.facilityId,
      roomTypeId: roomTypeDeluxeDouble.roomTypeId,
      roomNumber: 'R201',
      roomStatus: 1,
      mailboxPassword: 'R223',
      orderNum: 11,
    },
    {
      facilityId: facility2.facilityId,
      roomTypeId: roomTypeDeluxeDouble.roomTypeId,
      roomNumber: 'R202',
      roomStatus: 1,
      mailboxPassword: 'R224',
      orderNum: 12,
    },
  ];

  for (const data of roomsData) {
    const room = await prisma.room.create({
      data: {
        ...data,
        createdStaffId: admin.staffId,
      },
    });
    console.log(`  Room created: ${room.roomNumber} (ID: ${room.roomId})`);
  }

  // ─── Stay Types ─────────────────────────────────────
  console.log('\nSeeding stay types...');

  const stayTypesData = [
    {
      stayContractTypeId: 1,
      stayTypeName: 'Luu tru theo tuan',
      stayTypeNameEn: 'Weekly Stay',
      stayTypeNameShort: 'WK',
      orderNum: 1,
    },
    {
      stayContractTypeId: 1,
      stayTypeName: 'Luu tru 2 tuan',
      stayTypeNameEn: 'Bi-Weekly Stay',
      stayTypeNameShort: 'BWK',
      orderNum: 2,
    },
    {
      stayContractTypeId: 2,
      stayTypeName: 'Luu tru theo thang',
      stayTypeNameEn: 'Monthly Stay',
      stayTypeNameShort: 'MN',
      orderNum: 3,
    },
    {
      stayContractTypeId: 2,
      stayTypeName: 'Luu tru dai han',
      stayTypeNameEn: 'Long-term Stay',
      stayTypeNameShort: 'LT',
      orderNum: 4,
    },
  ];

  for (const data of stayTypesData) {
    const stayType = await prisma.stayType.create({
      data: {
        ...data,
        createdBy: { connect: { staffId: admin.staffId } },
      },
    });
    console.log(`  StayType created: ${stayType.stayTypeName} (ID: ${stayType.stayTypeId})`);
  }

  await prisma.$disconnect();

  console.log('\nSeed completed successfully!');
  console.log('\nLogin credentials:');
  console.log('  Admin:     admin@hotel.com      / admin123');
  console.log('  Manager:   manager@hotel.com    / manager123');
  console.log('  Staff:     cam.tran@hotel.com   / staff123');
  console.log('  Part-time: phuc.hoang@hotel.com / parttime123');
  console.log('\nSample data:');
  console.log('  Countries:   7 (VN, JP, US, CN, KR, TH, KH)');
  console.log('  Facilities:  3 (Saigon Central, Saigon Riverside, Kho Tan Binh)');
  console.log('  RoomClasses: 3 (Standard, Deluxe, Suite)');
  console.log('  RoomTypes:   5 (Phong Don, Phong Doi, Phong Twin, Deluxe Doi, Phong Suite)');
  console.log('  Rooms:       12 (8 Saigon Central + 4 Saigon Riverside)');
  console.log('  StayTypes:   4 (Tuan, 2 Tuan, Thang, Dai han)');
}

main().catch((e: unknown) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
