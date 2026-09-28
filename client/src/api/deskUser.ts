import { IDeskUser } from '@/types/IUser';
import request from '@/utils/request';

export function fetchFindReceiverByUuid(uuid) {
  return request.get(`/desk_user/find_receiver_by_uuid`, { params: { uuid } });
}

export function fetchDeskUserLogin(data: IDeskUser) {
  return request.post<IDeskUser>(`/desk_user/login`, data);
}

export function fetchDeskUserLinkVerify(data: IDeskUser) {
  return request.post(`/desk_user/link_verify`, data);
}

export function fetchDeskUserCreate() {
  return request.post<IDeskUser>(`/desk_user/create`);
}

export function fetchDeskUserUpdateByUuid(data: IDeskUser) {
  return request.put<IDeskUser>(`/desk_user/update_by_uuid`, data);
}

export interface SavedDeskDevice {
  uuid: string;
  password: string;
  name: string;
}

export function fetchSyncDeskDevices(data: {
  uuid: string;
  password: string;
  devices: SavedDeskDevice[];
}) {
  return request.post<{ saved: number }>(`/desk_user/sync_devices`, data);
}

export function fetchListDeskDevices(data: { uuid: string; password: string }) {
  return request.post<SavedDeskDevice[]>(`/desk_user/list_devices`, data);
}

export function fetchDeleteDeskDevice(data: {
  uuid: string;
  password: string;
  remote_uuid: string;
}) {
  return request.post(`/desk_user/delete_device`, data);
}
