export class BicycleParkingResponseDto {
  bicycleParkingId!: number;
  dataStatus!: number;
  parentFacilityId!: number;
  number!: string;
  notice!: string | null;
  orderNum!: number;
  createdAt!: Date;
  updatedAt!: Date;
  updatedStaffName!: string | null;

  static fromEntity(entity: any): BicycleParkingResponseDto {
    const dto = new BicycleParkingResponseDto();
    dto.bicycleParkingId = entity.bicycleParkingId;
    dto.dataStatus = entity.dataStatus;
    dto.parentFacilityId = entity.parentFacilityId;
    dto.number = entity.number;
    dto.notice = entity.notice;
    dto.orderNum = entity.orderNum;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    dto.updatedStaffName = entity.updatedBy?.staffName ?? null;
    return dto;
  }
}
