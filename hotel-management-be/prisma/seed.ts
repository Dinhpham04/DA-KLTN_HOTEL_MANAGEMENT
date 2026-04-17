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
    { parentFacilityId: f('02').facilityId, number: '1', heightLimit: 2.0, notice: null, orderNum: 1 },
    { parentFacilityId: f('02').facilityId, number: '2', heightLimit: 2.0, notice: 'Góc hẹp, xe nhỏ ưu tiên', orderNum: 2 },
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
    { parentFacilityId: f('04').facilityId, number: '001', notice: null, orderNum: 1 },
    { parentFacilityId: f('04').facilityId, number: '002', notice: null, orderNum: 2 },
    { parentFacilityId: f('04').facilityId, number: '003', notice: 'Không bán', orderNum: 3 },
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

  const [client1, client2, client3, client4, client5] = clients;

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
    { clientId: client1.clientId, useCount: 2 },
    { clientId: client2.clientId, useCount: 1 },
    { clientId: client3.clientId, useCount: 1 },
    { clientId: client4.clientId, useCount: 1 },
    { clientId: client5.clientId, useCount: 1 },
  ];

  for (const { clientId, useCount } of useCountMap) {
    await prisma.client.update({ where: { clientId }, data: { useCount } });
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
  console.log('  Reservations:       6 (1 Pending, 2 Confirmed, 1 Checked-in, 1 Checked-out, 1 Cancelled)');
  console.log('  Occupiers:          3 (co-guests)');
}

main().catch((e: unknown) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
