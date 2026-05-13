import 'dotenv/config';
import { PrismaClient, type Prisma } from '@prisma/client';
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
      staffName: 'Quản Trị Viên',
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
      staffName: 'Nguyễn Văn Bình',
      staffNameEn: 'Nguyen Van Binh',
      staffNameShort: 'Bình',
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
      staffName: 'Trần Thị Cẩm',
      staffNameEn: 'Tran Thi Cam',
      staffNameShort: 'Cẩm',
      sex: 2,
      mail: 'cam.tran@hotel.com',
      tel: '0902345678',
      orderNum: 3,
    },
    {
      staffType: 3,
      staffName: 'Lê Văn Đức',
      staffNameEn: 'Le Van Duc',
      staffNameShort: 'Đức',
      sex: 1,
      mail: 'duc.le@hotel.com',
      tel: '0903456789',
      orderNum: 4,
    },
    {
      staffType: 3,
      staffName: 'Phạm Thị Em',
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
      staffName: 'Hoàng Văn Phúc',
      staffNameEn: 'Hoang Van Phuc',
      staffNameShort: 'Phúc',
      sex: 1,
      mail: 'phuc.hoang@hotel.com',
      tel: '0385678901',
      orderNum: 6,
    },
    {
      staffType: 4,
      staffName: 'Võ Thị Giang',
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
      staffName: 'Nguyễn Văn Hùng',
      staffNameEn: 'Nguyen Van Hung',
      staffNameShort: 'Hùng',
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
    { countryName: 'Việt Nam', countryNameEn: 'Vietnam', code: 'VN', orderNum: 1 },
    { countryName: 'Nhật Bản', countryNameEn: 'Japan', code: 'JP', orderNum: 2 },
    { countryName: 'Hoa Kỳ', countryNameEn: 'United States', code: 'US', orderNum: 3 },
    { countryName: 'Trung Quốc', countryNameEn: 'China', code: 'CN', orderNum: 4 },
    { countryName: 'Hàn Quốc', countryNameEn: 'South Korea', code: 'KR', orderNum: 5 },
    { countryName: 'Thái Lan', countryNameEn: 'Thailand', code: 'TH', orderNum: 6 },
    { countryName: 'Campuchia', countryNameEn: 'Cambodia', code: 'KH', orderNum: 7 },
  ];

  const countries = [];
  for (const data of countriesData) {
    let country = await prisma.country.findFirst({ where: { code: data.code } });
    if (!country) {
      country = await prisma.country.create({
        data: { ...data, createdBy: { connect: { staffId: admin.staffId } } },
      });
    }
    countries.push(country);
    console.log(`  Country: ${country.countryNameEn} (ID: ${country.countryId})`);
  }

  const [countryVN, , countryUS, , countryKR] = countries;

  // ═════════════════════════════════════════════════════
  // ─── Room Classes (5 classes, based on original SQL) ─
  // ═════════════════════════════════════════════════════
  console.log('\nSeeding room classes...');

  const roomClassesData = [
    { roomClassName: 'E-FLAT', orderNum: 1 },
    { roomClassName: 'SINGLE', orderNum: 2 },
    { roomClassName: 'TWIN', orderNum: 3 },
    { roomClassName: 'FAMILY', orderNum: 4 },
    { roomClassName: 'SUITE', orderNum: 5 },
  ];

  const roomClasses = [];
  for (const data of roomClassesData) {
    let rc = await prisma.roomClass.findFirst({ where: { roomClassName: data.roomClassName } });
    if (!rc) {
      rc = await prisma.roomClass.create({
        data: { ...data, createdBy: { connect: { staffId: admin.staffId } } },
      });
    }
    roomClasses.push(rc);
    console.log(`  RoomClass: ${rc.roomClassName} (ID: ${rc.roomClassId})`);
  }

  const [rcEFlat, rcSingle, rcTwin, rcFamily, rcSuite] = roomClasses;

  // ═════════════════════════════════════════════════════
  // ─── Room Types (17 types, based on original SQL) ────
  // ═════════════════════════════════════════════════════
  console.log('\nSeeding room types...');

  const roomTypesData = [
    // E-FLAT class
    { roomClassId: rcEFlat.roomClassId, roomTypeName: 'E-FLAT - (8)', roomTypeNameShort: 'EF(8)', acreage: 15, orderNum: 4, orderNumDeposit: 4 },
    { roomClassId: rcEFlat.roomClassId, roomTypeName: 'E-FLAT -', roomTypeNameShort: 'EF', acreage: 14, orderNum: 3, orderNumDeposit: 3 },
    { roomClassId: rcEFlat.roomClassId, roomTypeName: 'E-FLAT - L', roomTypeNameShort: 'EF-L', acreage: 16, orderNum: 2, orderNumDeposit: 2 },
    { roomClassId: rcEFlat.roomClassId, roomTypeName: 'E-FLAT - LL', roomTypeNameShort: 'EF-LL', acreage: 17, orderNum: 3, orderNumDeposit: 3 },
    // SINGLE class
    { roomClassId: rcSingle.roomClassId, roomTypeName: 'SINGLE - A-Type', roomTypeNameShort: 'SA', acreage: null, orderNum: 1, orderNumDeposit: 1 },
    { roomClassId: rcSingle.roomClassId, roomTypeName: 'SINGLE - B-Type', roomTypeNameShort: 'SB', acreage: null, orderNum: 2, orderNumDeposit: 1 },
    { roomClassId: rcSingle.roomClassId, roomTypeName: 'SINGLE - C-Type', roomTypeNameShort: 'SC', acreage: null, orderNum: 3, orderNumDeposit: 1 },
    { roomClassId: rcSingle.roomClassId, roomTypeName: 'SINGLE - D-Type', roomTypeNameShort: 'SD', acreage: null, orderNum: 4, orderNumDeposit: null },
    // TWIN class
    { roomClassId: rcTwin.roomClassId, roomTypeName: 'TWIN - A-Type', roomTypeNameShort: 'TA', acreage: null, orderNum: 5, orderNumDeposit: 2 },
    { roomClassId: rcTwin.roomClassId, roomTypeName: 'TWIN - B-Type', roomTypeNameShort: 'TB', acreage: null, orderNum: 6, orderNumDeposit: 1 },
    { roomClassId: rcTwin.roomClassId, roomTypeName: 'TWIN - C-Type', roomTypeNameShort: 'TC', acreage: null, orderNum: 7, orderNumDeposit: null },
    { roomClassId: rcTwin.roomClassId, roomTypeName: 'TWIN - D-Type', roomTypeNameShort: 'TD', acreage: null, orderNum: 8, orderNumDeposit: 4 },
    // FAMILY class
    { roomClassId: rcFamily.roomClassId, roomTypeName: 'FAMILY - A-Type', roomTypeNameShort: 'FA', acreage: null, orderNum: 9, orderNumDeposit: null },
    { roomClassId: rcFamily.roomClassId, roomTypeName: 'FAMILY - B-Type', roomTypeNameShort: 'FB', acreage: null, orderNum: 11, orderNumDeposit: null },
    { roomClassId: rcFamily.roomClassId, roomTypeName: 'FAMILY - C-Type', roomTypeNameShort: 'FC', acreage: null, orderNum: 12, orderNumDeposit: null },
    { roomClassId: rcFamily.roomClassId, roomTypeName: 'FAMILY - S-Type', roomTypeNameShort: 'FS', acreage: null, orderNum: 13, orderNumDeposit: 0 },
    // SUITE class
    { roomClassId: rcSuite.roomClassId, roomTypeName: 'Owners Suite', roomTypeNameShort: 'OS', acreage: null, orderNum: 12, orderNumDeposit: 1 },
  ];

  const roomTypes = [];
  for (const { roomClassId, ...rest } of roomTypesData) {
    let rt = await prisma.roomType.findFirst({ where: { roomTypeNameShort: rest.roomTypeNameShort } });
    if (!rt) {
      rt = await prisma.roomType.create({
        data: {
          ...rest,
          roomClass: { connect: { roomClassId } },
          createdBy: { connect: { staffId: admin.staffId } },
        },
      });
    }
    roomTypes.push(rt);
    console.log(`  RoomType: ${rt.roomTypeNameShort} (ID: ${rt.roomTypeId})`);
  }

  // Build a lookup map by short name for easy reference
  const rtByShort: Record<string, (typeof roomTypes)[0]> = {};
  for (const rt of roomTypes) {
    rtByShort[rt.roomTypeNameShort] = rt;
  }

  // ═════════════════════════════════════════════════════
  // ─── Stay Types (7 types, translated from Japanese) ──
  // ═════════════════════════════════════════════════════
  console.log('\nSeeding stay types...');

  const stayTypesData = [
    { stayContractTypeId: 1, stayTypeName: '1-6 đêm', stayTypeNameEn: '1-6 nights', stayTypeNameShort: 'A', orderNum: 1 },
    { stayContractTypeId: 1, stayTypeName: '7 đêm - dưới 1 tháng', stayTypeNameEn: '7 nights - under 1 month', stayTypeNameShort: 'B', orderNum: 2 },
    { stayContractTypeId: 1, stayTypeName: 'Thanh toán theo tuần', stayTypeNameEn: 'Weekly payment', stayTypeNameShort: 'C', orderNum: 3 },
    { stayContractTypeId: 2, stayTypeName: '1 tháng trở lên', stayTypeNameEn: '1 month or more', stayTypeNameShort: 'D', orderNum: 4 },
    { stayContractTypeId: 2, stayTypeName: '1-3 tháng', stayTypeNameEn: '1-3 months', stayTypeNameShort: 'E', orderNum: 5 },
    { stayContractTypeId: 2, stayTypeName: '3-7 tháng', stayTypeNameEn: '3-7 months', stayTypeNameShort: 'F', orderNum: 6 },
    { stayContractTypeId: 2, stayTypeName: 'Trên 7 tháng', stayTypeNameEn: 'Over 7 months', stayTypeNameShort: 'G', orderNum: 7 },
  ];

  const stayTypes = [];
  for (const data of stayTypesData) {
    let st = await prisma.stayType.findFirst({ where: { stayTypeNameShort: data.stayTypeNameShort } });
    if (!st) {
      st = await prisma.stayType.create({
        data: { ...data, createdBy: { connect: { staffId: admin.staffId } } },
      });
    } else if (st.stayContractTypeId !== data.stayContractTypeId) {
      st = await prisma.stayType.update({
        where: { stayTypeId: st.stayTypeId },
        data: { stayContractTypeId: data.stayContractTypeId },
      });
    }
    stayTypes.push(st);
    console.log(`  StayType: ${st.stayTypeName} [${st.stayTypeNameShort}] (ID: ${st.stayTypeId}, contractType: ${st.stayContractTypeId})`);
  }

  // ═════════════════════════════════════════════════════
  // ─── Facilities (10 facilities, Vietnamese data) ─────
  // ═════════════════════════════════════════════════════
  console.log('\nSeeding facilities...');

  const facilitiesData = [
    {
      facilityNo: '01',
      facilityType: 1,
      dataStatus: 1,
      facilityName: 'Tòa nhà Số 1 Bến Thành',
      facilityNameEn: 'No.1 Ben Thanh',
      zipCode: '700000',
      address: '123 Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
      addressEn: '123 Le Loi, Ben Thanh Ward, District 1, Ho Chi Minh City',
      keyFunction: false,
      sharePlaceFlag: true,
      parkingFlag: true,
      bicycleParkingFlag: false,
      deliveryboxFlag: false,
      orderNum: 1,
      colorOption: '#3a84f2',
    },
    {
      facilityNo: '02',
      facilityType: 1,
      dataStatus: 1,
      facilityName: 'Tòa nhà Số 2 Nguyễn Huệ',
      facilityNameEn: 'No.2 Nguyen Hue',
      zipCode: '700000',
      address: '45 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      addressEn: '45 Nguyen Hue, Ben Nghe Ward, District 1, Ho Chi Minh City',
      keyFunction: false,
      sharePlaceFlag: false,
      parkingFlag: true,
      bicycleParkingFlag: true,
      deliveryboxFlag: false,
      orderNum: 2,
      colorOption: '#ce8403',
    },
    {
      facilityNo: '03',
      facilityType: 1,
      dataStatus: 1,
      facilityName: 'Tòa nhà Số 3 Hai Bà Trưng',
      facilityNameEn: 'No.3 Hai Ba Trung',
      zipCode: '700000',
      address: '78 Hai Bà Trưng, Phường Tân Định, Quận 1, TP. Hồ Chí Minh',
      addressEn: '78 Hai Ba Trung, Tan Dinh Ward, District 1, Ho Chi Minh City',
      keyFunction: false,
      sharePlaceFlag: false,
      parkingFlag: false,
      bicycleParkingFlag: false,
      deliveryboxFlag: false,
      memo: 'Không hút thuốc',
      orderNum: 3,
      colorOption: '#ff4294',
    },
    {
      facilityNo: '04',
      facilityType: 1,
      dataStatus: 1,
      facilityName: 'Tòa nhà Phú Mỹ Hưng',
      facilityNameEn: 'Phu My Hung Building',
      zipCode: '700000',
      address: '15 Nguyễn Lương Bằng, Phường Tân Phú, Quận 7, TP. Hồ Chí Minh',
      addressEn: '15 Nguyen Luong Bang, Tan Phu Ward, District 7, Ho Chi Minh City',
      keyFunction: true,
      sharePlaceFlag: false,
      parkingFlag: true,
      bicycleParkingFlag: true,
      deliveryboxFlag: true,
      orderNum: 4,
      colorOption: '#00ff2a',
    },
    {
      facilityNo: '05',
      facilityType: 1,
      dataStatus: 1,
      facilityName: 'Tòa nhà Thủ Đức',
      facilityNameEn: 'Thu Duc Building',
      zipCode: '700000',
      address: '200 Võ Văn Ngân, Phường Bình Thọ, TP. Thủ Đức, TP. Hồ Chí Minh',
      addressEn: '200 Vo Van Ngan, Binh Tho Ward, Thu Duc City, Ho Chi Minh City',
      keyFunction: false,
      sharePlaceFlag: true,
      parkingFlag: false,
      bicycleParkingFlag: false,
      deliveryboxFlag: false,
      orderNum: 5,
      colorOption: '#805bd7',
    },
    {
      facilityNo: '06',
      facilityType: 1,
      dataStatus: 1,
      facilityName: 'Tòa nhà Đà Nẵng Beach',
      facilityNameEn: 'Da Nang Beach Building',
      zipCode: '550000',
      address: '88 Võ Nguyên Giáp, Phường Phước Mỹ, Quận Sơn Trà, TP. Đà Nẵng',
      addressEn: '88 Vo Nguyen Giap, Phuoc My Ward, Son Tra District, Da Nang City',
      keyFunction: false,
      sharePlaceFlag: false,
      parkingFlag: true,
      bicycleParkingFlag: true,
      deliveryboxFlag: true,
      orderNum: 6,
      colorOption: '#ffd29e',
    },
    {
      facilityNo: '07',
      facilityType: 1,
      dataStatus: 1,
      facilityName: 'Tòa nhà Hội An',
      facilityNameEn: 'Hoi An Building',
      zipCode: '560000',
      address: '30 Trần Hưng Đạo, Phường Sơn Phong, TP. Hội An, Quảng Nam',
      addressEn: '30 Tran Hung Dao, Son Phong Ward, Hoi An City, Quang Nam',
      keyFunction: false,
      sharePlaceFlag: false,
      parkingFlag: true,
      bicycleParkingFlag: false,
      deliveryboxFlag: false,
      memo: 'Cho phép thú cưng',
      orderNum: 7,
      colorOption: '#bdf2ff',
    },
    {
      facilityNo: '08',
      facilityType: 1,
      dataStatus: 1,
      facilityName: 'Tòa nhà Hà Nội Old Quarter',
      facilityNameEn: 'Ha Noi Old Quarter',
      zipCode: '100000',
      address: '15 Hàng Bài, Phường Tràng Tiền, Quận Hoàn Kiếm, TP. Hà Nội',
      addressEn: '15 Hang Bai, Trang Tien Ward, Hoan Kiem District, Ha Noi City',
      keyFunction: true,
      sharePlaceFlag: false,
      parkingFlag: false,
      bicycleParkingFlag: true,
      deliveryboxFlag: true,
      memo: 'Nam giới chuyên dụng',
      orderNum: 8,
      colorOption: '#e66f00',
    },
    {
      facilityNo: '09',
      facilityType: 1,
      dataStatus: 1,
      facilityName: 'Tòa nhà Nha Trang',
      facilityNameEn: 'Nha Trang Building',
      zipCode: '650000',
      address: '55 Trần Phú, Phường Lộc Thọ, TP. Nha Trang, Khánh Hòa',
      addressEn: '55 Tran Phu, Loc Tho Ward, Nha Trang City, Khanh Hoa',
      keyFunction: false,
      sharePlaceFlag: false,
      parkingFlag: true,
      bicycleParkingFlag: false,
      deliveryboxFlag: false,
      orderNum: 9,
      colorOption: '#6185b8',
    },
    {
      facilityNo: '10',
      facilityType: 1,
      dataStatus: 0, // Inactive facility for testing
      facilityName: 'Tòa nhà Cần Thơ (Ngừng hoạt động)',
      facilityNameEn: 'Can Tho Building (Inactive)',
      zipCode: '900000',
      address: '10 Hòa Bình, Phường An Hòa, Quận Ninh Kiều, TP. Cần Thơ',
      addressEn: '10 Hoa Binh, An Hoa Ward, Ninh Kieu District, Can Tho City',
      keyFunction: false,
      sharePlaceFlag: false,
      parkingFlag: false,
      bicycleParkingFlag: false,
      deliveryboxFlag: false,
      orderNum: 10,
      colorOption: '#b5b5b5',
    },
  ];

  const facilities: Awaited<ReturnType<typeof prisma.facility.create>>[] = [];
  for (const data of facilitiesData) {
    let facility = await prisma.facility.findFirst({ where: { facilityNo: data.facilityNo } });
    if (!facility) {
      facility = await prisma.facility.create({
        data: { ...data, createdBy: { connect: { staffId: admin.staffId } } },
      });
    }
    facilities.push(facility);
    console.log(`  Facility: ${facility.facilityName} [${facility.facilityNo}] (ID: ${facility.facilityId})`);
  }

  // ═════════════════════════════════════════════════════
  // ─── Rooms (~40 rooms distributed across facilities) ─
  // ═════════════════════════════════════════════════════
  console.log('\nSeeding rooms...');

  const f = (no: string) => facilities.find((f) => f.facilityNo === no)!;
  const rt = (short: string) => rtByShort[short];

  const roomsData = [
    // Facility 01 - Bến Thành (7 rooms)
    { facilityId: f('01').facilityId, roomTypeId: rt('SA').roomTypeId, roomNumber: '101', roomStatus: 1, mailboxPassword: 'bt1234', orderNum: 1 },
    { facilityId: f('01').facilityId, roomTypeId: rt('SA').roomTypeId, roomNumber: '102', roomStatus: 1, mailboxPassword: 'bt1235', orderNum: 2 },
    { facilityId: f('01').facilityId, roomTypeId: rt('SB').roomTypeId, roomNumber: '201', roomStatus: 1, mailboxPassword: 'bt2234', orderNum: 3 },
    { facilityId: f('01').facilityId, roomTypeId: rt('SB').roomTypeId, roomNumber: '202', roomStatus: 1, mailboxPassword: 'bt2235', orderNum: 4 },
    { facilityId: f('01').facilityId, roomTypeId: rt('TA').roomTypeId, roomNumber: '301', roomStatus: 1, mailboxPassword: 'bt3234', orderNum: 5 },
    { facilityId: f('01').facilityId, roomTypeId: rt('FA').roomTypeId, roomNumber: '401', roomStatus: 1, mailboxPassword: 'bt4234', orderNum: 6 },
    { facilityId: f('01').facilityId, roomTypeId: rt('OS').roomTypeId, roomNumber: '501', roomStatus: 1, mailboxPassword: 'bt5234', orderNum: 7 },

    // Facility 02 - Nguyễn Huệ (6 rooms)
    { facilityId: f('02').facilityId, roomTypeId: rt('EF').roomTypeId, roomNumber: '101', roomStatus: 1, mailboxPassword: 'nh1234', orderNum: 1 },
    { facilityId: f('02').facilityId, roomTypeId: rt('EF').roomTypeId, roomNumber: '102', roomStatus: 1, mailboxPassword: 'nh1235', orderNum: 2 },
    { facilityId: f('02').facilityId, roomTypeId: rt('EF-L').roomTypeId, roomNumber: '201', roomStatus: 1, mailboxPassword: 'nh2234', orderNum: 3 },
    { facilityId: f('02').facilityId, roomTypeId: rt('EF-L').roomTypeId, roomNumber: '202', roomStatus: 2, mailboxPassword: 'nh2235', orderNum: 4 },
    { facilityId: f('02').facilityId, roomTypeId: rt('EF-LL').roomTypeId, roomNumber: '301', roomStatus: 1, mailboxPassword: 'nh3234', orderNum: 5 },
    { facilityId: f('02').facilityId, roomTypeId: rt('EF(8)').roomTypeId, roomNumber: '302', roomStatus: 1, mailboxPassword: 'nh3235', orderNum: 6 },

    // Facility 03 - Hai Bà Trưng (5 rooms)
    { facilityId: f('03').facilityId, roomTypeId: rt('SC').roomTypeId, roomNumber: '101', roomStatus: 1, mailboxPassword: 'hb1234', orderNum: 1 },
    { facilityId: f('03').facilityId, roomTypeId: rt('SC').roomTypeId, roomNumber: '102', roomStatus: 1, mailboxPassword: 'hb1235', orderNum: 2 },
    { facilityId: f('03').facilityId, roomTypeId: rt('SD').roomTypeId, roomNumber: '201', roomStatus: 1, mailboxPassword: 'hb2234', orderNum: 3 },
    { facilityId: f('03').facilityId, roomTypeId: rt('TB').roomTypeId, roomNumber: '301', roomStatus: 3, mailboxPassword: 'hb3234', orderNum: 4 },
    { facilityId: f('03').facilityId, roomTypeId: rt('TC').roomTypeId, roomNumber: '302', roomStatus: 1, mailboxPassword: 'hb3235', orderNum: 5 },

    // Facility 04 - Phú Mỹ Hưng (5 rooms)
    { facilityId: f('04').facilityId, roomTypeId: rt('SA').roomTypeId, roomNumber: '101', roomStatus: 1, mailboxPassword: 'pm1234', orderNum: 1 },
    { facilityId: f('04').facilityId, roomTypeId: rt('SB').roomTypeId, roomNumber: '201', roomStatus: 1, mailboxPassword: 'pm2234', orderNum: 2 },
    { facilityId: f('04').facilityId, roomTypeId: rt('TD').roomTypeId, roomNumber: '301', roomStatus: 1, mailboxPassword: 'pm3234', orderNum: 3 },
    { facilityId: f('04').facilityId, roomTypeId: rt('FB').roomTypeId, roomNumber: '401', roomStatus: 1, mailboxPassword: 'pm4234', orderNum: 4 },
    { facilityId: f('04').facilityId, roomTypeId: rt('FC').roomTypeId, roomNumber: '501', roomStatus: 1, mailboxPassword: 'pm5234', orderNum: 5 },

    // Facility 05 - Thủ Đức (4 rooms)
    { facilityId: f('05').facilityId, roomTypeId: rt('EF').roomTypeId, roomNumber: '101', roomStatus: 1, mailboxPassword: 'td1234', orderNum: 1 },
    { facilityId: f('05').facilityId, roomTypeId: rt('EF-L').roomTypeId, roomNumber: '201', roomStatus: 1, mailboxPassword: 'td2234', orderNum: 2 },
    { facilityId: f('05').facilityId, roomTypeId: rt('SA').roomTypeId, roomNumber: '301', roomStatus: 4, mailboxPassword: 'td3234', orderNum: 3 },
    { facilityId: f('05').facilityId, roomTypeId: rt('TA').roomTypeId, roomNumber: '401', roomStatus: 1, mailboxPassword: 'td4234', orderNum: 4 },

    // Facility 06 - Đà Nẵng (4 rooms)
    { facilityId: f('06').facilityId, roomTypeId: rt('SB').roomTypeId, roomNumber: '101', roomStatus: 1, mailboxPassword: 'dn1234', orderNum: 1 },
    { facilityId: f('06').facilityId, roomTypeId: rt('SC').roomTypeId, roomNumber: '201', roomStatus: 1, mailboxPassword: 'dn2234', orderNum: 2 },
    { facilityId: f('06').facilityId, roomTypeId: rt('TA').roomTypeId, roomNumber: '301', roomStatus: 1, mailboxPassword: 'dn3234', orderNum: 3 },
    { facilityId: f('06').facilityId, roomTypeId: rt('FA').roomTypeId, roomNumber: '401', roomStatus: 5, mailboxPassword: 'dn4234', orderNum: 4 },

    // Facility 07 - Hội An (3 rooms)
    { facilityId: f('07').facilityId, roomTypeId: rt('EF').roomTypeId, roomNumber: '101', roomStatus: 1, mailboxPassword: 'ha1234', orderNum: 1 },
    { facilityId: f('07').facilityId, roomTypeId: rt('EF-L').roomTypeId, roomNumber: '201', roomStatus: 1, mailboxPassword: 'ha2234', orderNum: 2 },
    { facilityId: f('07').facilityId, roomTypeId: rt('EF-LL').roomTypeId, roomNumber: '301', roomStatus: 1, mailboxPassword: 'ha3234', orderNum: 3 },

    // Facility 08 - Hà Nội (4 rooms)
    { facilityId: f('08').facilityId, roomTypeId: rt('SA').roomTypeId, roomNumber: '101', roomStatus: 1, mailboxPassword: 'hn1234', orderNum: 1 },
    { facilityId: f('08').facilityId, roomTypeId: rt('SB').roomTypeId, roomNumber: '201', roomStatus: 1, mailboxPassword: 'hn2234', orderNum: 2 },
    { facilityId: f('08').facilityId, roomTypeId: rt('TB').roomTypeId, roomNumber: '301', roomStatus: 1, mailboxPassword: 'hn3234', orderNum: 3 },
    { facilityId: f('08').facilityId, roomTypeId: rt('OS').roomTypeId, roomNumber: '401', roomStatus: 1, mailboxPassword: 'hn4234', orderNum: 4 },

    // Facility 09 - Nha Trang (3 rooms)
    { facilityId: f('09').facilityId, roomTypeId: rt('SC').roomTypeId, roomNumber: '101', roomStatus: 1, mailboxPassword: 'nt1234', orderNum: 1 },
    { facilityId: f('09').facilityId, roomTypeId: rt('TD').roomTypeId, roomNumber: '201', roomStatus: 1, mailboxPassword: 'nt2234', orderNum: 2 },
    { facilityId: f('09').facilityId, roomTypeId: rt('FS').roomTypeId, roomNumber: '301', roomStatus: 1, mailboxPassword: 'nt3234', orderNum: 3 },
  ];

  const rooms = [];
  for (const data of roomsData) {
    let room = await prisma.room.findFirst({
      where: { facilityId: data.facilityId, roomNumber: data.roomNumber },
    });
    if (!room) {
      room = await prisma.room.create({
        data: { ...data, createdStaffId: admin.staffId },
      });
    }
    rooms.push(room);
    console.log(`  Room: ${room.roomNumber} @ Facility ${data.facilityId} (ID: ${room.roomId})`);
  }

  // ═════════════════════════════════════════════════════
  // ─── Facility Room Types (pivot: acreage per facility+room_type)
  // ═════════════════════════════════════════════════════
  console.log('\nSeeding facility room types...');

  // Create facility_room_type entries for each facility with the room types it uses
  const facilityRoomTypesData: { facilityId: number; roomTypeId: number; acreage: string | null }[] = [];

  // For each room, ensure a FacilityRoomType exists
  const seenFacilityRoomType = new Set<string>();
  for (const room of roomsData) {
    const key = `${room.facilityId}-${room.roomTypeId}`;
    if (!seenFacilityRoomType.has(key)) {
      seenFacilityRoomType.add(key);
      facilityRoomTypesData.push({
        facilityId: room.facilityId,
        roomTypeId: room.roomTypeId,
        acreage: null,
      });
    }
  }

  // Add some specific acreage values for select facility-room type combinations
  const acreageOverrides: Record<string, string> = {
    [`${f('01').facilityId}-${rt('SA').roomTypeId}`]: '18',
    [`${f('01').facilityId}-${rt('SB').roomTypeId}`]: '22',
    [`${f('01').facilityId}-${rt('TA').roomTypeId}`]: '30',
    [`${f('01').facilityId}-${rt('FA').roomTypeId}`]: '36',
    [`${f('01').facilityId}-${rt('OS').roomTypeId}`]: '52',
    [`${f('02').facilityId}-${rt('EF').roomTypeId}`]: '14',
    [`${f('02').facilityId}-${rt('EF-L').roomTypeId}`]: '20',
    [`${f('02').facilityId}-${rt('EF-LL').roomTypeId}`]: '27',
    [`${f('02').facilityId}-${rt('EF(8)').roomTypeId}`]: '15',
    [`${f('04').facilityId}-${rt('SA').roomTypeId}`]: '20',
    [`${f('04').facilityId}-${rt('TD').roomTypeId}`]: '28',
    [`${f('04').facilityId}-${rt('FB').roomTypeId}`]: '35',
    [`${f('06').facilityId}-${rt('TA').roomTypeId}`]: '25',
    [`${f('06').facilityId}-${rt('FA').roomTypeId}`]: '37',
    [`${f('08').facilityId}-${rt('OS').roomTypeId}`]: '50',
  };

  for (const data of facilityRoomTypesData) {
    const key = `${data.facilityId}-${data.roomTypeId}`;
    const acreage = acreageOverrides[key] || data.acreage;

    const existing = await prisma.facilityRoomType.findFirst({
      where: { facilityId: data.facilityId, roomTypeId: data.roomTypeId },
    });
    if (!existing) {
      await prisma.facilityRoomType.create({
        data: {
          facilityId: data.facilityId,
          roomTypeId: data.roomTypeId,
          acreage,
          createdStaffId: admin.staffId,
        },
      });
    }
    console.log(`  FacilityRoomType: Facility ${data.facilityId} + RoomType ${data.roomTypeId} (acreage: ${acreage || '-'})`);
  }

  // Build stayType lookup by short name (used by rents and parking_rents)
  const stByShort: Record<string, (typeof stayTypes)[0]> = {};
  for (const st of stayTypes) {
    stByShort[st.stayTypeNameShort] = st;
  }

  // ═════════════════════════════════════════════════════
  // ─── Rents (Giá phòng theo loại phòng × loại lưu trú) ──
  // ═════════════════════════════════════════════════════
  console.log('\nSeeding rents...');

  // Pricing structure per room type × stay type
  // Short stays (A, B, C): dayRent based, monthRent = 0
  // Long stays (D, E, F, G): monthRent based, dayRent = 0
  // Prices in VND, adapted for Vietnamese market
  interface RentPricing {
    rtShort: string;
    depositFlag: number;
    stays: {
      stShort: string;
      depositPay: number | null;
      depositPayOver3?: number | null;
      dayRent: number;
      monthRent: number;
      dayRentOver3?: number;
      monthRentOver3?: number;
      dayCleanFee: number;
      monthCleanFee: number;
      dayCleanFeeOver3?: number;
      monthCleanFeeOver3?: number;
      dayMainteFee: number;
      monthMainteFee: number;
      dayUtilityFee: number;
      monthUtilityFee: number;
    }[];
  }

  const rentsPricing: RentPricing[] = [
    // ─── E-FLAT class: Compact rooms (cheapest) ─────────
    // EF(8) - 8 tatami equivalent
    {
      rtShort: 'EF(8)', depositFlag: 0,
      stays: [
        { stShort: 'A', depositPay: null, dayRent: 385000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 45000, monthUtilityFee: 60000 },
        { stShort: 'B', depositPay: null, dayRent: 330000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 45000, monthUtilityFee: 60000 },
        { stShort: 'C', depositPay: null, dayRent: 310000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 45000, monthUtilityFee: 60000 },
        { stShort: 'D', depositPay: null, dayRent: 0, monthRent: 8400000, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 45000, monthUtilityFee: 60000 },
        { stShort: 'E', depositPay: null, dayRent: 0, monthRent: 8400000, dayCleanFee: 0, monthCleanFee: 300000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 45000, monthUtilityFee: 60000 },
        { stShort: 'F', depositPay: null, dayRent: 0, monthRent: 8250000, dayCleanFee: 0, monthCleanFee: 300000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 45000, monthUtilityFee: 60000 },
        { stShort: 'G', depositPay: null, dayRent: 0, monthRent: 8100000, dayCleanFee: 0, monthCleanFee: 300000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 45000, monthUtilityFee: 60000 },
      ],
    },
    // EF - Standard E-Flat
    {
      rtShort: 'EF', depositFlag: 0,
      stays: [
        { stShort: 'A', depositPay: null, dayRent: 407000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 45000, monthUtilityFee: 60000 },
        { stShort: 'B', depositPay: null, dayRent: 352000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 45000, monthUtilityFee: 60000 },
        { stShort: 'C', depositPay: null, dayRent: 330000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 45000, monthUtilityFee: 60000 },
        { stShort: 'D', depositPay: null, dayRent: 0, monthRent: 9000000, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 45000, monthUtilityFee: 60000 },
        { stShort: 'E', depositPay: null, dayRent: 0, monthRent: 9000000, dayCleanFee: 0, monthCleanFee: 300000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 45000, monthUtilityFee: 60000 },
        { stShort: 'F', depositPay: null, dayRent: 0, monthRent: 8850000, dayCleanFee: 0, monthCleanFee: 300000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 45000, monthUtilityFee: 60000 },
        { stShort: 'G', depositPay: null, dayRent: 0, monthRent: 8700000, dayCleanFee: 0, monthCleanFee: 300000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 45000, monthUtilityFee: 60000 },
      ],
    },
    // EF-L - E-Flat Large
    {
      rtShort: 'EF-L', depositFlag: 0,
      stays: [
        { stShort: 'A', depositPay: null, dayRent: 429000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 0, monthUtilityFee: 0 },
        { stShort: 'B', depositPay: null, dayRent: 418000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 0, monthUtilityFee: 0 },
        { stShort: 'C', depositPay: null, dayRent: 390000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 0, monthUtilityFee: 0 },
        { stShort: 'D', depositPay: null, dayRent: 0, monthRent: 11250000, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 0, monthUtilityFee: 0 },
        { stShort: 'E', depositPay: null, dayRent: 0, monthRent: 11250000, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 0, monthUtilityFee: 0 },
        { stShort: 'F', depositPay: null, dayRent: 0, monthRent: 10800000, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 0, monthUtilityFee: 0 },
        { stShort: 'G', depositPay: null, dayRent: 0, monthRent: 10200000, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 0, monthUtilityFee: 0 },
      ],
    },
    // EF-LL - E-Flat Extra Large
    {
      rtShort: 'EF-LL', depositFlag: 0,
      stays: [
        { stShort: 'A', depositPay: null, dayRent: 495000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
        { stShort: 'B', depositPay: null, dayRent: 473000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
        { stShort: 'C', depositPay: null, dayRent: 450000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
        { stShort: 'D', depositPay: null, dayRent: 0, monthRent: 12300000, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
        { stShort: 'E', depositPay: 1000000, dayRent: 0, monthRent: 12300000, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
        { stShort: 'F', depositPay: 1000000, dayRent: 0, monthRent: 11700000, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
        { stShort: 'G', depositPay: 1000000, dayRent: 0, monthRent: 11250000, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
      ],
    },
    // ─── SINGLE class: Standard rooms ───────────────────
    // SA - Single A
    {
      rtShort: 'SA', depositFlag: 0,
      stays: [
        { stShort: 'A', depositPay: null, dayRent: 759000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
        { stShort: 'B', depositPay: null, dayRent: 660000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
        { stShort: 'C', depositPay: null, dayRent: 520000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
        { stShort: 'D', depositPay: null, dayRent: 0, monthRent: 14700000, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
        { stShort: 'E', depositPay: 5000000, dayRent: 0, monthRent: 14700000, dayCleanFee: 0, monthCleanFee: 1950000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
        { stShort: 'F', depositPay: 15000000, dayRent: 0, monthRent: 13800000, dayCleanFee: 0, monthCleanFee: 1050000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
        { stShort: 'G', depositPay: 15000000, dayRent: 0, monthRent: 13350000, dayCleanFee: 0, monthCleanFee: 600000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
      ],
    },
    // SB - Single B
    {
      rtShort: 'SB', depositFlag: 0,
      stays: [
        { stShort: 'A', depositPay: null, dayRent: 792000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
        { stShort: 'B', depositPay: 1000000, dayRent: 682000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
        { stShort: 'C', depositPay: null, dayRent: 620000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
        { stShort: 'D', depositPay: null, dayRent: 0, monthRent: 18000000, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
        { stShort: 'E', depositPay: 1000000, dayRent: 0, monthRent: 18000000, dayCleanFee: 0, monthCleanFee: 1950000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
        { stShort: 'F', depositPay: 1000000, dayRent: 0, monthRent: 16500000, dayCleanFee: 0, monthCleanFee: 1050000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
        { stShort: 'G', depositPay: 1000000, dayRent: 0, monthRent: 15300000, dayCleanFee: 0, monthCleanFee: 600000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
      ],
    },
    // SC - Single C
    {
      rtShort: 'SC', depositFlag: 0,
      stays: [
        { stShort: 'A', depositPay: null, dayRent: 825000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
        { stShort: 'B', depositPay: 1000000, dayRent: 726000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
        { stShort: 'C', depositPay: null, dayRent: 660000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
        { stShort: 'D', depositPay: null, dayRent: 0, monthRent: 18900000, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
        { stShort: 'E', depositPay: 1000000, dayRent: 0, monthRent: 18900000, dayCleanFee: 0, monthCleanFee: 1950000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
        { stShort: 'F', depositPay: 1000000, dayRent: 0, monthRent: 17100000, dayCleanFee: 0, monthCleanFee: 1050000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
        { stShort: 'G', depositPay: 1000000, dayRent: 0, monthRent: 15900000, dayCleanFee: 0, monthCleanFee: 600000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
      ],
    },
    // SD - Single D (no deposit)
    {
      rtShort: 'SD', depositFlag: 0,
      stays: [
        { stShort: 'A', depositPay: null, dayRent: 891000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
        { stShort: 'B', depositPay: null, dayRent: 814000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
        { stShort: 'C', depositPay: null, dayRent: 740000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
        { stShort: 'D', depositPay: null, dayRent: 0, monthRent: 20700000, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
        { stShort: 'E', depositPay: null, dayRent: 0, monthRent: 20700000, dayCleanFee: 0, monthCleanFee: 1950000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
        { stShort: 'F', depositPay: null, dayRent: 0, monthRent: 18600000, dayCleanFee: 0, monthCleanFee: 1050000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
        { stShort: 'G', depositPay: null, dayRent: 0, monthRent: 17100000, dayCleanFee: 0, monthCleanFee: 600000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
      ],
    },
    // ─── TWIN class: Double rooms ───────────────────────
    // TA - Twin A
    {
      rtShort: 'TA', depositFlag: 0,
      stays: [
        { stShort: 'A', depositPay: null, dayRent: 913000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 120000, monthUtilityFee: 240000 },
        { stShort: 'B', depositPay: 1000000, dayRent: 803000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 120000, monthUtilityFee: 240000 },
        { stShort: 'C', depositPay: null, dayRent: 720000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 120000, monthUtilityFee: 240000 },
        { stShort: 'D', depositPay: null, dayRent: 0, monthRent: 20400000, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 120000, monthUtilityFee: 240000 },
        { stShort: 'E', depositPay: 1000000, dayRent: 0, monthRent: 20400000, dayCleanFee: 0, monthCleanFee: 2250000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 120000, monthUtilityFee: 240000 },
        { stShort: 'F', depositPay: 1000000, dayRent: 0, monthRent: 19200000, dayCleanFee: 0, monthCleanFee: 1350000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 120000, monthUtilityFee: 240000 },
        { stShort: 'G', depositPay: 1000000, dayRent: 0, monthRent: 18000000, dayCleanFee: 0, monthCleanFee: 900000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 120000, monthUtilityFee: 240000 },
      ],
    },
    // TB - Twin B
    {
      rtShort: 'TB', depositFlag: 0,
      stays: [
        { stShort: 'A', depositPay: null, dayRent: 946000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 120000, monthUtilityFee: 240000 },
        { stShort: 'B', depositPay: null, dayRent: 858000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 120000, monthUtilityFee: 240000 },
        { stShort: 'C', depositPay: null, dayRent: 770000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 120000, monthUtilityFee: 240000 },
        { stShort: 'D', depositPay: null, dayRent: 0, monthRent: 21900000, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 120000, monthUtilityFee: 240000 },
        { stShort: 'E', depositPay: null, dayRent: 0, monthRent: 21900000, dayCleanFee: 0, monthCleanFee: 2250000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 120000, monthUtilityFee: 240000 },
        { stShort: 'F', depositPay: null, dayRent: 0, monthRent: 20100000, dayCleanFee: 0, monthCleanFee: 1350000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 120000, monthUtilityFee: 240000 },
        { stShort: 'G', depositPay: null, dayRent: 0, monthRent: 18900000, dayCleanFee: 0, monthCleanFee: 900000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 120000, monthUtilityFee: 240000 },
      ],
    },
    // TC - Twin C
    {
      rtShort: 'TC', depositFlag: 0,
      stays: [
        { stShort: 'A', depositPay: null, dayRent: 1045000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 120000, monthUtilityFee: 240000 },
        { stShort: 'B', depositPay: null, dayRent: 946000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 120000, monthUtilityFee: 240000 },
        { stShort: 'C', depositPay: null, dayRent: 860000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 120000, monthUtilityFee: 240000 },
        { stShort: 'D', depositPay: null, dayRent: 0, monthRent: 24000000, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 120000, monthUtilityFee: 240000 },
        { stShort: 'E', depositPay: null, dayRent: 0, monthRent: 24000000, dayCleanFee: 0, monthCleanFee: 2250000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 120000, monthUtilityFee: 240000 },
        { stShort: 'F', depositPay: null, dayRent: 0, monthRent: 21900000, dayCleanFee: 0, monthCleanFee: 1350000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 120000, monthUtilityFee: 240000 },
        { stShort: 'G', depositPay: null, dayRent: 0, monthRent: 20400000, dayCleanFee: 0, monthCleanFee: 900000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 120000, monthUtilityFee: 240000 },
      ],
    },
    // TD - Twin D
    {
      rtShort: 'TD', depositFlag: 0,
      stays: [
        { stShort: 'A', depositPay: null, dayRent: 1089000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 120000, monthUtilityFee: 240000 },
        { stShort: 'B', depositPay: 100000, dayRent: 1001000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 120000, monthUtilityFee: 240000 },
        { stShort: 'C', depositPay: null, dayRent: 910000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 120000, monthUtilityFee: 240000 },
        { stShort: 'D', depositPay: null, dayRent: 0, monthRent: 25200000, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 120000, monthUtilityFee: 240000 },
        { stShort: 'E', depositPay: 1200000, dayRent: 0, monthRent: 25200000, dayCleanFee: 0, monthCleanFee: 2250000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 120000, monthUtilityFee: 240000 },
        { stShort: 'F', depositPay: null, dayRent: 0, monthRent: 22500000, dayCleanFee: 0, monthCleanFee: 1350000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 120000, monthUtilityFee: 240000 },
        { stShort: 'G', depositPay: null, dayRent: 0, monthRent: 21000000, dayCleanFee: 0, monthCleanFee: 900000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 120000, monthUtilityFee: 240000 },
      ],
    },
    // ─── FAMILY class: Large rooms ──────────────────────
    // FA - Family A (with over3 data for "3 người trở lên")
    {
      rtShort: 'FA', depositFlag: 0,
      stays: [
        { stShort: 'A', depositPay: null, dayRent: 1485000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 150000, monthUtilityFee: 270000, dayRentOver3: 1540000, monthRentOver3: 0, dayCleanFeeOver3: 0, monthCleanFeeOver3: 0 },
        { stShort: 'B', depositPay: null, dayRent: 1375000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 150000, monthUtilityFee: 270000, dayRentOver3: 1430000, monthRentOver3: 0, dayCleanFeeOver3: 0, monthCleanFeeOver3: 0 },
        { stShort: 'C', depositPay: null, dayRent: 1250000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 150000, monthUtilityFee: 270000, dayRentOver3: 1300000, monthRentOver3: 0, dayCleanFeeOver3: 0, monthCleanFeeOver3: 0 },
        { stShort: 'D', depositPay: null, dayRent: 0, monthRent: 34500000, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 150000, monthUtilityFee: 270000, dayRentOver3: 0, monthRentOver3: 36000000, dayCleanFeeOver3: 0, monthCleanFeeOver3: 0 },
        { stShort: 'E', depositPay: null, dayRent: 0, monthRent: 34500000, dayCleanFee: 0, monthCleanFee: 2550000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 150000, monthUtilityFee: 270000, dayRentOver3: 0, monthRentOver3: 36000000, dayCleanFeeOver3: 0, monthCleanFeeOver3: 2550000 },
        { stShort: 'F', depositPay: null, dayRent: 0, monthRent: 23700000, dayCleanFee: 0, monthCleanFee: 1650000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 150000, monthUtilityFee: 270000, dayRentOver3: 0, monthRentOver3: 24600000, dayCleanFeeOver3: 0, monthCleanFeeOver3: 1650000 },
        { stShort: 'G', depositPay: null, dayRent: 0, monthRent: 21300000, dayCleanFee: 0, monthCleanFee: 1200000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 150000, monthUtilityFee: 270000, dayRentOver3: 0, monthRentOver3: 22200000, dayCleanFeeOver3: 0, monthCleanFeeOver3: 1200000 },
      ],
    },
    // FB - Family B
    {
      rtShort: 'FB', depositFlag: 0,
      stays: [
        { stShort: 'A', depositPay: null, dayRent: 1540000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 150000, monthUtilityFee: 270000 },
        { stShort: 'B', depositPay: null, dayRent: 1430000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 150000, monthUtilityFee: 270000 },
        { stShort: 'C', depositPay: null, dayRent: 1300000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 150000, monthUtilityFee: 270000 },
        { stShort: 'D', depositPay: null, dayRent: 0, monthRent: 36000000, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 150000, monthUtilityFee: 270000 },
        { stShort: 'E', depositPay: null, dayRent: 0, monthRent: 36000000, dayCleanFee: 0, monthCleanFee: 2550000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 150000, monthUtilityFee: 270000 },
        { stShort: 'F', depositPay: null, dayRent: 0, monthRent: 24600000, dayCleanFee: 0, monthCleanFee: 1650000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 150000, monthUtilityFee: 270000 },
        { stShort: 'G', depositPay: null, dayRent: 0, monthRent: 22200000, dayCleanFee: 0, monthCleanFee: 1200000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 150000, monthUtilityFee: 270000 },
      ],
    },
    // FC - Family C
    {
      rtShort: 'FC', depositFlag: 0,
      stays: [
        { stShort: 'A', depositPay: null, dayRent: 1760000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 150000, monthUtilityFee: 270000 },
        { stShort: 'B', depositPay: null, dayRent: 1595000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 150000, monthUtilityFee: 270000 },
        { stShort: 'C', depositPay: null, dayRent: 1450000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 150000, monthUtilityFee: 270000 },
        { stShort: 'D', depositPay: null, dayRent: 0, monthRent: 39000000, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 150000, monthUtilityFee: 270000 },
        { stShort: 'E', depositPay: null, dayRent: 0, monthRent: 39000000, dayCleanFee: 0, monthCleanFee: 2550000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 150000, monthUtilityFee: 270000 },
        { stShort: 'F', depositPay: null, dayRent: 0, monthRent: 28200000, dayCleanFee: 0, monthCleanFee: 1650000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 150000, monthUtilityFee: 270000 },
        { stShort: 'G', depositPay: null, dayRent: 0, monthRent: 25200000, dayCleanFee: 0, monthCleanFee: 1200000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 150000, monthUtilityFee: 270000 },
      ],
    },
    // FS - Family Suite
    {
      rtShort: 'FS', depositFlag: 0,
      stays: [
        { stShort: 'A', depositPay: null, dayRent: 1980000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 150000, monthUtilityFee: 270000 },
        { stShort: 'B', depositPay: null, dayRent: 1760000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 150000, monthUtilityFee: 270000 },
        { stShort: 'C', depositPay: null, dayRent: 1600000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 150000, monthUtilityFee: 270000 },
        { stShort: 'D', depositPay: null, dayRent: 0, monthRent: 42000000, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 150000, monthUtilityFee: 270000 },
        { stShort: 'E', depositPay: null, dayRent: 0, monthRent: 42000000, dayCleanFee: 0, monthCleanFee: 2550000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 150000, monthUtilityFee: 270000 },
        { stShort: 'F', depositPay: null, dayRent: 0, monthRent: 31500000, dayCleanFee: 0, monthCleanFee: 1650000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 150000, monthUtilityFee: 270000 },
        { stShort: 'G', depositPay: null, dayRent: 0, monthRent: 28800000, dayCleanFee: 0, monthCleanFee: 1200000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 150000, monthUtilityFee: 270000 },
      ],
    },
    // ─── SUITE class: Premium ───────────────────────────
    // OS - Suite
    {
      rtShort: 'OS', depositFlag: 0,
      stays: [
        { stShort: 'A', depositPay: null, dayRent: 1980000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 225000, monthUtilityFee: 330000 },
        { stShort: 'B', depositPay: null, dayRent: 2277000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 225000, monthUtilityFee: 330000 },
        { stShort: 'C', depositPay: null, dayRent: 2200000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 225000, monthUtilityFee: 330000 },
        { stShort: 'D', depositPay: null, dayRent: 0, monthRent: 62100000, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 225000, monthUtilityFee: 330000 },
        { stShort: 'E', depositPay: null, dayRent: 0, monthRent: 62100000, dayCleanFee: 0, monthCleanFee: 2550000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 225000, monthUtilityFee: 330000 },
        { stShort: 'F', depositPay: null, dayRent: 0, monthRent: 50700000, dayCleanFee: 0, monthCleanFee: 1650000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 225000, monthUtilityFee: 330000 },
        { stShort: 'G', depositPay: null, dayRent: 0, monthRent: 42750000, dayCleanFee: 0, monthCleanFee: 1200000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 225000, monthUtilityFee: 330000 },
      ],
    },
    // ═════════════════════════════════════════════════════
    // ─── DEPOSITED entries (deposit_flag=1) ─────────────
    // ═════════════════════════════════════════════════════
    // SB - Single B (Deposited)
    {
      rtShort: 'SB', depositFlag: 1,
      stays: [
        { stShort: 'A', depositPay: null, dayRent: 0, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
        { stShort: 'B', depositPay: 1000000, dayRent: 650000, monthRent: 0, dayCleanFee: 50000, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
        { stShort: 'C', depositPay: null, dayRent: 0, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
        { stShort: 'D', depositPay: null, dayRent: 0, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
        { stShort: 'E', depositPay: 3000000, dayRent: 0, monthRent: 17000000, dayCleanFee: 0, monthCleanFee: 1800000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
        { stShort: 'F', depositPay: 5000000, dayRent: 0, monthRent: 15500000, dayCleanFee: 0, monthCleanFee: 1000000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
        { stShort: 'G', depositPay: 5000000, dayRent: 0, monthRent: 14500000, dayCleanFee: 0, monthCleanFee: 550000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 90000, monthUtilityFee: 210000 },
      ],
    },
    // TA - Twin A (Deposited)
    {
      rtShort: 'TA', depositFlag: 1,
      stays: [
        { stShort: 'A', depositPay: null, dayRent: 0, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 120000, monthUtilityFee: 240000 },
        { stShort: 'B', depositPay: 1500000, dayRent: 770000, monthRent: 0, dayCleanFee: 60000, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 120000, monthUtilityFee: 240000 },
        { stShort: 'C', depositPay: null, dayRent: 0, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 120000, monthUtilityFee: 240000 },
        { stShort: 'D', depositPay: null, dayRent: 0, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 120000, monthUtilityFee: 240000 },
        { stShort: 'E', depositPay: 5000000, dayRent: 0, monthRent: 19000000, dayCleanFee: 0, monthCleanFee: 2100000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 120000, monthUtilityFee: 240000 },
        { stShort: 'F', depositPay: 8000000, dayRent: 0, monthRent: 17500000, dayCleanFee: 0, monthCleanFee: 1200000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 120000, monthUtilityFee: 240000 },
        { stShort: 'G', depositPay: 8000000, dayRent: 0, monthRent: 16500000, dayCleanFee: 0, monthCleanFee: 800000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 120000, monthUtilityFee: 240000 },
      ],
    },
    // FA - Family A (Deposited, with over3 data for "3 người trở lên Có đặt cọc")
    {
      rtShort: 'FA', depositFlag: 1,
      stays: [
        { stShort: 'A', depositPay: null, dayRent: 0, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 150000, monthUtilityFee: 270000, depositPayOver3: null, dayRentOver3: 0, monthRentOver3: 0, dayCleanFeeOver3: 0, monthCleanFeeOver3: 0 },
        { stShort: 'B', depositPay: 2000000, dayRent: 1300000, monthRent: 0, dayCleanFee: 80000, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 150000, monthUtilityFee: 270000, depositPayOver3: 2500000, dayRentOver3: 1400000, monthRentOver3: 0, dayCleanFeeOver3: 90000, monthCleanFeeOver3: 0 },
        { stShort: 'C', depositPay: null, dayRent: 0, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 150000, monthUtilityFee: 270000, depositPayOver3: null, dayRentOver3: 0, monthRentOver3: 0, dayCleanFeeOver3: 0, monthCleanFeeOver3: 0 },
        { stShort: 'D', depositPay: null, dayRent: 0, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 150000, monthUtilityFee: 270000, depositPayOver3: null, dayRentOver3: 0, monthRentOver3: 0, dayCleanFeeOver3: 0, monthCleanFeeOver3: 0 },
        { stShort: 'E', depositPay: 8000000, dayRent: 0, monthRent: 32000000, dayCleanFee: 0, monthCleanFee: 2400000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 150000, monthUtilityFee: 270000, depositPayOver3: 9000000, dayRentOver3: 0, monthRentOver3: 33500000, dayCleanFeeOver3: 0, monthCleanFeeOver3: 2400000 },
        { stShort: 'F', depositPay: 12000000, dayRent: 0, monthRent: 22000000, dayCleanFee: 0, monthCleanFee: 1500000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 150000, monthUtilityFee: 270000, depositPayOver3: 13000000, dayRentOver3: 0, monthRentOver3: 23000000, dayCleanFeeOver3: 0, monthCleanFeeOver3: 1500000 },
        { stShort: 'G', depositPay: 12000000, dayRent: 0, monthRent: 19500000, dayCleanFee: 0, monthCleanFee: 1100000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 150000, monthUtilityFee: 270000, depositPayOver3: 13000000, dayRentOver3: 0, monthRentOver3: 20500000, dayCleanFeeOver3: 0, monthCleanFeeOver3: 1100000 },
      ],
    },
    // OS - Suite (Deposited, based on SQL data)
    {
      rtShort: 'OS', depositFlag: 1,
      stays: [
        { stShort: 'A', depositPay: null, dayRent: 0, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 225000, monthUtilityFee: 330000 },
        { stShort: 'B', depositPay: null, dayRent: 2070000, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 225000, monthUtilityFee: 330000 },
        { stShort: 'C', depositPay: null, dayRent: 0, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 225000, monthUtilityFee: 330000 },
        { stShort: 'D', depositPay: null, dayRent: 0, monthRent: 0, dayCleanFee: 0, monthCleanFee: 0, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 225000, monthUtilityFee: 330000 },
        { stShort: 'E', depositPay: 5000000, dayRent: 0, monthRent: 0, dayCleanFee: 0, monthCleanFee: 2550000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 225000, monthUtilityFee: 330000 },
        { stShort: 'F', depositPay: 15000000, dayRent: 0, monthRent: 43500000, dayCleanFee: 0, monthCleanFee: 1650000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 225000, monthUtilityFee: 330000 },
        { stShort: 'G', depositPay: 15000000, dayRent: 0, monthRent: 36000000, dayCleanFee: 0, monthCleanFee: 1200000, dayMainteFee: 0, monthMainteFee: 0, dayUtilityFee: 225000, monthUtilityFee: 330000 },
      ],
    },
  ];

  let rentCount = 0;
  for (const rp of rentsPricing) {
    const roomType = rtByShort[rp.rtShort];
    if (!roomType) {
      console.warn(`  Warning: RoomType ${rp.rtShort} not found, skipping rent`);
      continue;
    }
    for (const s of rp.stays) {
      const stayType = stByShort[s.stShort];
      if (!stayType) continue;
      const existing = await prisma.rent.findFirst({
        where: { roomTypeId: roomType.roomTypeId, stayTypeId: stayType.stayTypeId, depositFlag: rp.depositFlag, deletedAt: null },
      });
      if (!existing) {
        await prisma.rent.create({
          data: {
            depositFlag: rp.depositFlag,
            roomTypeId: roomType.roomTypeId,
            stayTypeId: stayType.stayTypeId,
            depositPay: s.depositPay,
            depositPayOver3: s.depositPayOver3 ?? null,
            dayRent: s.dayRent,
            monthRent: BigInt(s.monthRent),
            dayRentOver3: s.dayRentOver3 ?? null,
            monthRentOver3: s.monthRentOver3 != null ? BigInt(s.monthRentOver3) : null,
            dayCleanFee: s.dayCleanFee,
            monthCleanFee: BigInt(s.monthCleanFee),
            dayCleanFeeOver3: s.dayCleanFeeOver3 ?? null,
            monthCleanFeeOver3: s.monthCleanFeeOver3 != null ? BigInt(s.monthCleanFeeOver3) : null,
            dayMainteFee: s.dayMainteFee,
            monthMainteFee: BigInt(s.monthMainteFee),
            dayUtilityFee: s.dayUtilityFee,
            monthUtilityFee: BigInt(s.monthUtilityFee),
            createdStaffId: admin.staffId,
          },
        });
        rentCount++;
      }
    }
    console.log(`  Rent: ${rp.rtShort} (deposit=${rp.depositFlag}) × 7 stay types`);
  }
  console.log(`  Total rents created: ${rentCount}`);

  // ═════════════════════════════════════════════════════
  // ─── Parkings (Bãi đỗ ô tô) ────────────────────────
  // ═════════════════════════════════════════════════════
  console.log('\nSeeding parkings...');

  // Only for facilities with parkingFlag=true: 01 (Bến Thành), 02 (Nguyễn Huệ), 04 (Phú Mỹ Hưng), 06 (Đà Nẵng), 07 (Hội An), 09 (Nha Trang)
  const parkingsData = [
    // Facility 01 - Bến Thành (3 chỗ)
    { parentFacilityId: f('01').facilityId, number: '1', heightLimit: 1.8, notice: 'Xe nhỏ ưu tiên', orderNum: 1 },
    { parentFacilityId: f('01').facilityId, number: '2', heightLimit: 1.8, notice: null, orderNum: 2 },
    { parentFacilityId: f('01').facilityId, number: '3', heightLimit: 1.8, notice: 'Hai bên là tường gạch', orderNum: 3 },
    // Facility 02 - Nguyễn Huệ (2 chỗ)
    { parentFacilityId: f('02').facilityId, number: '1', dataStatus: 0, heightLimit: 2.0, notice: 'Đang bảo trì', orderNum: 1 },
    { parentFacilityId: f('02').facilityId, number: '2', dataStatus: 1, heightLimit: 2.0, notice: 'Góc hẹp, xe nhỏ ưu tiên', orderNum: 2 },
    // Facility 04 - Phú Mỹ Hưng (3 chỗ)
    { parentFacilityId: f('04').facilityId, number: '1', heightLimit: 2.5, notice: null, orderNum: 1 },
    { parentFacilityId: f('04').facilityId, number: '2', heightLimit: 2.5, notice: null, orderNum: 2 },
    { parentFacilityId: f('04').facilityId, number: '3', heightLimit: 2.5, notice: 'Xe lớn không vào được', orderNum: 3 },
    // Facility 06 - Đà Nẵng (2 chỗ)
    { parentFacilityId: f('06').facilityId, number: '1', heightLimit: 3.0, notice: null, orderNum: 1 },
    { parentFacilityId: f('06').facilityId, number: '2', heightLimit: 3.0, notice: 'Bên trái tòa nhà, chỉ xe ô tô nhỏ', orderNum: 2 },
    // Facility 07 - Hội An (1 chỗ)
    { parentFacilityId: f('07').facilityId, number: '1', heightLimit: 2.0, notice: 'Cách tòa nhà 5 phút đi bộ', orderNum: 1 },
    // Facility 09 - Nha Trang (1 chỗ)
    { parentFacilityId: f('09').facilityId, number: '1', heightLimit: 2.5, notice: null, orderNum: 1 },
  ];

  const parkings: Awaited<ReturnType<typeof prisma.parking.create>>[] = [];
  for (const data of parkingsData) {
    let parking = await prisma.parking.findFirst({
      where: { parentFacilityId: data.parentFacilityId, number: data.number, deletedAt: null },
    });
    if (!parking) {
      parking = await prisma.parking.create({
        data: { ...data, createdStaffId: admin.staffId },
      });
    }
    parkings.push(parking);
    console.log(`  Parking: #${parking.number} @ Facility ${parking.parentFacilityId} (ID: ${parking.parkingId})`);
  }

  // ═════════════════════════════════════════════════════
  // ─── Parking Rents (Giá thuê bãi đỗ theo loại lưu trú)
  // ═════════════════════════════════════════════════════
  console.log('\nSeeding parking rents...');

  // Create rents for each parking × each stay type
  // Prices in VND: short-stay expensive, long-stay cheaper per day
  const parkingRentPricing: { parkingIdx: number; facilityNo: string; rents: Record<string, number> }[] = [
    // Facility 01 - Bến Thành
    { parkingIdx: 0, facilityNo: '01', rents: { A: 50000, B: 45000, C: 40000, D: 35000, E: 30000, F: 25000, G: 20000 } },
    { parkingIdx: 1, facilityNo: '01', rents: { A: 50000, B: 45000, C: 40000, D: 35000, E: 30000, F: 25000, G: 20000 } },
    { parkingIdx: 2, facilityNo: '01', rents: { A: 50000, B: 45000, C: 40000, D: 35000, E: 30000, F: 25000, G: 20000 } },
    // Facility 02 - Nguyễn Huệ
    { parkingIdx: 3, facilityNo: '02', rents: { A: 60000, B: 55000, C: 50000, D: 45000, E: 40000, F: 35000, G: 30000 } },
    { parkingIdx: 4, facilityNo: '02', rents: { A: 60000, B: 55000, C: 50000, D: 45000, E: 40000, F: 35000, G: 30000 } },
    // Facility 04 - Phú Mỹ Hưng
    { parkingIdx: 5, facilityNo: '04', rents: { A: 70000, B: 65000, C: 60000, D: 55000, E: 50000, F: 45000, G: 40000 } },
    { parkingIdx: 6, facilityNo: '04', rents: { A: 70000, B: 65000, C: 60000, D: 55000, E: 50000, F: 45000, G: 40000 } },
    { parkingIdx: 7, facilityNo: '04', rents: { A: 70000, B: 65000, C: 60000, D: 55000, E: 50000, F: 45000, G: 40000 } },
    // Facility 06 - Đà Nẵng
    { parkingIdx: 8, facilityNo: '06', rents: { A: 40000, B: 35000, C: 30000, D: 25000, E: 20000, F: 18000, G: 15000 } },
    { parkingIdx: 9, facilityNo: '06', rents: { A: 40000, B: 35000, C: 30000, D: 25000, E: 20000, F: 18000, G: 15000 } },
    // Facility 07 - Hội An
    { parkingIdx: 10, facilityNo: '07', rents: { A: 30000, B: 25000, C: 20000, D: 18000, E: 15000, F: 12000, G: 10000 } },
    // Facility 09 - Nha Trang
    { parkingIdx: 11, facilityNo: '09', rents: { A: 45000, B: 40000, C: 35000, D: 30000, E: 25000, F: 20000, G: 18000 } },
  ];


  let parkingRentCount = 0;
  for (const pr of parkingRentPricing) {
    const parking = parkings[pr.parkingIdx];
    const facilityId = f(pr.facilityNo).facilityId;
    for (const [shortName, rent] of Object.entries(pr.rents)) {
      const stayType = stByShort[shortName];
      if (!stayType) continue;
      const existing = await prisma.parkingRent.findFirst({
        where: { parkingId: parking.parkingId, facilityId, stayTypeId: stayType.stayTypeId, deletedAt: null },
      });
      if (!existing) {
        await prisma.parkingRent.create({
          data: {
            parkingId: parking.parkingId,
            facilityId,
            stayTypeId: stayType.stayTypeId,
            unit: 0,
            rent,
            createdStaffId: admin.staffId,
          },
        });
        parkingRentCount++;
      }
    }
  }
  console.log(`  ParkingRents created: ${parkingRentCount}`);

  // ═════════════════════════════════════════════════════
  // ─── Bicycle Parkings (Bãi đỗ xe đạp) ──────────────
  // ═════════════════════════════════════════════════════
  console.log('\nSeeding bicycle parkings...');

  // Only for facilities with bicycleParkingFlag=true: 02 (Nguyễn Huệ), 04 (Phú Mỹ Hưng), 06 (Đà Nẵng), 08 (Hà Nội)
  const bicycleParkingsData = [
    // Facility 02 - Nguyễn Huệ (2 chỗ)
    { parentFacilityId: f('02').facilityId, number: '001', notice: null, orderNum: 1 },
    { parentFacilityId: f('02').facilityId, number: '002', notice: null, orderNum: 2 },
    // Facility 04 - Phú Mỹ Hưng (3 chỗ)
    { parentFacilityId: f('04').facilityId, number: '001', dataStatus: 1, notice: null, orderNum: 1 },
    { parentFacilityId: f('04').facilityId, number: '002', dataStatus: 1, notice: null, orderNum: 2 },
    { parentFacilityId: f('04').facilityId, number: '003', dataStatus: 0, notice: 'Không bán', orderNum: 3 },
    // Facility 06 - Đà Nẵng (2 chỗ)
    { parentFacilityId: f('06').facilityId, number: '001', notice: null, orderNum: 1 },
    { parentFacilityId: f('06').facilityId, number: '002', notice: 'Xe đạp và xe máy chuyên dụng', orderNum: 2 },
    // Facility 08 - Hà Nội (1 chỗ)
    { parentFacilityId: f('08').facilityId, number: '001', notice: null, orderNum: 1 },
  ];

  for (const data of bicycleParkingsData) {
    const existing = await prisma.bicycleParking.findFirst({
      where: { parentFacilityId: data.parentFacilityId, number: data.number, deletedAt: null },
    });
    if (!existing) {
      const bp = await prisma.bicycleParking.create({
        data: { ...data, createdStaffId: admin.staffId },
      });
      console.log(`  BicycleParking: #${bp.number} @ Facility ${bp.parentFacilityId} (ID: ${bp.bicycleParkingId})`);
    }
  }

  // ═════════════════════════════════════════════════════
  // ─── Clients ────────────────────────────────────────
  // ═════════════════════════════════════════════════════
  console.log('\nSeeding clients...');

  const clientsData = [
    {
      email: 'an.nguyen@gmail.com',
      dataType: 1,
      clientName: 'Nguyễn Văn An',
      clientNameEn: 'Nguyen Van An',
      sex: 1,
      tel: '0912345678',
      telPhone: '0912345678',
      birthday: new Date('1990-05-15'),
      zipCode: '700000',
      address1: '100 Lê Lai, Phường Bến Thành, Quận 1',
      address2: 'TP. Hồ Chí Minh',
      countryId: countryVN.countryId,
    },
    {
      email: 'bich.tran@gmail.com',
      dataType: 1,
      clientName: 'Trần Thị Bích',
      clientNameEn: 'Tran Thi Bich',
      sex: 2,
      tel: '0923456789',
      birthday: new Date('1985-11-20'),
      zipCode: '550000',
      address1: '25 Bạch Đằng, Hải Châu',
      address2: 'TP. Đà Nẵng',
      countryId: countryVN.countryId,
    },
    {
      email: 'contact@abctravel.vn',
      dataType: 2,
      clientName: 'Công ty ABC Travel',
      clientNameEn: 'ABC Travel Company',
      contactName: 'Lê Văn Cường',
      contactNameEn: 'Le Van Cuong',
      companyName: 'Công ty TNHH ABC Travel',
      companyNameEn: 'ABC Travel Co., Ltd',
      sex: 9,
      tel: '02812345678',
      companyTel: '02812345679',
      companyZipCode: '700000',
      companyAddress1: '200 Hai Bà Trưng, Phường Đa Kao, Quận 1',
      companyAddress2: 'TP. Hồ Chí Minh',
      postpaidFlag: true,
      countryId: countryVN.countryId,
    },
    {
      email: 'john.smith@email.com',
      dataType: 1,
      clientName: 'John Smith',
      clientNameEn: 'John Smith',
      sex: 1,
      tel: '+1234567890',
      birthday: new Date('1988-03-10'),
      countryId: countryUS.countryId,
    },
    {
      email: 'minyoung.park@email.kr',
      dataType: 1,
      clientName: 'Park Min Young',
      clientNameEn: 'Park Min Young',
      sex: 2,
      tel: '+821012345678',
      birthday: new Date('1995-07-25'),
      countryId: countryKR.countryId,
    },
    {
      email: 'walkin.guest@temp.com',
      dataType: 3, // Walk-in / khách vãng lai - dùng để demo cell ĐỎ
      clientName: 'Khách Vãng Lai',
      clientNameEn: 'Walk-in Guest',
      sex: 9,
      tel: '0945678901',
      countryId: countryVN.countryId,
    },
  ];

  const clients = [];
  for (const { countryId, ...rest } of clientsData) {
    let client = await prisma.client.findFirst({ where: { email: rest.email, deletedAt: null } });
    if (!client) {
      client = await prisma.client.create({
        data: {
          ...rest,
          ...(countryId !== undefined && { country: { connect: { countryId } } }),
          createdBy: { connect: { staffId: admin.staffId } },
        },
      });
    }
    clients.push(client);
    console.log(`  Client: ${client.clientName} (ID: ${client.clientId})`);
  }

  const [client1, client2, client3, client4, client5, walkInClient] = clients;

  // ─── Reservations ─────────────────────────────────
  console.log('\nSeeding reservations...');

  const reservesData = [
    {
      clientId: client1.clientId,
      facilityId: f('01').facilityId,
      roomId: rooms[0].roomId, // Room 101 @ Bến Thành
      stayTypeId: stayTypes[0].stayTypeId, // 1-6 đêm
      reserveStatus: 2,
      reserveType: 1,
      periodFrom: new Date('2026-04-01'),
      periodTo: new Date('2026-04-08'),
      confirmFlag: true,
      bookingUnitPrice: 500000,
      deposit: 500000,
      note: 'Khách yêu cầu phòng tầng cao',
      chargeStaffId: manager.staffId,
      confirmStaffId: manager.staffId,
    },
    {
      clientId: client2.clientId,
      facilityId: f('01').facilityId,
      roomId: rooms[2].roomId, // Room 201 @ Bến Thành
      stayTypeId: stayTypes[3].stayTypeId, // 1 tháng trở lên
      reserveStatus: 3,
      reserveType: 1,
      periodFrom: new Date('2026-03-01'),
      periodTo: new Date('2026-03-31'),
      confirmFlag: true,
      checkinFlag: true,
      checkedInAt: new Date('2026-03-01T14:00:00'),
      bookingUnitPrice: 8000000,
      deposit: 8000000,
      chargeStaffId: manager.staffId,
      confirmStaffId: manager.staffId,
    },
    {
      clientId: client3.clientId,
      facilityId: f('01').facilityId,
      roomId: rooms[4].roomId, // Room 301 @ Bến Thành
      stayTypeId: stayTypes[1].stayTypeId, // 7 đêm - dưới 1 tháng
      reserveStatus: 1,
      reserveType: 1,
      periodFrom: new Date('2026-04-15'),
      periodTo: new Date('2026-04-29'),
      bookingUnitPrice: 1200000,
      note: 'Đặt phòng cho khách đoàn',
      advertisingType: 1,
    },
    {
      clientId: client4.clientId,
      facilityId: f('06').facilityId,
      roomId: rooms[28].roomId, // Room 301 @ Đà Nẵng
      stayTypeId: stayTypes[0].stayTypeId, // 1-6 đêm
      reserveStatus: 2,
      reserveType: 1,
      periodFrom: new Date('2026-04-10'),
      periodTo: new Date('2026-04-17'),
      confirmFlag: true,
      bookingUnitPrice: 700000,
      deposit: 700000,
      advertisingType: 5,
      chargeStaffId: manager.staffId,
      confirmStaffId: manager.staffId,
    },
    {
      clientId: client5.clientId,
      facilityId: f('08').facilityId,
      roomId: rooms[34].roomId, // Room 101 @ Hà Nội
      stayTypeId: stayTypes[0].stayTypeId, // 1-6 đêm
      reserveStatus: 4,
      reserveType: 1,
      periodFrom: new Date('2026-02-01'),
      periodTo: new Date('2026-02-08'),
      confirmFlag: true,
      checkinFlag: true,
      checkedInAt: new Date('2026-02-01T15:00:00'),
      checkoutAt: new Date('2026-02-08T11:00:00'),
      bookingUnitPrice: 500000,
      deposit: 500000,
      chargeStaffId: manager.staffId,
      confirmStaffId: manager.staffId,
    },
    {
      clientId: client1.clientId,
      facilityId: f('01').facilityId,
      roomId: rooms[6].roomId, // Room 501 (Suite) @ Bến Thành
      stayTypeId: stayTypes[4].stayTypeId, // 1-3 tháng
      reserveStatus: 5,
      reserveType: 1,
      periodFrom: new Date('2026-05-01'),
      periodTo: new Date('2026-07-31'),
      bookingUnitPrice: 15000000,
      cancelReason: 'Khách thay đổi kế hoạch công tác',
      cancelledAt: new Date('2026-03-10'),
    },
    // ─── Whiteboard 5-state color demo (2026-05-10 → 2026-05-14) ──────
    // Xem tài liệu: docs/WHITEBOARD_CELL_LOGIC.md
    // Lọc whiteboard theo khoảng ngày 10-14/05/2026 ở facility 01 + 02 để
    // thấy 5 màu cell side-by-side.

    // [1] YELLOW — confirmed + có periodTo + có vùng đệm
    {
      clientId: client1.clientId,
      facilityId: f('01').facilityId,
      roomId: rooms[1].roomId, // Room 102 @ Bến Thành
      stayTypeId: stayTypes[0].stayTypeId,
      reserveStatus: 2,
      reserveType: 1,
      periodFrom: new Date('2026-05-10'),
      periodTo: new Date('2026-05-13'),
      confirmFlag: true,
      bookingUnitPrice: 550000,
      deposit: 550000,
      noreserveCountBefore: 1,
      noreserveCountAfter: 1,
      note: 'Demo whiteboard: cell VÀNG (#FCFF61) - confirmed + padding',
      chargeStaffId: manager.staffId,
      confirmStaffId: manager.staffId,
    },
    // [2] GREEN — chưa confirm (có periodTo nhưng chưa xác nhận)
    {
      clientId: client5.clientId,
      facilityId: f('01').facilityId,
      roomId: rooms[3].roomId, // Room 202 @ Bến Thành
      stayTypeId: stayTypes[0].stayTypeId,
      reserveStatus: 1,
      reserveType: 1,
      periodFrom: new Date('2026-05-10'),
      periodTo: new Date('2026-05-13'),
      confirmFlag: false,
      bookingUnitPrice: 600000,
      note: 'Demo whiteboard: cell XANH LÁ (#8BD08E) - chưa xác nhận',
    },
    // [3] CYAN — đặt qua kênh quảng cáo (advertisingType=5)
    {
      clientId: client2.clientId,
      facilityId: f('01').facilityId,
      roomId: rooms[5].roomId, // Room 401 @ Bến Thành
      stayTypeId: stayTypes[0].stayTypeId,
      reserveStatus: 2,
      reserveType: 1,
      periodFrom: new Date('2026-05-10'),
      periodTo: new Date('2026-05-13'),
      confirmFlag: true,
      bookingUnitPrice: 800000,
      deposit: 800000,
      advertisingType: 5,
      note: 'Demo whiteboard: cell XANH NGỌC (#4ADEDE) - kênh OTA/quảng cáo',
      chargeStaffId: manager.staffId,
      confirmStaffId: manager.staffId,
    },
    // [4] RED — walk-in (clientDataType=3) + chưa confirm
    {
      clientId: walkInClient.clientId,
      facilityId: f('02').facilityId,
      roomId: rooms[7].roomId, // Room 101 @ Nhà Hát Lớn
      stayTypeId: stayTypes[0].stayTypeId,
      reserveStatus: 1,
      reserveType: 1,
      periodFrom: new Date('2026-05-10'),
      periodTo: new Date('2026-05-13'),
      confirmFlag: false,
      bookingUnitPrice: 500000,
      note: 'Demo whiteboard: cell ĐỎ (#F86F6F) - walk-in chưa xác nhận',
    },
    // [5] BLACK / DRAFT — bản nháp giữ chỗ
    {
      clientId: client4.clientId,
      facilityId: f('02').facilityId,
      roomId: rooms[8].roomId, // Room 102 @ Nhà Hát Lớn
      stayTypeId: stayTypes[0].stayTypeId,
      reserveStatus: 1,
      reserveType: 1,
      periodFrom: new Date('2026-05-10'),
      periodTo: new Date('2026-05-13'),
      draftFlag: true,
      bookingUnitPrice: 700000,
      note: 'Demo whiteboard: cell ĐEN (#000) - draft/giữ chỗ',
    },
  ];

  const reserves = [];
  for (const { clientId, facilityId, roomId, stayTypeId, chargeStaffId, confirmStaffId, ...rest } of reservesData) {
    let reserve = await prisma.reserve.findFirst({
      where: { clientId, roomId, periodFrom: rest.periodFrom, deletedAt: null },
    });
    if (!reserve) {
      reserve = await prisma.reserve.create({
        data: {
          ...rest,
          client: { connect: { clientId } },
          facility: { connect: { facilityId } },
          room: { connect: { roomId } },
          stayType: { connect: { stayTypeId } },
          ...(chargeStaffId && { chargeStaff: { connect: { staffId: chargeStaffId } } }),
          ...(confirmStaffId && { confirmStaff: { connect: { staffId: confirmStaffId } } }),
          createdBy: { connect: { staffId: admin.staffId } },
        },
      });
    }
    reserves.push(reserve);
    console.log(`  Reserve: #${reserve.reserveId} (status: ${reserve.reserveStatus})`);
  }

  // ─── Cleaning Shift sample data ─────────────────────
  console.log('\nSeeding cleaning shift sample data...');

  const dateOnly = (year: number, month: number, day: number) =>
    new Date(Date.UTC(year, month - 1, day));
  const cleaningDate = dateOnly(2026, 4, 29);
  const cleaningFacility = f('01');
  const cleaningLead =
    (await prisma.staff.findUnique({ where: { mail: 'cam.tran@hotel.com' } })) ?? manager;
  const cleaningSub =
    (await prisma.staff.findUnique({ where: { mail: 'duc.le@hotel.com' } })) ?? manager;
  const cleaningChecker =
    (await prisma.staff.findUnique({ where: { mail: 'em.pham@hotel.com' } })) ?? manager;
  const partTimeCleaner =
    (await prisma.staff.findUnique({ where: { mail: 'phuc.hoang@hotel.com' } })) ?? manager;

  const upsertSampleReserve = async (data: Prisma.ReserveUncheckedCreateInput) => {
    const existing = await prisma.reserve.findFirst({
      where: {
        clientId: Number(data.clientId),
        roomId: Number(data.roomId),
        periodFrom: data.periodFrom as Date,
        deletedAt: null,
      },
    });

    if (!existing) {
      return prisma.reserve.create({ data });
    }

    return prisma.reserve.update({
      where: { reserveId: existing.reserveId },
      data: {
        facilityId: data.facilityId,
        roomId: data.roomId,
        stayTypeId: data.stayTypeId,
        reserveStatus: data.reserveStatus,
        reserveType: data.reserveType,
        periodTo: data.periodTo,
        confirmFlag: data.confirmFlag,
        checkinFlag: data.checkinFlag,
        checkedInAt: data.checkedInAt,
        checkoutAt: data.checkoutAt,
        bookingUnitPrice: data.bookingUnitPrice,
        deposit: data.deposit,
        rentalKeys: data.rentalKeys,
        returnKeys: data.returnKeys,
        keyReturnDatetime: data.keyReturnDatetime,
        checkoutReceptionistId: data.checkoutReceptionistId,
        roomDirtyLevel: data.roomDirtyLevel,
        noreserveCountAfter: data.noreserveCountAfter,
        disableReservation: data.disableReservation,
        note: data.note,
        updatedStaffId: manager.staffId,
      },
    });
  };

  const checkoutReserve101 = await upsertSampleReserve({
    clientId: client1.clientId,
    facilityId: cleaningFacility.facilityId,
    roomId: rooms[0].roomId,
    stayTypeId: stayTypes[0].stayTypeId,
    reserveStatus: 4,
    reserveType: 1,
    periodFrom: dateOnly(2026, 4, 24),
    periodTo: cleaningDate,
    confirmFlag: true,
    checkinFlag: true,
    checkedInAt: new Date('2026-04-24T14:00:00'),
    checkoutAt: new Date('2026-04-29T10:00:00'),
    bookingUnitPrice: 650000,
    deposit: 650000,
    rentalKeys: 2,
    returnKeys: 1,
    checkoutReceptionistId: manager.staffId,
    roomDirtyLevel: 2,
    noreserveCountAfter: 0,
    disableReservation: false,
    note: 'Khách trả 1/2 chìa, cần kiểm tra thêm trong phòng.',
    createdStaffId: admin.staffId,
    updatedStaffId: manager.staffId,
  });

  const checkoutReserve201 = await upsertSampleReserve({
    clientId: client2.clientId,
    facilityId: cleaningFacility.facilityId,
    roomId: rooms[2].roomId,
    stayTypeId: stayTypes[1].stayTypeId,
    reserveStatus: 4,
    reserveType: 1,
    periodFrom: dateOnly(2026, 4, 20),
    periodTo: cleaningDate,
    confirmFlag: true,
    checkinFlag: true,
    checkedInAt: new Date('2026-04-20T15:00:00'),
    checkoutAt: new Date('2026-04-29T11:00:00'),
    bookingUnitPrice: 780000,
    deposit: 780000,
    rentalKeys: 1,
    returnKeys: 1,
    keyReturnDatetime: new Date('2026-04-29T11:10:00'),
    checkoutReceptionistId: manager.staffId,
    roomDirtyLevel: 3,
    noreserveCountAfter: 2,
    disableReservation: true,
    note: 'Phòng bẩn mức cao, ưu tiên kiểm tra sau khi dọn.',
    createdStaffId: admin.staffId,
    updatedStaffId: manager.staffId,
  });

  const checkoutReserve301 = await prisma.reserve.update({
    where: { reserveId: reserves[2].reserveId },
    data: {
      reserveStatus: 4,
      checkinFlag: true,
      checkedInAt: new Date('2026-04-15T14:00:00'),
      checkoutAt: new Date('2026-04-29T09:30:00'),
      rentalKeys: 1,
      returnKeys: 0,
      checkoutReceptionistId: manager.staffId,
      roomDirtyLevel: 1,
      noreserveCountAfter: 0,
      disableReservation: false,
      updatedStaffId: manager.staffId,
    },
  });
  reserves[2] = checkoutReserve301;

  const checkoutReserve401 = await upsertSampleReserve({
    clientId: client4.clientId,
    facilityId: cleaningFacility.facilityId,
    roomId: rooms[5].roomId,
    stayTypeId: stayTypes[0].stayTypeId,
    reserveStatus: 4,
    reserveType: 1,
    periodFrom: dateOnly(2026, 4, 25),
    periodTo: cleaningDate,
    confirmFlag: true,
    checkinFlag: true,
    checkedInAt: new Date('2026-04-25T14:00:00'),
    checkoutAt: new Date('2026-04-29T10:30:00'),
    bookingUnitPrice: 950000,
    deposit: 950000,
    rentalKeys: 2,
    returnKeys: 2,
    keyReturnDatetime: new Date('2026-04-29T10:40:00'),
    checkoutReceptionistId: manager.staffId,
    roomDirtyLevel: 2,
    noreserveCountAfter: 1,
    disableReservation: false,
    note: 'Khách có yêu cầu giữ lại đồ thất lạc nếu tìm thấy.',
    createdStaffId: admin.staffId,
    updatedStaffId: manager.staffId,
  });

  await upsertSampleReserve({
    clientId: client5.clientId,
    facilityId: cleaningFacility.facilityId,
    roomId: rooms[0].roomId,
    stayTypeId: stayTypes[0].stayTypeId,
    reserveStatus: 2,
    reserveType: 1,
    periodFrom: dateOnly(2026, 4, 30),
    periodTo: dateOnly(2026, 5, 3),
    confirmFlag: true,
    bookingUnitPrice: 700000,
    deposit: 700000,
    rentalKeys: 0,
    returnKeys: 0,
    noreserveCountBefore: 0,
    note: 'Khách mới nhận phòng ngay hôm sau.',
    createdStaffId: admin.staffId,
    updatedStaffId: manager.staffId,
  });

  await upsertSampleReserve({
    clientId: client3.clientId,
    facilityId: cleaningFacility.facilityId,
    roomId: rooms[2].roomId,
    stayTypeId: stayTypes[1].stayTypeId,
    reserveStatus: 2,
    reserveType: 1,
    periodFrom: dateOnly(2026, 5, 2),
    periodTo: dateOnly(2026, 5, 12),
    confirmFlag: true,
    bookingUnitPrice: 780000,
    deposit: 780000,
    rentalKeys: null,
    returnKeys: null,
    noreserveCountBefore: 2,
    note: 'Đặt tiếp sau khi phòng được xử lý deep clean.',
    createdStaffId: admin.staffId,
    updatedStaffId: manager.staffId,
  });

  await upsertSampleReserve({
    clientId: client2.clientId,
    facilityId: cleaningFacility.facilityId,
    roomId: rooms[4].roomId,
    stayTypeId: stayTypes[0].stayTypeId,
    reserveStatus: 2,
    reserveType: 1,
    periodFrom: dateOnly(2026, 4, 30),
    periodTo: dateOnly(2026, 5, 5),
    confirmFlag: true,
    bookingUnitPrice: 1200000,
    deposit: 1200000,
    rentalKeys: 0,
    returnKeys: null,
    noreserveCountBefore: 0,
    note: 'Có khách mới, cần hoàn tất kiểm tra chìa trước 15:00.',
    createdStaffId: admin.staffId,
    updatedStaffId: manager.staffId,
  });

  const cleanShift = await prisma.cleans.upsert({
    where: {
      facilityId_cleaningDate: {
        facilityId: cleaningFacility.facilityId,
        cleaningDate,
      },
    },
    update: {
      note: 'Ưu tiên phòng 101 và 301 vì có khách mới ngày 30/04. Khu vực chung kiểm tra sau 14:00.',
      restTimeFrom: new Date('2026-04-29T12:00:00'),
      restTimeTo: new Date('2026-04-29T13:00:00'),
      dataStatus: 1,
      deletedAt: null,
      deletedStaffId: null,
      updatedStaffId: manager.staffId,
    },
    create: {
      facilityId: cleaningFacility.facilityId,
      cleaningDate,
      note: 'Ưu tiên phòng 101 và 301 vì có khách mới ngày 30/04. Khu vực chung kiểm tra sau 14:00.',
      restTimeFrom: new Date('2026-04-29T12:00:00'),
      restTimeTo: new Date('2026-04-29T13:00:00'),
      createdStaffId: admin.staffId,
      updatedStaffId: manager.staffId,
    },
  });

  const upsertPinCredential = async (data: {
    roomId: number;
    reserveId: number;
    pin: string;
    validFrom: Date;
    validTo: Date;
    status: number;
    providerCredentialId: string;
    revokedAt?: Date | null;
    expiredAt?: Date | null;
  }) => {
    const encryptedPin = await bcrypt.hash(data.pin, BCRYPT_ROUNDS);
    const maskedPin = `****${data.pin.slice(-4)}`;
    const existing = await prisma.roomPinCredential.findFirst({
      where: {
        roomId: data.roomId,
        reserveId: data.reserveId,
        providerCredentialId: data.providerCredentialId,
        deletedAt: null,
      },
    });

    if (!existing) {
      return prisma.roomPinCredential.create({
        data: {
          roomId: data.roomId,
          reserveId: data.reserveId,
          encryptedPin,
          maskedPin,
          validFrom: data.validFrom,
          validTo: data.validTo,
          status: data.status,
          issuedAt: data.validFrom,
          revokedAt: data.revokedAt ?? null,
          expiredAt: data.expiredAt ?? null,
          providerCredentialId: data.providerCredentialId,
          providerPayload: { source: 'seed', facilityNo: cleaningFacility.facilityNo },
          createdStaffId: admin.staffId,
          updatedStaffId: manager.staffId,
        },
      });
    }

    return prisma.roomPinCredential.update({
      where: { roomPinCredentialId: existing.roomPinCredentialId },
      data: {
        encryptedPin,
        maskedPin,
        validFrom: data.validFrom,
        validTo: data.validTo,
        status: data.status,
        issuedAt: data.validFrom,
        revokedAt: data.revokedAt ?? null,
        expiredAt: data.expiredAt ?? null,
        providerPayload: { source: 'seed', facilityNo: cleaningFacility.facilityNo },
        dataStatus: 1,
        deletedAt: null,
        deletedStaffId: null,
        updatedStaffId: manager.staffId,
      },
    });
  };

  const room101Pin = await upsertPinCredential({
    roomId: rooms[0].roomId,
    reserveId: checkoutReserve101.reserveId,
    pin: '101429',
    validFrom: new Date('2026-04-24T13:00:00'),
    validTo: new Date('2026-04-30T15:00:00'),
    status: 1,
    providerCredentialId: 'seed-bt-101-20260429',
  });

  const room201Pin = await upsertPinCredential({
    roomId: rooms[2].roomId,
    reserveId: checkoutReserve201.reserveId,
    pin: '201429',
    validFrom: new Date('2026-04-20T13:00:00'),
    validTo: new Date('2026-04-29T11:00:00'),
    status: 2,
    providerCredentialId: 'seed-bt-201-20260429',
    revokedAt: new Date('2026-04-29T11:15:00'),
  });

  const upsertCleaningDetail = async (
    match: Prisma.CleaningDetailWhereInput,
    data: Prisma.CleaningDetailUncheckedCreateInput,
  ) => {
    const existing = await prisma.cleaningDetail.findFirst({ where: match });

    if (!existing) {
      return prisma.cleaningDetail.create({ data });
    }

    return prisma.cleaningDetail.update({
      where: { cleaningDetailId: existing.cleaningDetailId },
      data: {
        facilityId: data.facilityId,
        roomId: data.roomId ?? null,
        reserveId: data.reserveId ?? null,
        dataType: data.dataType,
        areaName: data.areaName ?? null,
        mainStaffId: data.mainStaffId ?? null,
        subStaffId: data.subStaffId ?? null,
        checkStaffId: data.checkStaffId ?? null,
        mainStaffExternalFlag: data.mainStaffExternalFlag ?? false,
        subStaffExternalFlag: data.subStaffExternalFlag ?? false,
        checkStaffExternalFlag: data.checkStaffExternalFlag ?? false,
        scheduledDate: data.scheduledDate ?? null,
        startDatetime: data.startDatetime ?? null,
        endDatetime: data.endDatetime ?? null,
        finishDatetime: data.finishDatetime ?? null,
        cleanStatus: data.cleanStatus ?? 1,
        checkSafetyFlag: data.checkSafetyFlag ?? false,
        roomPinCredentialId: data.roomPinCredentialId ?? null,
        pinRevokedConfirmedAt: data.pinRevokedConfirmedAt ?? null,
        comment: data.comment ?? null,
        orderNum: data.orderNum ?? null,
        dataStatus: 1,
        deletedAt: null,
        deletedStaffId: null,
        updatedStaffId: manager.staffId,
      },
    });
  };

  const cleaningDetails = [
    await upsertCleaningDetail(
      { cleanId: cleanShift.cleanId, dataType: 1, roomId: rooms[0].roomId, deletedAt: null },
      {
        cleanId: cleanShift.cleanId,
        facilityId: cleaningFacility.facilityId,
        roomId: rooms[0].roomId,
        reserveId: checkoutReserve101.reserveId,
        dataType: 1,
        mainStaffId: cleaningLead.staffId,
        subStaffId: partTimeCleaner.staffId,
        checkStaffId: cleaningChecker.staffId,
        scheduledDate: cleaningDate,
        startDatetime: new Date('2026-04-29T10:30:00'),
        cleanStatus: 2,
        comment: 'Ưu tiên xử lý sớm do khách mới đến ngày 30/04.',
        orderNum: 1,
        createdStaffId: admin.staffId,
        updatedStaffId: manager.staffId,
      },
    ),
    await upsertCleaningDetail(
      { cleanId: cleanShift.cleanId, dataType: 1, roomId: rooms[2].roomId, deletedAt: null },
      {
        cleanId: cleanShift.cleanId,
        facilityId: cleaningFacility.facilityId,
        roomId: rooms[2].roomId,
        reserveId: checkoutReserve201.reserveId,
        dataType: 1,
        mainStaffId: cleaningSub.staffId,
        subStaffId: partTimeCleaner.staffId,
        checkStaffId: cleaningChecker.staffId,
        scheduledDate: cleaningDate,
        startDatetime: new Date('2026-04-29T11:20:00'),
        endDatetime: new Date('2026-04-29T12:10:00'),
        cleanStatus: 4,
        comment: 'Phòng cần deep clean, đã khóa nhận đặt ngay.',
        orderNum: 2,
        createdStaffId: admin.staffId,
        updatedStaffId: manager.staffId,
      },
    ),
    await upsertCleaningDetail(
      { cleanId: cleanShift.cleanId, dataType: 1, roomId: rooms[4].roomId, deletedAt: null },
      {
        cleanId: cleanShift.cleanId,
        facilityId: cleaningFacility.facilityId,
        roomId: rooms[4].roomId,
        reserveId: checkoutReserve301.reserveId,
        dataType: 1,
        mainStaffId: cleaningLead.staffId,
        subStaffId: cleaningSub.staffId,
        checkStaffId: manager.staffId,
        scheduledDate: cleaningDate,
        cleanStatus: 1,
        comment: 'Có khách mới ngày 30/04, kiểm tra lại chìa sau khi dọn.',
        orderNum: 3,
        createdStaffId: admin.staffId,
        updatedStaffId: manager.staffId,
      },
    ),
    await upsertCleaningDetail(
      { cleanId: cleanShift.cleanId, dataType: 1, roomId: rooms[5].roomId, deletedAt: null },
      {
        cleanId: cleanShift.cleanId,
        facilityId: cleaningFacility.facilityId,
        roomId: rooms[5].roomId,
        reserveId: checkoutReserve401.reserveId,
        dataType: 1,
        mainStaffId: partTimeCleaner.staffId,
        subStaffId: null,
        checkStaffId: cleaningChecker.staffId,
        scheduledDate: cleaningDate,
        startDatetime: new Date('2026-04-29T13:10:00'),
        endDatetime: new Date('2026-04-29T13:55:00'),
        finishDatetime: new Date('2026-04-29T13:55:00'),
        cleanStatus: 5,
        comment: 'Đã hoàn tất, không có khách mới sát ngày.',
        orderNum: 4,
        createdStaffId: admin.staffId,
        updatedStaffId: manager.staffId,
      },
    ),
    await upsertCleaningDetail(
      { cleanId: cleanShift.cleanId, dataType: 2, areaName: 'Sảnh lễ tân tầng 1', deletedAt: null },
      {
        cleanId: cleanShift.cleanId,
        facilityId: cleaningFacility.facilityId,
        dataType: 2,
        areaName: 'Sảnh lễ tân tầng 1',
        mainStaffId: cleaningLead.staffId,
        checkStaffId: manager.staffId,
        scheduledDate: cleaningDate,
        startDatetime: new Date('2026-04-29T08:30:00'),
        endDatetime: new Date('2026-04-29T09:10:00'),
        finishDatetime: new Date('2026-04-29T09:10:00'),
        cleanStatus: 5,
        comment: 'Đã lau kính và bổ sung nước rửa tay.',
        orderNum: 10,
        createdStaffId: admin.staffId,
        updatedStaffId: manager.staffId,
      },
    ),
    await upsertCleaningDetail(
      { cleanId: cleanShift.cleanId, dataType: 2, areaName: 'Hành lang tầng 2', deletedAt: null },
      {
        cleanId: cleanShift.cleanId,
        facilityId: cleaningFacility.facilityId,
        dataType: 2,
        areaName: 'Hành lang tầng 2',
        mainStaffId: cleaningSub.staffId,
        subStaffId: partTimeCleaner.staffId,
        scheduledDate: cleaningDate,
        cleanStatus: 2,
        comment: 'Đang hút bụi thảm và kiểm tra đèn hành lang.',
        orderNum: 11,
        createdStaffId: admin.staffId,
        updatedStaffId: manager.staffId,
      },
    ),
    await upsertCleaningDetail(
      {
        cleanId: cleanShift.cleanId,
        dataType: 2,
        areaName: 'Khu rác và thang máy',
        deletedAt: null,
      },
      {
        cleanId: cleanShift.cleanId,
        facilityId: cleaningFacility.facilityId,
        dataType: 2,
        areaName: 'Khu rác và thang máy',
        mainStaffId: null,
        mainStaffExternalFlag: true,
        checkStaffId: cleaningChecker.staffId,
        scheduledDate: cleaningDate,
        cleanStatus: 1,
        comment: 'Nhà thầu vệ sinh xử lý sau 15:00.',
        orderNum: 12,
        createdStaffId: admin.staffId,
        updatedStaffId: manager.staffId,
      },
    ),
    await upsertCleaningDetail(
      { cleanId: cleanShift.cleanId, dataType: 3, roomId: rooms[0].roomId, deletedAt: null },
      {
        cleanId: cleanShift.cleanId,
        facilityId: cleaningFacility.facilityId,
        roomId: rooms[0].roomId,
        reserveId: checkoutReserve101.reserveId,
        dataType: 3,
        mainStaffId: manager.staffId,
        scheduledDate: cleaningDate,
        cleanStatus: 2,
        checkSafetyFlag: false,
        roomPinCredentialId: room101Pin.roomPinCredentialId,
        comment: 'PIN còn hiệu lực đến 30/04, cần thu hồi sau khi xác nhận trả đủ chìa.',
        orderNum: 20,
        createdStaffId: admin.staffId,
        updatedStaffId: manager.staffId,
      },
    ),
    await upsertCleaningDetail(
      { cleanId: cleanShift.cleanId, dataType: 3, roomId: rooms[2].roomId, deletedAt: null },
      {
        cleanId: cleanShift.cleanId,
        facilityId: cleaningFacility.facilityId,
        roomId: rooms[2].roomId,
        reserveId: checkoutReserve201.reserveId,
        dataType: 3,
        mainStaffId: manager.staffId,
        scheduledDate: cleaningDate,
        cleanStatus: 5,
        checkSafetyFlag: true,
        roomPinCredentialId: room201Pin.roomPinCredentialId,
        pinRevokedConfirmedAt: new Date('2026-04-29T11:20:00'),
        comment: 'Đã thu hồi PIN và xác nhận trả chìa.',
        orderNum: 21,
        createdStaffId: admin.staffId,
        updatedStaffId: manager.staffId,
      },
    ),
  ];

  const upsertDetailNote = async (cleaningDetailId: number, noteContent: string) => {
    const existing = await prisma.cleanDetailNote.findFirst({
      where: { cleaningDetailId, noteContent, deletedAt: null },
    });

    if (!existing) {
      await prisma.cleanDetailNote.create({
        data: {
          cleaningDetailId,
          noteContent,
          createdStaffId: manager.staffId,
          updatedStaffId: manager.staffId,
        },
      });
    }
  };

  await upsertDetailNote(
    cleaningDetails[0].cleaningDetailId,
    'Báo lễ tân giữ chìa dự phòng cho phòng 101.',
  );
  await upsertDetailNote(
    cleaningDetails[1].cleaningDetailId,
    'Cần kiểm tra lại mùi phòng sau khi deep clean.',
  );
  await upsertDetailNote(
    cleaningDetails[7].cleaningDetailId,
    'Chưa xác nhận thu hồi PIN, không đánh dấu an toàn.',
  );

  console.log(`  Cleaning shift: ${cleaningFacility.facilityName} - 2026-04-29`);
  console.log(`  Cleaning details: ${cleaningDetails.length} rows`);

  // ─── Reserve Occupiers (Co-guests) ────────────────
  console.log('\nSeeding reserve occupiers...');

  const occupiersData = [
    {
      reserveId: reserves[1].reserveId,
      clientId: client2.clientId,
      occupierName: 'Trần Văn Dũng',
      occupierNameEn: 'Tran Van Dung',
      sex: 1,
      tel: '0934567890',
      orderNum: 1,
    },
    {
      reserveId: reserves[2].reserveId,
      clientId: client3.clientId,
      occupierName: 'Phạm Thị Hoa',
      occupierNameEn: 'Pham Thi Hoa',
      sex: 2,
      tel: '0945678901',
      orderNum: 1,
    },
    {
      reserveId: reserves[2].reserveId,
      clientId: client3.clientId,
      occupierName: 'Võ Văn Khánh',
      occupierNameEn: 'Vo Van Khanh',
      sex: 1,
      tel: '0956789012',
      orderNum: 2,
    },
  ];

  for (const { reserveId, clientId, ...rest } of occupiersData) {
    const existing = await prisma.reserveOccupier.findFirst({
      where: { reserveId, occupierName: rest.occupierName, deletedAt: null },
    });
    if (!existing) {
      const occupier = await prisma.reserveOccupier.create({
        data: {
          ...rest,
          reserve: { connect: { reserveId } },
          client: { connect: { clientId } },
          createdBy: { connect: { staffId: admin.staffId } },
        },
      });
      console.log(`  Occupier: ${occupier.occupierName} (Reserve #${reserveId})`);
    } else {
      console.log(`  Occupier: ${existing.occupierName} (Reserve #${reserveId}) - exists`);
    }
  }

  // ─── Update useCount for clients with reservations ─
  const useCountMap = [
    { clientId: client1.clientId, useCount: 3 },
    { clientId: client2.clientId, useCount: 3 },
    { clientId: client3.clientId, useCount: 2 },
    { clientId: client4.clientId, useCount: 2 },
    { clientId: client5.clientId, useCount: 1 },
  ];

  for (const { clientId, useCount } of useCountMap) {
    await prisma.client.update({ where: { clientId }, data: { useCount } });
  }

  // ─── Parking Reserves ─────────────────────────────────
  console.log('\nSeeding parking reserves...');

  const parkingReservesData = [
    {
      parkingId: parkings[0].parkingId, // Bến Thành 1
      reserveId: reserves[0].reserveId,
      clientId: client1.clientId,
      periodFrom: new Date('2026-04-01'),
      periodTo: new Date('2026-04-08'),
      stayTypeId: stayTypes[0].stayTypeId,
      confirmFlag: true,
      checkinFlag: false,
      checkoutFlag: false,
      carType: 'Toyota Vios',
      licensePlate: '51G-123.45',
      note: 'Khách cần đỗ xe trong suốt thời gian lưu trú',
      createdStaffId: admin.staffId,
    },
    {
      parkingId: parkings[1].parkingId, // Bến Thành 2
      reserveId: reserves[1].reserveId,
      clientId: client2.clientId,
      periodFrom: new Date('2026-03-01'),
      periodTo: new Date('2026-03-31'),
      stayTypeId: stayTypes[3].stayTypeId,
      confirmFlag: true,
      checkinFlag: true,
      checkoutFlag: false,
      carType: 'Honda CRV',
      licensePlate: '29A-678.90',
      note: 'Khách đang sử dụng',
      createdStaffId: admin.staffId,
    },
    {
      parkingId: parkings[2].parkingId, // Bến Thành 3
      reserveId: null,
      clientId: null,
      periodFrom: new Date('2026-05-10'),
      periodTo: new Date('2026-05-15'),
      stayTypeId: null,
      confirmFlag: false,
      checkinFlag: false,
      checkoutFlag: false,
      carType: 'Ford Ranger',
      licensePlate: '60C-345.67',
      note: 'Khách ngoài thuê chỗ đỗ',
      createdStaffId: admin.staffId,
    },
    {
      parkingId: parkings[4].parkingId, // Nguyễn Huệ 2
      reserveId: null,
      clientId: client4.clientId,
      periodFrom: new Date('2026-01-01'),
      periodTo: new Date('2026-01-15'),
      stayTypeId: stayTypes[0].stayTypeId,
      confirmFlag: true,
      checkinFlag: true,
      checkoutFlag: true,
      carType: 'Mazda 3',
      licensePlate: '43A-123.45',
      note: 'Khách đã trả chỗ',
      createdStaffId: admin.staffId,
    }
  ];

  let prCount = 0;
  for (const data of parkingReservesData) {
    const existing = await prisma.parkingReserve.findFirst({
      where: { parkingId: data.parkingId, periodFrom: data.periodFrom, deletedAt: null },
    });
    if (!existing) {
      await prisma.parkingReserve.create({ data });
      prCount++;
    }
  }
  console.log(`  ParkingReserves created: ${prCount}`);

  // ─── Bicycle Parking Reserves ─────────────────────────
  console.log('\nSeeding bicycle parking reserves...');

  const bp_nguyenHue_1 = await prisma.bicycleParking.findFirst({ where: { parentFacilityId: f('02').facilityId, number: '001', deletedAt: null } });
  const bp_phuMyHung_1 = await prisma.bicycleParking.findFirst({ where: { parentFacilityId: f('04').facilityId, number: '001', deletedAt: null } });

  let bprCount = 0;
  if (bp_nguyenHue_1 && bp_phuMyHung_1) {
    const bicycleParkingReservesData = [
      {
        bicycleParkingId: bp_nguyenHue_1.bicycleParkingId,
        reserveId: null,
        clientId: client3.clientId,
        periodFrom: new Date('2026-04-15'),
        periodTo: new Date('2026-04-29'),
        stayTypeId: stayTypes[1].stayTypeId,
        confirmFlag: true,
        checkinFlag: false,
        checkoutFlag: false,
        bicycleTypeNote: 'Xe máy Honda Vision',
        note: null,
        createdStaffId: admin.staffId,
      },
      {
        bicycleParkingId: bp_phuMyHung_1.bicycleParkingId,
        reserveId: null,
        clientId: client1.clientId,
        periodFrom: new Date('2026-04-01'),
        periodTo: new Date('2026-04-05'),
        stayTypeId: stayTypes[0].stayTypeId,
        confirmFlag: true,
        checkinFlag: true,
        checkoutFlag: false,
        bicycleTypeNote: 'Xe đạp thể thao',
        note: 'Gửi tạm vài ngày',
        createdStaffId: admin.staffId,
      }
    ];

    for (const data of bicycleParkingReservesData) {
      const existing = await prisma.bicycleParkingReserve.findFirst({
        where: { bicycleParkingId: data.bicycleParkingId, periodFrom: data.periodFrom, deletedAt: null },
      });
      if (!existing) {
        await prisma.bicycleParkingReserve.create({ data });
        bprCount++;
      }
    }
  }
  console.log(`  BicycleParkingReserves created: ${bprCount}`);

  // ─── PaymentMethods ────────────────────────────────
  const pmCount = await prisma.paymentMethod.count()
  if (pmCount === 0) {
    const pmData: Prisma.PaymentMethodCreateManyInput[] = [
      { paymentTypeId: 1, category: 'cash',     displayName: 'Tiền mặt',                   accountCode: 1111, createdStaffId: admin.staffId, dataStatus: 1 },
      { paymentTypeId: 2, category: 'transfer',  displayName: 'Chuyển khoản ngân hàng',     accountCode: 1121, createdStaffId: admin.staffId, dataStatus: 1 },
      { paymentTypeId: 3, category: 'card',      displayName: 'Thẻ tín dụng / ghi nợ',     accountCode: 1131, createdStaffId: admin.staffId, dataStatus: 1 },
      { paymentTypeId: 4, category: 'ewallet',   displayName: 'Ví điện tử (MoMo / ZaloPay)',accountCode: 1141, createdStaffId: admin.staffId, dataStatus: 1 },
    ]
    await prisma.paymentMethod.createMany({ data: pmData })
    console.log(`  PaymentMethods created: ${pmData.length}`)
  } else {
    console.log(`  PaymentMethods already seeded (${pmCount} records), skipping`)
  }

  await prisma.$disconnect();

  console.log('\n══════════════════════════════════════════');
  console.log('  Seed completed successfully!');
  console.log('══════════════════════════════════════════');
  console.log('\nLogin credentials:');
  console.log('  Admin:     admin@hotel.com      / admin123');
  console.log('  Manager:   manager@hotel.com    / manager123');
  console.log('  Staff:     cam.tran@hotel.com   / staff123');
  console.log('  Part-time: phuc.hoang@hotel.com / parttime123');
  console.log('\nSample data:');
  console.log('  Countries:          7 (VN, JP, US, CN, KR, TH, KH)');
  console.log('  RoomClasses:        5 (E-FLAT, SINGLE, TWIN, FAMILY, SUITE)');
  console.log('  RoomTypes:         17 (EF, EF-L, EF-LL, EF(8), SA-SD, TA-TD, FA-FC, FS, OS)');
  console.log('  StayTypes:          7 (1-6 đêm, 7 đêm-1 tháng, Tuần, 1 tháng+, 1-3 tháng, 3-7 tháng, 7+ tháng)');
  console.log('  Facilities:        10 (HCM x5, Đà Nẵng, Hội An, Hà Nội, Nha Trang, Cần Thơ)');
  console.log('  Rooms:             41 (distributed across 9 active facilities)');
  console.log('  FacilityRoomTypes: ~30 (with acreage data for key types)');
  console.log('  Rents:            147 (17 room types × 7 stay types not-deposited + 4 × 7 deposited, FA with over3)');
  console.log('  Parkings:          12 (across 6 facilities with parkingFlag)');
  console.log('  ParkingRents:      84 (12 parkings × 7 stay types)');
  console.log('  BicycleParkings:    8 (across 4 facilities with bicycleParkingFlag)');
  console.log('  Clients:            5 (3 VN, 1 US, 1 KR)');
  console.log('  Reservations:      12 (including cleaning-shift checkout and next-reserve samples)');
  console.log('  CleaningShift:      1 (facility 01, cleaning date 2026-04-29)');
  console.log('  CleaningDetails:    9 (4 rooms, 3 common areas, 2 key-safety rows)');
  console.log('  SmartLockPins:      2 (linked to cleaning key-safety rows)');
  console.log('  Occupiers:          3 (co-guests)');
  console.log('  PaymentMethods:     4 (Tiền mặt, Chuyển khoản, Thẻ, Ví điện tử)');
}

main().catch((e: unknown) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
