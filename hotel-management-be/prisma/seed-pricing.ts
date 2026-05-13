import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * Seeds RequestType (fee categories) and a few default ServicePrice rows.
 * Run with: pnpm ts-node prisma/seed-pricing.ts
 *
 * IDs are pinned to the legacy frontend enum (RequestType in
 * aic-yokohama-weekly-mansion-FE/src/constants/common.ts) so existing
 * request_details rows referenced by `request_type_id` keep their meaning.
 */

interface RequestTypeSeed {
  requestTypeId: number;
  requestTypeName: string;
  requestTypeNameEn: string;
  category: 'rent' | 'service' | 'parking' | 'trunkroom' | 'deposit' | 'discount' | 'other';
  taxFreeDefault?: boolean;
  isRefund?: boolean;
  orderNum: number;
}

const REQUEST_TYPES: RequestTypeSeed[] = [
  // ── Rent ─────────────────────────────────────
  { requestTypeId: 1,  requestTypeName: 'Tiền thuê phòng',          requestTypeNameEn: 'Rent',                        category: 'rent',     orderNum: 1 },
  { requestTypeId: 2,  requestTypeName: 'Tiền thuê (Khuyến mãi)',   requestTypeNameEn: 'Rent (Campaign)',             category: 'rent',     orderNum: 2 },
  { requestTypeId: 3,  requestTypeName: 'Tiền thuê (Một phần)',     requestTypeNameEn: 'Rent (Partial)',              category: 'rent',     orderNum: 3 },
  { requestTypeId: 4,  requestTypeName: 'Tiền thuê (Số dư)',        requestTypeNameEn: 'Rent (Remaining Balance)',    category: 'rent',     orderNum: 4 },
  { requestTypeId: 5,  requestTypeName: 'Hoàn tiền thuê',           requestTypeNameEn: 'Rent Refund',                 category: 'rent',     isRefund: true, orderNum: 5 },
  { requestTypeId: 13, requestTypeName: 'Tiền thuê (gồm phí dịch vụ)', requestTypeNameEn: 'Rent (Utility+Mainte+Clean)', category: 'rent', orderNum: 6 },
  { requestTypeId: 18, requestTypeName: 'Tiền thuê (Rakuten)',      requestTypeNameEn: 'Rent (Rakuten)',              category: 'rent',     orderNum: 7 },
  { requestTypeId: 26, requestTypeName: 'Phí mùa cao điểm',          requestTypeNameEn: 'Seasonal Fee',                category: 'rent',     orderNum: 8 },
  { requestTypeId: 39, requestTypeName: 'Tiền thuê (Now Room)',     requestTypeNameEn: 'Rent (Now Room)',             category: 'rent',     orderNum: 9 },
  { requestTypeId: 44, requestTypeName: 'Tiền thuê (Day Use)',      requestTypeNameEn: 'Rent (Day Use)',              category: 'rent',     orderNum: 10 },

  // ── Services ────────────────────────────────
  { requestTypeId: 6,  requestTypeName: 'Điện nước (Thực tế)',      requestTypeNameEn: 'Utility (Actual)',            category: 'service',  orderNum: 20 },
  { requestTypeId: 7,  requestTypeName: 'Phí quản lý (Tháng)',       requestTypeNameEn: 'Management Fee (Monthly)',    category: 'service',  orderNum: 21 },
  { requestTypeId: 8,  requestTypeName: 'Điện nước (Tháng)',         requestTypeNameEn: 'Utility (Monthly)',           category: 'service',  orderNum: 22 },
  { requestTypeId: 9,  requestTypeName: 'Phí dọn dẹp (Tháng)',       requestTypeNameEn: 'Cleaning Fee (Monthly)',      category: 'service',  orderNum: 23 },
  { requestTypeId: 14, requestTypeName: 'Phí quản lý (Plan A)',      requestTypeNameEn: 'Management Fee (Plan A)',     category: 'service',  orderNum: 24 },
  { requestTypeId: 15, requestTypeName: 'Điện nước (Plan A)',        requestTypeNameEn: 'Utility (Plan A)',            category: 'service',  orderNum: 25 },
  { requestTypeId: 17, requestTypeName: 'Bãi xe đạp',                requestTypeNameEn: 'Bicycle Parking',             category: 'service',  orderNum: 26 },
  { requestTypeId: 20, requestTypeName: 'Giặt là (R/P)',             requestTypeNameEn: 'Cleaning (R/P)',              category: 'service',  orderNum: 27 },
  { requestTypeId: 21, requestTypeName: 'Phí điện thoại',            requestTypeNameEn: 'Phone Bill',                  category: 'service',  orderNum: 28 },
  { requestTypeId: 28, requestTypeName: 'Chăn ga thêm',              requestTypeNameEn: 'Extra Bedding',               category: 'service',  orderNum: 29 },
  { requestTypeId: 29, requestTypeName: 'Bộ bếp',                    requestTypeNameEn: 'Kitchen Set',                 category: 'service',  orderNum: 30 },
  { requestTypeId: 30, requestTypeName: 'Khăn vải',                  requestTypeNameEn: 'Linen',                       category: 'service',  orderNum: 31 },
  { requestTypeId: 31, requestTypeName: 'WIMAX / Wi-Fi',             requestTypeNameEn: 'WIMAX / Wi-Fi',               category: 'service',  orderNum: 32 },
  { requestTypeId: 32, requestTypeName: 'Đổi chìa khóa',             requestTypeNameEn: 'Key Exchange',                category: 'service',  orderNum: 33 },
  { requestTypeId: 33, requestTypeName: 'Phí sửa chữa',              requestTypeNameEn: 'Repair Fee',                  category: 'service',  orderNum: 34 },
  { requestTypeId: 23, requestTypeName: 'Phí đổi phòng',             requestTypeNameEn: 'Room Change Fee',             category: 'service',  orderNum: 35 },
  { requestTypeId: 24, requestTypeName: 'Phí kéo dài thời gian',     requestTypeNameEn: 'Time Extension',              category: 'service',  orderNum: 36 },

  // ── Deposit ─────────────────────────────────
  { requestTypeId: 10, requestTypeName: 'Đặt cọc',                   requestTypeNameEn: 'Deposit',                     category: 'deposit',  taxFreeDefault: true, orderNum: 40 },
  { requestTypeId: 11, requestTypeName: 'Hoàn tiền cọc',             requestTypeNameEn: 'Deposit Refund',              category: 'deposit',  taxFreeDefault: true, isRefund: true, orderNum: 41 },

  // ── Discount / Penalty / Cancel ─────────────
  { requestTypeId: 12, requestTypeName: 'Giảm giá',                  requestTypeNameEn: 'Discount',                    category: 'discount', taxFreeDefault: true, orderNum: 50 },
  { requestTypeId: 22, requestTypeName: 'Hủy đặt phòng',             requestTypeNameEn: 'Cancellation',                category: 'discount', orderNum: 51 },
  { requestTypeId: 25, requestTypeName: 'Phí phạt',                   requestTypeNameEn: 'Penalty',                     category: 'discount', orderNum: 52 },
  { requestTypeId: 27, requestTypeName: 'Phí Double-Up',             requestTypeNameEn: 'Double-Up Fee',               category: 'discount', orderNum: 53 },

  // ── Parking ─────────────────────────────────
  { requestTypeId: 40, requestTypeName: 'Bãi đỗ xe',                 requestTypeNameEn: 'Parking',                     category: 'parking',  orderNum: 60 },
  { requestTypeId: 49, requestTypeName: 'Bãi đỗ xe (Tòa 14)',        requestTypeNameEn: 'Parking (Bldg 14)',           category: 'parking',  orderNum: 61 },
  { requestTypeId: 50, requestTypeName: 'Bãi đỗ xe (Tòa 18)',        requestTypeNameEn: 'Parking (Bldg 18)',           category: 'parking',  orderNum: 62 },
  { requestTypeId: 51, requestTypeName: 'Bãi đỗ xe (Tòa 8)',         requestTypeNameEn: 'Parking (Bldg 8)',            category: 'parking',  orderNum: 63 },
  { requestTypeId: 52, requestTypeName: 'Bãi đỗ xe (Tòa 16)',        requestTypeNameEn: 'Parking (Bldg 16)',           category: 'parking',  orderNum: 64 },
  { requestTypeId: 53, requestTypeName: 'Bãi đỗ xe (Tòa 20)',        requestTypeNameEn: 'Parking (Bldg 20)',           category: 'parking',  orderNum: 65 },
  { requestTypeId: 54, requestTypeName: 'Bãi đỗ xe (Tòa 17)',        requestTypeNameEn: 'Parking (Bldg 17)',           category: 'parking',  orderNum: 66 },
  { requestTypeId: 55, requestTypeName: 'Bãi đỗ xe (Tòa 22)',        requestTypeNameEn: 'Parking (Bldg 22)',           category: 'parking',  orderNum: 67 },
  { requestTypeId: 60, requestTypeName: 'Hoàn tiền bãi đỗ',          requestTypeNameEn: 'Parking Refund',              category: 'parking',  isRefund: true, orderNum: 68 },

  // ── Trunk Room ──────────────────────────────
  { requestTypeId: 47, requestTypeName: 'Kho chứa (BOX)',            requestTypeNameEn: 'Trunk Room (BOX)',            category: 'trunkroom', orderNum: 70 },
  { requestTypeId: 56, requestTypeName: 'Kho chứa (Nhỏ)',            requestTypeNameEn: 'Trunk Room (Small)',          category: 'trunkroom', orderNum: 71 },
  { requestTypeId: 57, requestTypeName: 'Kho chứa (Trung)',          requestTypeNameEn: 'Trunk Room (Medium)',         category: 'trunkroom', orderNum: 72 },
  { requestTypeId: 58, requestTypeName: 'Kho chứa (Lớn)',            requestTypeNameEn: 'Trunk Room (Large)',          category: 'trunkroom', orderNum: 73 },

  // ── Other ───────────────────────────────────
  { requestTypeId: 34, requestTypeName: 'Hoàn điểm C/B',             requestTypeNameEn: 'Point C/B',                   category: 'other',    orderNum: 90 },
  { requestTypeId: 35, requestTypeName: 'Phí thẻ tín dụng',          requestTypeNameEn: 'Credit Fee',                  category: 'other',    orderNum: 91 },
  { requestTypeId: 36, requestTypeName: 'Doanh thu khác',             requestTypeNameEn: 'Other Sales',                 category: 'other',    orderNum: 92 },
  { requestTypeId: 37, requestTypeName: 'Số dư thừa',                requestTypeNameEn: 'Excess Payment',               category: 'other',    orderNum: 93 },
  { requestTypeId: 38, requestTypeName: 'Hoàn số dư thừa',           requestTypeNameEn: 'Excess Payment Refund',        category: 'other',    isRefund: true, orderNum: 94 },
  { requestTypeId: 46, requestTypeName: 'Phí chuyển khoản',           requestTypeNameEn: 'Bank Transfer Fee',            category: 'other',    orderNum: 95 },
  { requestTypeId: 48, requestTypeName: 'Tiền taxi',                 requestTypeNameEn: 'Taxi Fee',                     category: 'other',    orderNum: 96 },
  { requestTypeId: 99, requestTypeName: 'Khác',                       requestTypeNameEn: 'Other',                       category: 'other',    orderNum: 99 },
];

interface ServicePriceSeed {
  requestTypeId: number;
  unitPrice: number;
  unit: number; // 1=Month, 2=Day, 3=Time
  description: string;
}

const SERVICE_PRICES: ServicePriceSeed[] = [
  { requestTypeId: 6,  unitPrice: 50000,  unit: 1, description: 'Phí điện nước cố định mỗi tháng' },
  { requestTypeId: 7,  unitPrice: 30000,  unit: 1, description: 'Phí quản lý hàng tháng' },
  { requestTypeId: 8,  unitPrice: 60000,  unit: 1, description: 'Điện nước theo tháng' },
  { requestTypeId: 9,  unitPrice: 25000,  unit: 1, description: 'Phí dọn dẹp hàng tháng' },
  { requestTypeId: 14, unitPrice: 35000,  unit: 1, description: 'Phí quản lý gói A' },
  { requestTypeId: 15, unitPrice: 65000,  unit: 1, description: 'Điện nước gói A' },
  { requestTypeId: 17, unitPrice: 5000,   unit: 1, description: 'Bãi đỗ xe đạp' },
  { requestTypeId: 21, unitPrice: 1000,   unit: 3, description: 'Phí điện thoại / cuộc' },
  { requestTypeId: 28, unitPrice: 3000,   unit: 3, description: 'Bộ chăn ga thêm' },
  { requestTypeId: 29, unitPrice: 5000,   unit: 3, description: 'Bộ bếp' },
  { requestTypeId: 30, unitPrice: 2000,   unit: 3, description: 'Bộ khăn vải' },
  { requestTypeId: 31, unitPrice: 3000,   unit: 1, description: 'WiFi / WIMAX hàng tháng' },
  { requestTypeId: 32, unitPrice: 10000,  unit: 3, description: 'Đổi chìa khóa' },
  { requestTypeId: 23, unitPrice: 8000,   unit: 3, description: 'Phí đổi phòng' },
  { requestTypeId: 24, unitPrice: 1500,   unit: 3, description: 'Phí kéo dài (mỗi giờ)' },
];

async function main(): Promise<void> {
  const connectionString = process.env['DATABASE_URL'];
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });
  await prisma.$connect();

  console.log('Seeding pricing data...');

  const admin = await prisma.staff.findFirst({
    where: { staffType: 1, deletedAt: null },
    orderBy: { staffId: 'asc' },
  });
  if (!admin) {
    throw new Error('No admin staff found. Run main seed first.');
  }

  // ── Request Types ──────────────────────────────────
  console.log('\n  Seeding request types...');
  for (const rt of REQUEST_TYPES) {
    await prisma.requestType.upsert({
      where: { requestTypeId: rt.requestTypeId },
      create: {
        requestTypeId: rt.requestTypeId,
        requestTypeName: rt.requestTypeName,
        requestTypeNameEn: rt.requestTypeNameEn,
        category: rt.category,
        taxFreeDefault: rt.taxFreeDefault ?? false,
        isRefund: rt.isRefund ?? false,
        orderNum: rt.orderNum,
        createdStaffId: admin.staffId,
      },
      update: {
        requestTypeName: rt.requestTypeName,
        requestTypeNameEn: rt.requestTypeNameEn,
        category: rt.category,
        taxFreeDefault: rt.taxFreeDefault ?? false,
        isRefund: rt.isRefund ?? false,
        orderNum: rt.orderNum,
        updatedStaffId: admin.staffId,
      },
    });
  }
  console.log(`    ${REQUEST_TYPES.length} request types upserted.`);

  // ── Service Prices ─────────────────────────────────
  console.log('\n  Seeding default service prices...');
  for (const sp of SERVICE_PRICES) {
    const existing = await prisma.servicePrice.findFirst({
      where: {
        requestTypeId: sp.requestTypeId,
        facilityId: null,
        deletedAt: null,
      },
    });

    if (existing) {
      await prisma.servicePrice.update({
        where: { servicePriceId: existing.servicePriceId },
        data: {
          unitPrice: BigInt(sp.unitPrice),
          unit: sp.unit,
          description: sp.description,
          updatedStaffId: admin.staffId,
        },
      });
    } else {
      await prisma.servicePrice.create({
        data: {
          requestTypeId: sp.requestTypeId,
          unitPrice: BigInt(sp.unitPrice),
          unit: sp.unit,
          description: sp.description,
          createdStaffId: admin.staffId,
        },
      });
    }
  }
  console.log(`    ${SERVICE_PRICES.length} service prices upserted.`);

  console.log('\nPricing seed complete.');
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
