import { Injectable } from '@nestjs/common';
import { FacilityRoomTypeRepository } from './facility-room-type.repository';
import {
  FacilityRoomTypeMatrixDto,
  FacilityRowDto,
  RoomTypeCellDto,
  UpsertFacilityRoomTypeDto,
} from './dto';

@Injectable()
export class FacilityRoomTypeService {
  constructor(private readonly repository: FacilityRoomTypeRepository) { }

  async getMatrix(): Promise<FacilityRoomTypeMatrixDto> {
    const { facilities, roomTypes, roomExistsSet, acreageMap } =
      await this.repository.getMatrix();

    const result = new FacilityRoomTypeMatrixDto();
    result.facilities = facilities.map((facility) => {
      const row = new FacilityRowDto();
      row.facilityId = facility.facilityId;
      row.facilityName = facility.facilityName;
      row.colorOption = facility.colorOption;
      row.roomTypes = roomTypes.map((rt) => {
        const key = `${facility.facilityId}-${rt.roomTypeId}`;
        const cell = new RoomTypeCellDto();
        cell.roomTypeId = rt.roomTypeId;
        cell.roomTypeNameShort = rt.roomTypeNameShort;
        cell.roomTypeName = rt.roomTypeName;
        cell.acreage = acreageMap.get(key) ?? null;
        cell.isExists = roomExistsSet.has(key);
        return cell;
      });
      return row;
    });

    return result;
  }

  async upsertMatrix(dto: UpsertFacilityRoomTypeDto, staffId: number): Promise<void> {
    await this.repository.upsertMatrix(dto.facilities, staffId);
  }
}
