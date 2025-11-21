/**
 * 权限配置
 * 定义每个路由对应的权限代码
 */

export interface MenuItem {
  path: string
  name: string
  title: string
  icon?: string
  permission?: string // 权限代码
  children?: MenuItem[]
  hidden?: boolean
  hideForRoles?: string[] // 对指定角色隐藏
}

/**
 * 菜单配置（带权限）
 */
export const menuConfig: MenuItem[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    title: '首页概览',
    icon: 'DataLine',
    permission: 'statistics:dashboard', // 改为后端返回的权限代码
  },
  {
    path: '/news',
    name: 'News',
    title: '资讯管理',
    icon: 'Reading',
    permission: 'news:view',
    hideForRoles: ['TEACHER'], // 教师不显示
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
    permission: 'association:view', // 改为后端返回的权限代码
    hideForRoles: ['TEACHER'], // 教师不显示
    children: [
      {
        path: '/associations/list',
        name: 'AssociationsList',
        title: '协会列表',
        permission: 'association:view', // 改为后端返回的权限代码
      },
      {
        path: '/associations/activities',
        name: 'Activities',
        title: '活动列表',
        permission: 'activity:view', // 改为后端返回的权限代码
      },
    ],
  },
  {
    path: '/courses',
    name: 'Courses',
    title: '课程管理',
    icon: 'Reading',
    permission: 'course:view', // 改为后端返回的权限代码
    hideForRoles: ['TEACHER'], // 教师使用"我的课程"代替
    children: [
      {
        path: '/courses/list',
        name: 'CoursesList',
        title: '课程列表',
        permission: 'course:view', // 改为后端返回的权限代码
      },
      {
        path: '/courses/chapters',
        name: 'ChaptersList',
        title: '章节管理',
        permission: 'chapter:view', // 改为后端返回的权限代码
      },
    ],
  },
  {
    path: '/users',
    name: 'Users',
    title: '用户管理',
    icon: 'User',
    permission: 'user:view', // 改为后端返回的权限代码
    // 教师也可以查看用户管理，用于创建和编辑学员
    children: [
      {
        path: '/users/list',
        name: 'UsersList',
        title: '用户列表',
        permission: 'user:view', // 改为后端返回的权限代码
      },
      {
        path: '/users/advisors',
        name: 'AdvisorsList',
        title: '课程顾问',
        permission: 'teacher_student:view', // 改为后端返回的权限代码
      },
    ],
  },
  {
    path: '/organizations',
    name: 'Organizations',
    title: '企业管理',
    icon: 'OfficeBuilding',
    permission: 'organization:view', // 改为后端返回的权限代码
    children: [
      {
        path: '/organizations/list',
        name: 'OrganizationsList',
        title: '企业列表',
        permission: 'organization:view', // 改为后端返回的权限代码
      },
    ],
  },
  {
    path: '/enrollments',
    name: 'Enrollments',
    title: '报名管理',
    icon: 'Tickets',
    permission: 'enrollment:view', // 改为后端返回的权限代码
    children: [
      {
        path: '/enrollments/list',
        name: 'EnrollmentsList',
        title: '报名列表',
        permission: 'enrollment:view', // 改为后端返回的权限代码
      },
      {
        path: '/enrollments/trials',
        name: 'Trials',
        title: '试听申请',
        permission: 'enrollment:trial:view', // 改为后端返回的权限代码
      },
      {
        path: '/enrollments/refund-requests',
        name: 'RefundRequests',
        title: '退课申请',
        permission: 'enrollment:refund:view', // 改为后端返回的权限代码
      },
      {
        path: '/enrollments/credit-requests',
        name: 'CreditRequests',
        title: '学分申请审批',
        permission: 'credit:request:review', // 改为后端返回的权限代码
      },
      {
        path: '/enrollments/course-gifts',
        name: 'CourseGifts',
        title: '赠送记录',
        permission: 'course_gift:view', // 改为后端返回的权限代码
      },
      {
        path: '/enrollments/evaluations',
        name: 'Evaluations',
        title: '评价管理',
        permission: 'evaluation:view', // 改为后端返回的权限代码
        hideForRoles: ['TEACHER'],
      },
    ],
  },
  {
    path: '/courseware',
    name: 'Courseware',
    title: '课件管理',
    icon: 'FolderOpened',
    permission: 'material:view', // 改为后端返回的权限代码
    hideForRoles: ['TEACHER'], // 教师在自己课程中管理课件
    children: [
      {
        path: '/courseware/list',
        name: 'CoursewareList',
        title: '课件列表',
        permission: 'material:view', // 改为后端返回的权限代码
      },
    ],
  },
  {
    path: '/settings',
    name: 'Settings',
    title: '系统设置',
    icon: 'Setting',
    permission: 'system:settings', // 改为后端返回的权限代码
    hideForRoles: ['TEACHER'], // 教师不显示系统设置
    children: [
      {
        path: '/settings/basic',
        name: 'BasicSettings',
        title: '基础设置',
        permission: 'system:settings', // 改为后端返回的权限代码
      },
      {
        path: '/settings/roles',
        name: 'RoleSettings',
        title: '角色权限',
        permission: 'system:permissions', // 改为后端返回的权限代码
      },
      {
        path: '/settings/ai-config',
        name: 'AiConfig',
        title: 'AI 配置',
        permission: 'ai:config:view', // 改为后端返回的权限代码
      },
    ],
  },
  {
    path: '/teacher',
    name: 'Teacher',
    title: '教学管理',
    icon: 'Reading',
    permission: 'course:view', // 改为后端返回的权限代码（教师有 course:view 权限）
    children: [
      {
        path: '/teacher/courses',
        name: 'TeacherCourses',
        title: '我的课程',
        permission: 'course:view', // 改为后端返回的权限代码
      },
      {
        path: '/teacher/students',
        name: 'TeacherStudents',
        title: '我的学员',
        permission: 'teacher_student:view', // 改为后端返回的权限代码
      },
      {
        path: '/teacher/credit-requests',
        name: 'TeacherCreditRequests',
        title: '学分申请',
        permission: 'credit:request:view', // 改为后端返回的权限代码
      },
      {
        path: '/teacher/completion-requests',
        name: 'TeacherCompletionRequests',
        title: '结课申请',
        permission: 'completion:view', // 改为后端返回的权限代码
      },
    ],
  },
  {
    path: '/completion-requests',
    name: 'CompletionRequests',
    title: '结课申请审批',
    icon: 'CircleCheck',
    permission: 'completion:review',
    hideForRoles: ['TEACHER'], // 教师不显示此菜单（教师有自己的结课申请列表）
  },
  {
    path: '/profile',
    name: 'Profile',
    title: '个人中心',
    icon: 'User',
    // 个人中心不需要权限控制，所有人都能访问
  },
]

/**
 * 根据用户权限过滤菜单
 * @param menus 菜单配置
 * @param permissions 用户拥有的权限列表
 * @returns 过滤后的菜单
 */
export function filterMenusByPermissions(
  menus: MenuItem[],
  permissions: string[],
  userRole?: string
): MenuItem[] {
  const result: MenuItem[] = []

  for (const menu of menus) {
    // 检查是否需要对当前角色隐藏
    if (menu.hideForRoles && userRole && menu.hideForRoles.includes(userRole)) {
      continue
    }

    // 如果没有配置权限，则默认显示
    if (!menu.permission) {
      const filteredMenu = { ...menu }
      if (menu.children) {
        filteredMenu.children = filterMenusByPermissions(menu.children, permissions, userRole)
        // 如果子菜单全部被过滤，则父菜单也不显示
        if (filteredMenu.children.length === 0) {
          continue
        }
      }
      result.push(filteredMenu)
      continue
    }

    // 检查用户是否有权限
    if (permissions.includes(menu.permission)) {
      const filteredMenu = { ...menu }
      if (menu.children) {
        filteredMenu.children = filterMenusByPermissions(menu.children, permissions, userRole)
      }
      result.push(filteredMenu)
    }
  }

  return result
}

/**
 * 检查用户是否有指定权限
 * @param permission 权限代码
 * @param permissions 用户拥有的权限列表
 * @returns 是否有权限
 */
export function hasPermission(permission: string, permissions: string[]): boolean {
  return permissions.includes(permission)
}

/**
 * 检查用户是否有任意一个权限
 * @param permissionList 权限代码列表
 * @param permissions 用户拥有的权限列表
 * @returns 是否有权限
 */
export function hasAnyPermission(
  permissionList: string[],
  permissions: string[]
): boolean {
  return permissionList.some((permission) => permissions.includes(permission))
}

/**
 * 检查用户是否拥有所有权限
 * @param permissionList 权限代码列表
 * @param permissions 用户拥有的权限列表
 * @returns 是否有权限
 */
export function hasAllPermissions(
  permissionList: string[],
  permissions: string[]
): boolean {
  return permissionList.every((permission) => permissions.includes(permission))
}

