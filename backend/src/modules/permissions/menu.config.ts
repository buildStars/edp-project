/**
 * 后端菜单配置
 * 统一管理所有菜单项及其权限要求
 */

export interface MenuItem {
  path: string;
  name: string;
  title: string;
  icon?: string;
  permission?: string; // 所需权限代码
  roles?: string[]; // 允许的角色列表（如果不设置则根据permission判断）
  children?: MenuItem[];
  hidden?: boolean;
}

/**
 * 完整菜单配置
 * 由后端统一维护，前端只负责渲染
 */
export const MENU_CONFIG: MenuItem[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    title: '首页概览',
    icon: 'DataLine',
    permission: 'dashboard:view',
  },
  {
    path: '/news',
    name: 'News',
    title: '资讯管理',
    icon: 'Reading',
    permission: 'news:view',
    roles: ['ADMIN', 'STAFF'], // 只有管理员和教务可见
    children: [
      {
        path: '/news/list',
        name: 'NewsList',
        title: '资讯列表',
        permission: 'news:view',
      },
    ],
  },
  {
    path: '/associations',
    name: 'Associations',
    title: '校友生活',
    icon: 'UserFilled',
    permission: 'associations:view',
    roles: ['ADMIN', 'STAFF'],
    children: [
      {
        path: '/associations/list',
        name: 'AssociationsList',
        title: '协会列表',
        permission: 'associations:view',
      },
      {
        path: '/associations/activities',
        name: 'Activities',
        title: '活动列表',
        permission: 'activities:view',
      },
    ],
  },
  {
    path: '/courses',
    name: 'Courses',
    title: '课程管理',
    icon: 'Reading',
    permission: 'courses:view',
    roles: ['ADMIN', 'STAFF'],
    children: [
      {
        path: '/courses/list',
        name: 'CoursesList',
        title: '课程列表',
        permission: 'courses:view',
      },
    ],
  },
  {
    path: '/users',
    name: 'Users',
    title: '用户管理',
    icon: 'User',
    permission: 'users:view',
    children: [
      {
        path: '/users/list',
        name: 'UsersList',
        title: '用户列表',
        permission: 'users:view',
      },
      {
        path: '/users/advisors',
        name: 'AdvisorsList',
        title: '课程顾问',
        permission: 'advisors:view',
      },
    ],
  },
  {
    path: '/organizations',
    name: 'Organizations',
    title: '企业管理',
    icon: 'OfficeBuilding',
    permission: 'organizations:view',
    children: [
      {
        path: '/organizations/list',
        name: 'OrganizationsList',
        title: '企业列表',
        permission: 'organizations:view',
      },
    ],
  },
  {
    path: '/enrollments',
    name: 'Enrollments',
    title: '报名管理',
    icon: 'Tickets',
    permission: 'enrollments:view',
    roles: ['ADMIN', 'STAFF'],
    children: [
      {
        path: '/enrollments/list',
        name: 'EnrollmentsList',
        title: '课程报名',
        permission: 'enrollments:view',
      },
      {
        path: '/enrollments/course-gifts',
        name: 'CourseGifts',
        title: '赠送记录',
        permission: 'course-gifts:view',
      },
      {
        path: '/enrollments/evaluations',
        name: 'Evaluations',
        title: '评价管理',
        permission: 'evaluations:view',
      },
    ],
  },
  {
    path: '/materials',
    name: 'Materials',
    title: '课件管理',
    icon: 'FolderOpened',
    permission: 'courseware:view',
    roles: ['ADMIN', 'STAFF'],
    children: [
      {
        path: '/materials/list',
        name: 'MaterialsList',
        title: '课件列表',
        permission: 'courseware:view',
      },
    ],
  },
  {
    path: '/approvals',
    name: 'Approvals',
    title: '审批管理',
    icon: 'DocumentChecked',
    permission: 'approvals:view',
    roles: ['ADMIN', 'STAFF'],
    children: [
      {
        path: '/associations/join-requests',
        name: 'AssociationJoinRequests',
        title: '协会加入申请',
        permission: 'associations:join-requests',
      },
      {
        path: '/enrollments/trials',
        name: 'Trials',
        title: '试听报名申请',
        permission: 'trials:view',
      },
      {
        path: '/courses/approve',
        name: 'CoursesApprove',
        title: '课程审批',
        permission: 'courses:approve',
      },
      {
        path: '/enrollments/credit-requests',
        name: 'CreditRequests',
        title: '学分申请审批',
        permission: 'credit-requests:review',
      },
      {
        path: '/completion-requests',
        name: 'CompletionRequests',
        title: '结课申请审批',
        permission: 'completion:review',
      },
      {
        path: '/enrollments/refund-requests',
        name: 'RefundRequests',
        title: '取消报名审批',
        permission: 'refunds:view',
      },
    ],
  },
  {
    path: '/settings',
    name: 'Settings',
    title: '系统设置',
    icon: 'Setting',
    permission: 'settings:view',
    roles: ['ADMIN', 'STAFF'],
    children: [
      {
        path: '/settings/basic',
        name: 'BasicSettings',
        title: '基础设置',
        permission: 'settings:view',
      },
      {
        path: '/settings/roles',
        name: 'RoleSettings',
        title: '角色权限',
        permission: 'permissions:manage',
      },
      {
        path: '/settings/ai-config',
        name: 'AiConfig',
        title: 'AI 配置',
        permission: 'settings:view',
      },
    ],
  },
  {
    path: '/teacher',
    name: 'Teacher',
    title: '我的课程',
    icon: 'Reading',
    permission: 'my-courses:view',
    roles: ['TEACHER'], // 只有教师可见
    children: [
      {
        path: '/teacher/courses',
        name: 'TeacherCourses',
        title: '课程列表',
        permission: 'my-courses:view',
      },
      {
        path: '/teacher/credit-requests',
        name: 'TeacherCreditRequests',
        title: '学分申请',
        permission: 'credit-requests:view',
      },
      {
        path: '/teacher/completion-requests',
        name: 'TeacherCompletionRequests',
        title: '结课申请',
        permission: 'completion:view',
      },
    ],
  },
  {
    path: '/profile',
    name: 'Profile',
    title: '个人中心',
    icon: 'User',
    // 个人中心不需要权限控制，所有人都能访问
  },
];

