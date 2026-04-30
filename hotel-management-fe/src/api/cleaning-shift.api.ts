import apiClient from '@/lib/axios'
import type {
  CleanDetailNote,
  CleaningDetail,
  CleaningShiftFilterParams,
  Cleans,
  CopyCleaningDetailBody,
  CreateCleanDetailNoteBody,
  CreateCleaningDetailBody,
  UpdateCleanDetailNoteBody,
  UpdateCleaningDetailBody,
  UpdateCleaningDetailType1Body,
  UpdateCleaningDetailType2Body,
  UpdateCleaningDetailType3Body,
  UpdateCleaningStatusBody,
  UpdateCleansBody,
  UpdateMainStaffBody,
  UpsertCleansBody,
} from '@/types/cleaning-shift'

export const cleaningShiftApi = {
  getAll: (params: CleaningShiftFilterParams) =>
    apiClient.get<Cleans>('/cleaning-shifts', { params }),

  upsertCleans: (data: UpsertCleansBody) => apiClient.post<Cleans>('/cleaning-shifts', data),

  updateCleans: (cleanId: number, data: UpdateCleansBody) =>
    apiClient.patch<Cleans>(`/cleaning-shifts/${cleanId}`, data),

  createDetail: (cleanId: number, data: CreateCleaningDetailBody) =>
    apiClient.post<CleaningDetail>(`/cleaning-shifts/${cleanId}/details`, data),

  getDetail: (id: number) => apiClient.get<CleaningDetail>(`/cleaning-shifts/details/${id}`),

  updateDetail: (id: number, data: UpdateCleaningDetailBody) =>
    apiClient.patch<CleaningDetail>(`/cleaning-shifts/details/${id}`, data),

  updateDetailType1: (id: number, data: UpdateCleaningDetailType1Body) =>
    apiClient.patch<CleaningDetail>(`/cleaning-shifts/details/${id}/type1`, data),

  updateDetailType2: (id: number, data: UpdateCleaningDetailType2Body) =>
    apiClient.patch<CleaningDetail>(`/cleaning-shifts/details/${id}/type2`, data),

  updateDetailType3: (id: number, data: UpdateCleaningDetailType3Body) =>
    apiClient.patch<CleaningDetail>(`/cleaning-shifts/details/${id}/type3`, data),

  updateStatus: (id: number, data: UpdateCleaningStatusBody) =>
    apiClient.patch<CleaningDetail>(`/cleaning-shifts/details/${id}/status`, data),

  updateMainStaff: (id: number, data: UpdateMainStaffBody) =>
    apiClient.patch<CleaningDetail>(`/cleaning-shifts/details/${id}/main-staff`, data),

  copyDetail: (id: number, data: CopyCleaningDetailBody) =>
    apiClient.post<CleaningDetail>(`/cleaning-shifts/details/${id}/copy`, data),

  deleteDetail: (id: number) => apiClient.delete(`/cleaning-shifts/details/${id}`),

  getNotes: (detailId: number) =>
    apiClient.get<CleanDetailNote[]>(`/cleaning-shifts/details/${detailId}/notes`),

  addNote: (detailId: number, data: CreateCleanDetailNoteBody) =>
    apiClient.post<CleanDetailNote>(`/cleaning-shifts/details/${detailId}/notes`, data),

  updateNote: (noteId: number, data: UpdateCleanDetailNoteBody) =>
    apiClient.patch<CleanDetailNote>(`/cleaning-shifts/notes/${noteId}`, data),

  deleteNote: (noteId: number) => apiClient.delete(`/cleaning-shifts/notes/${noteId}`),
}
