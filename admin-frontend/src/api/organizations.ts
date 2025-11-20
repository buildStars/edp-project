import request from '@/utils/request';

export interface Organization {
  id: string;
  name: string;
  adminId: string;
  admin?: {
    id: string;
    nickname: string;
    realName: string;
    phone: string;
  };
  maxStudents: number;
  totalCredits: number;
  usedCredits: number;
  contactPerson?: string;
  contactPhone?: string;
  createdAt: string;
  updatedAt: string;
  userCount?: number;
}

export interface CreateOrganizationDto {
  name: string;
  adminId: string;
  maxStudents?: number;
  totalCredits?: number;
  contactPerson?: string;
  contactPhone?: string;
}

export interface UpdateOrganizationDto extends Partial<CreateOrganizationDto> {
  id: string;
}

/**
 * 获取企业列表
 */
export function getOrganizations(params?: {
  page?: number;
  pageSize?: number;
  keyword?: string;
}) {
  return request({
    url: '/organizations',
    method: 'get',
    params,
  });
}

/**
 * 获取企业详情
 */
export function getOrganization(id: string) {
  return request({
    url: `/organizations/${id}`,
    method: 'get',
  });
}

/**
 * 创建企业
 */
export function createOrganization(data: CreateOrganizationDto) {
  return request({
    url: '/organizations',
    method: 'post',
    data,
  });
}

/**
 * 更新企业
 */
export function updateOrganization(id: string, data: Partial<CreateOrganizationDto>) {
  return request({
    url: `/organizations/${id}`,
    method: 'put',
    data,
  });
}

/**
 * 删除企业
 */
export function deleteOrganization(id: string) {
  return request({
    url: `/organizations/${id}`,
    method: 'delete',
  });
}

/**
 * 获取企业员工列表
 */
export function getOrganizationEmployees(organizationId: string) {
  return request({
    url: `/organizations/${organizationId}/employees`,
    method: 'get',
  });
}

/**
 * 添加企业员工
 */
export function addOrganizationEmployee(organizationId: string, userId: string) {
  return request({
    url: `/organizations/${organizationId}/employees`,
    method: 'post',
    data: { userId },
  });
}

/**
 * 移除企业员工
 */
export function removeOrganizationEmployee(organizationId: string, userId: string) {
  return request({
    url: `/organizations/${organizationId}/employees/${userId}`,
    method: 'delete',
  });
}

/**
 * 为企业管理员充值学分
 */
export function rechargeAdminCredits(adminId: string, amount: number, remark?: string) {
  return request({
    url: `/credits/admin/recharge`,
    method: 'post',
    data: {
      userId: adminId,
      amount,
      remark,
    },
  });
}

