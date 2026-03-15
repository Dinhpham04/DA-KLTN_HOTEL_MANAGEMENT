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

  // ─── Facilities ─────────────────────────────────────
  console.log('\nSeeding facilities...');

  const facilitiesData = [
    {
      facilityNo: '001',
      facilityType: 1,
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
    },
    {
      facilityNo: '002',
      facilityType: 1,
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
    },
    {
      facilityNo: '003',
      facilityType: 2,
      facilityName: 'Kho luu tru Tan Binh',
      facilityNameEn: 'Tan Binh Storage Center',
      zipCode: '700000',
      address: '78 Cong Hoa, Phuong 4, Quan Tan Binh, TP. Ho Chi Minh',
      addressEn: '78 Cong Hoa, Ward 4, Tan Binh District, Ho Chi Minh City',
      orderNum: 3,
    },
  ];

  const facilities = [];
  for (const data of facilitiesData) {
    let facility = await prisma.facility.findFirst({ where: { facilityNo: data.facilityNo } });
    if (!facility) {
      facility = await prisma.facility.create({
        data: { ...data, createdBy: { connect: { staffId: admin.staffId } } },
      });
    }
    facilities.push(facility);
    console.log(`  Facility: ${facility.facilityName} (ID: ${facility.facilityId})`);
  }

  const [facility1, facility2] = facilities;

  // ─── Room Classes ───────────────────────────────────
  console.log('\nSeeding room classes...');

  const roomClassesData = [
    { roomClassName: 'Standard', orderNum: 1 },
    { roomClassName: 'Deluxe', orderNum: 2 },
    { roomClassName: 'Suite', orderNum: 3 },
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

  const [roomClassStandard, roomClassDeluxe, roomClassSuite] = roomClasses;

  // ─── Room Types ─────────────────────────────────────
  console.log('\nSeeding room types...');

  const roomTypesData = [
    {
      roomClassId: roomClassStandard.roomClassId,
      roomTypeName: 'Phong Don',
      roomTypeNameShort: 'SGL',
      acreage: 18,
      orderNum: 1,
    },
    {
      roomClassId: roomClassStandard.roomClassId,
      roomTypeName: 'Phong Doi',
      roomTypeNameShort: 'DBL',
      acreage: 25,
      orderNum: 2,
    },
    {
      roomClassId: roomClassDeluxe.roomClassId,
      roomTypeName: 'Phong Twin',
      roomTypeNameShort: 'TWN',
      acreage: 30,
      orderNum: 3,
    },
    {
      roomClassId: roomClassDeluxe.roomClassId,
      roomTypeName: 'Deluxe Doi',
      roomTypeNameShort: 'DDBL',
      acreage: 35,
      orderNum: 4,
    },
    {
      roomClassId: roomClassSuite.roomClassId,
      roomTypeName: 'Phong Suite',
      roomTypeNameShort: 'STE',
      acreage: 50,
      orderNum: 5,
    },
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
    console.log(`  RoomType: ${rt.roomTypeName} (ID: ${rt.roomTypeId})`);
  }

  const [roomTypeSingle, roomTypeDouble, roomTypeTwin, roomTypeDeluxeDouble, roomTypeSuiteRoom] =
    roomTypes;

  // ─── Rooms ──────────────────────────────────────────
  console.log('\nSeeding rooms...');

  const roomsData = [
    // Saigon Central - Standard Single
    { facilityId: facility1.facilityId, roomTypeId: roomTypeSingle.roomTypeId, roomNumber: '101', roomStatus: 1, mailboxPassword: '1234', orderNum: 1 },
    { facilityId: facility1.facilityId, roomTypeId: roomTypeSingle.roomTypeId, roomNumber: '102', roomStatus: 1, mailboxPassword: '1235', orderNum: 2 },
    { facilityId: facility1.facilityId, roomTypeId: roomTypeSingle.roomTypeId, roomNumber: '103', roomStatus: 2, mailboxPassword: '1236', orderNum: 3 },
    // Saigon Central - Standard Double
    { facilityId: facility1.facilityId, roomTypeId: roomTypeDouble.roomTypeId, roomNumber: '201', roomStatus: 1, mailboxPassword: '2234', orderNum: 4 },
    { facilityId: facility1.facilityId, roomTypeId: roomTypeDouble.roomTypeId, roomNumber: '202', roomStatus: 3, mailboxPassword: '2235', orderNum: 5 },
    // Saigon Central - Deluxe Twin
    { facilityId: facility1.facilityId, roomTypeId: roomTypeTwin.roomTypeId, roomNumber: '301', roomStatus: 1, mailboxPassword: '3234', orderNum: 6 },
    { facilityId: facility1.facilityId, roomTypeId: roomTypeTwin.roomTypeId, roomNumber: '302', roomStatus: 1, mailboxPassword: '3235', orderNum: 7 },
    // Saigon Central - Suite
    { facilityId: facility1.facilityId, roomTypeId: roomTypeSuiteRoom.roomTypeId, roomNumber: '501', roomStatus: 1, mailboxPassword: '5234', orderNum: 8 },
    // Saigon Riverside - Standard Single
    { facilityId: facility2.facilityId, roomTypeId: roomTypeSingle.roomTypeId, roomNumber: 'R101', roomStatus: 1, mailboxPassword: 'R123', orderNum: 9 },
    { facilityId: facility2.facilityId, roomTypeId: roomTypeSingle.roomTypeId, roomNumber: 'R102', roomStatus: 2, mailboxPassword: 'R124', orderNum: 10 },
    // Saigon Riverside - Deluxe Double
    { facilityId: facility2.facilityId, roomTypeId: roomTypeDeluxeDouble.roomTypeId, roomNumber: 'R201', roomStatus: 1, mailboxPassword: 'R223', orderNum: 11 },
    { facilityId: facility2.facilityId, roomTypeId: roomTypeDeluxeDouble.roomTypeId, roomNumber: 'R202', roomStatus: 1, mailboxPassword: 'R224', orderNum: 12 },
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
    console.log(`  Room: ${room.roomNumber} (ID: ${room.roomId})`);
  }

  // ─── Stay Types ─────────────────────────────────────
  console.log('\nSeeding stay types...');

  const stayTypesData = [
    { stayContractTypeId: 1, stayTypeName: 'Luu tru theo tuan', stayTypeNameEn: 'Weekly Stay', stayTypeNameShort: 'WK', orderNum: 1 },
    { stayContractTypeId: 1, stayTypeName: 'Luu tru 2 tuan', stayTypeNameEn: 'Bi-Weekly Stay', stayTypeNameShort: 'BWK', orderNum: 2 },
    { stayContractTypeId: 2, stayTypeName: 'Luu tru theo thang', stayTypeNameEn: 'Monthly Stay', stayTypeNameShort: 'MN', orderNum: 3 },
    { stayContractTypeId: 2, stayTypeName: 'Luu tru dai han', stayTypeNameEn: 'Long-term Stay', stayTypeNameShort: 'LT', orderNum: 4 },
  ];

  const stayTypes = [];
  for (const data of stayTypesData) {
    let st = await prisma.stayType.findFirst({ where: { stayTypeNameShort: data.stayTypeNameShort } });
    if (!st) {
      st = await prisma.stayType.create({
        data: { ...data, createdBy: { connect: { staffId: admin.staffId } } },
      });
    }
    stayTypes.push(st);
    console.log(`  StayType: ${st.stayTypeName} (ID: ${st.stayTypeId})`);
  }

  // ─── Clients ───────────────────────────────────────
  console.log('\nSeeding clients...');

  const clientsData = [
    {
      email: 'an.nguyen@gmail.com',
      dataType: 1,
      clientName: 'Nguyen Van An',
      clientNameEn: 'Nguyen Van An',
      sex: 1,
      tel: '0912345678',
      telPhone: '0912345678',
      birthday: new Date('1990-05-15'),
      zipCode: '700000',
      address1: '100 Le Lai, Phuong Ben Thanh, Quan 1',
      address2: 'TP. Ho Chi Minh',
      countryId: countryVN.countryId,
    },
    {
      email: 'bich.tran@gmail.com',
      dataType: 1,
      clientName: 'Tran Thi Bich',
      clientNameEn: 'Tran Thi Bich',
      sex: 2,
      tel: '0923456789',
      birthday: new Date('1985-11-20'),
      zipCode: '550000',
      address1: '25 Bach Dang, Hai Chau',
      address2: 'TP. Da Nang',
      countryId: countryVN.countryId,
    },
    {
      email: 'contact@abctravel.vn',
      dataType: 2,
      clientName: 'Cong ty ABC Travel',
      clientNameEn: 'ABC Travel Company',
      contactName: 'Le Van Cuong',
      contactNameEn: 'Le Van Cuong',
      companyName: 'Cong ty TNHH ABC Travel',
      companyNameEn: 'ABC Travel Co., Ltd',
      sex: 9,
      tel: '02812345678',
      companyTel: '02812345679',
      companyZipCode: '700000',
      companyAddress1: '200 Hai Ba Trung, Phuong Da Kao, Quan 1',
      companyAddress2: 'TP. Ho Chi Minh',
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
      // Reservation 1: Confirmed, upcoming
      clientId: client1.clientId,
      facilityId: facility1.facilityId,
      roomId: rooms[0].roomId, // Room 101
      stayTypeId: stayTypes[0].stayTypeId, // Weekly
      reserveStatus: 2,
      reserveType: 1,
      periodFrom: new Date('2026-04-01'),
      periodTo: new Date('2026-04-08'),
      confirmFlag: true,
      bookingUnitPrice: 500000,
      deposit: 500000,
      note: 'Khach yeu cau phong tang cao',
      chargeStaffId: manager.staffId,
      confirmStaffId: manager.staffId,
    },
    {
      // Reservation 2: Checked in
      clientId: client2.clientId,
      facilityId: facility1.facilityId,
      roomId: rooms[3].roomId, // Room 201
      stayTypeId: stayTypes[2].stayTypeId, // Monthly
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
      // Reservation 3: Corporate booking, pending
      clientId: client3.clientId,
      facilityId: facility1.facilityId,
      roomId: rooms[5].roomId, // Room 301
      stayTypeId: stayTypes[1].stayTypeId, // Bi-Weekly
      reserveStatus: 1,
      reserveType: 1,
      periodFrom: new Date('2026-04-15'),
      periodTo: new Date('2026-04-29'),
      bookingUnitPrice: 1200000,
      note: 'Dat phong cho khach doan',
      advertisingType: 1,
    },
    {
      // Reservation 4: Foreign guest, confirmed
      clientId: client4.clientId,
      facilityId: facility2.facilityId,
      roomId: rooms[10].roomId, // Room R201
      stayTypeId: stayTypes[0].stayTypeId, // Weekly
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
      // Reservation 5: Checked out (past)
      clientId: client5.clientId,
      facilityId: facility2.facilityId,
      roomId: rooms[8].roomId, // Room R101
      stayTypeId: stayTypes[0].stayTypeId, // Weekly
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
      // Reservation 6: Cancelled
      clientId: client1.clientId,
      facilityId: facility1.facilityId,
      roomId: rooms[7].roomId, // Room 501
      stayTypeId: stayTypes[3].stayTypeId, // Long-term
      reserveStatus: 5,
      reserveType: 1,
      periodFrom: new Date('2026-05-01'),
      periodTo: new Date('2026-07-31'),
      bookingUnitPrice: 15000000,
      cancelReason: 'Khach thay doi ke hoach cong tac',
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
      occupierName: 'Tran Van Dung',
      occupierNameEn: 'Tran Van Dung',
      sex: 1,
      tel: '0934567890',
      orderNum: 1,
    },
    {
      reserveId: reserves[2].reserveId,
      clientId: client3.clientId,
      occupierName: 'Pham Thi Hoa',
      occupierNameEn: 'Pham Thi Hoa',
      sex: 2,
      tel: '0945678901',
      orderNum: 1,
    },
    {
      reserveId: reserves[2].reserveId,
      clientId: client3.clientId,
      occupierName: 'Vo Van Khanh',
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

  console.log('\nSeed completed successfully!');
  console.log('\nLogin credentials:');
  console.log('  Admin:     admin@hotel.com      / admin123');
  console.log('  Manager:   manager@hotel.com    / manager123');
  console.log('  Staff:     cam.tran@hotel.com   / staff123');
  console.log('  Part-time: phuc.hoang@hotel.com / parttime123');
  console.log('\nSample data:');
  console.log('  Countries:    7 (VN, JP, US, CN, KR, TH, KH)');
  console.log('  Facilities:   3 (Saigon Central, Saigon Riverside, Kho Tan Binh)');
  console.log('  RoomClasses:  3 (Standard, Deluxe, Suite)');
  console.log('  RoomTypes:    5 (Phong Don, Phong Doi, Phong Twin, Deluxe Doi, Phong Suite)');
  console.log('  Rooms:        12 (8 Saigon Central + 4 Saigon Riverside)');
  console.log('  StayTypes:    4 (Tuan, 2 Tuan, Thang, Dai han)');
  console.log('  Clients:      5 (3 VN, 1 US, 1 KR)');
  console.log('  Reservations: 6 (1 Pending, 2 Confirmed, 1 Checked-in, 1 Checked-out, 1 Cancelled)');
  console.log('  Occupiers:    3 (co-guests)');
}

main().catch((e: unknown) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
