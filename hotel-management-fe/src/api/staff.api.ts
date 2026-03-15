import apiClient from '@/lib/axios'
import type { CreateStaffBody, Staff, UpdateStaffBody } from '@/types/staff'

export const staffApi = {
  getStaffs: (params?: { staffType?: number }) =>
    apiClient.get<Staff[]>('/staffs', { params }),

  createStaff: (data: CreateStaffBody) =>
    apiClient.post('/staffs', data),

  updateStaff: ({ staffId, ...data }: UpdateStaffBody) =>
    apiClient.put(`/staffs/${staffId}`, data),

  deleteStaff: (staffId: number) =>
    apiClient.delete(`/staffs/${staffId}`),
}
