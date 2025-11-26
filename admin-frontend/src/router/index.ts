/**
 * 路由配置
 */
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import NProgress from 'nprogress'

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login/index.vue'),
    meta: {
      title: '登录',
      requiresAuth: false,
    },
  },
  {
    path: '/',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/dashboard',
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard/index.vue'),
        meta: {
          title: '首页概览',
          icon: 'DataLine',
        },
      },
      // 资讯管理
      {
        path: '/news',
        name: 'News',
        redirect: '/news/list',
        meta: {
          title: '资讯管理',
          icon: 'Reading',
        },
        children: [
          {
            path: '/news/list',
            name: 'NewsList',
            component: () => import('@/views/News/List.vue'),
            meta: {
              title: '资讯列表',
            },
          },
          {
            path: '/news/create',
            name: 'NewsCreate',
            component: () => import('@/views/News/Edit.vue'),
            meta: {
              title: '发布资讯',
              hidden: true,
              activeMenu: '/news/list',
            },
          },
          {
            path: '/news/edit/:id',
            name: 'NewsEdit',
            component: () => import('@/views/News/Edit.vue'),
            meta: {
              title: '编辑资讯',
              hidden: true,
              activeMenu: '/news/list',
            },
          },
        ],
      },
      // 校友生活
      {
        path: '/associations',
        name: 'Associations',
        redirect: '/associations/list',
        meta: {
          title: '校友生活',
          icon: 'OfficeBuilding',
        },
        children: [
          {
            path: '/associations/list',
            name: 'AssociationsList',
            component: () => import('@/views/Associations/List.vue'),
            meta: {
              title: '活动列表',
            },
          },
          {
            path: '/associations/create',
            name: 'AssociationsCreate',
            component: () => import('@/views/Associations/Edit.vue'),
            meta: {
              title: '新建协会',
              hidden: true,
              activeMenu: '/associations/list',
            },
          },
          {
            path: '/associations/edit/:id',
            name: 'AssociationsEdit',
            component: () => import('@/views/Associations/Edit.vue'),
            meta: {
              title: '编辑协会',
              hidden: true,
              activeMenu: '/associations/list',
            },
          },
          {
            path: '/associations/activities',
            name: 'Activities',
            component: () => import('@/views/Associations/Activities.vue'),
            meta: {
              title: '活动管理',
            },
          },
          {
            path: '/associations/activities/create',
            name: 'ActivitiesCreate',
            component: () => import('@/views/Associations/ActivityEdit.vue'),
            meta: {
              title: '创建活动',
              hidden: true,
              activeMenu: '/associations/activities',
            },
          },
          {
            path: '/associations/activities/edit',
            name: 'ActivitiesEdit',
            component: () => import('@/views/Associations/ActivityEdit.vue'),
            meta: {
              title: '编辑活动',
              hidden: true,
              activeMenu: '/associations/activities',
            },
          },
        ],
      },
      // 课程管理
      {
        path: '/courses',
        name: 'Courses',
        redirect: '/courses/list',
        meta: {
          title: '课程管理',
          icon: 'Collection',
        },
        children: [
          {
            path: '/courses/list',
            name: 'CoursesList',
            component: () => import('@/views/Courses/List.vue'),
            meta: {
              title: '课程列表',
            },
          },
          {
            path: '/courses/create',
            name: 'CoursesCreate',
            component: () => import('@/views/Courses/Edit.vue'),
            meta: {
              title: '创建课程',
              hidden: true,
              activeMenu: '/courses/list',
              hideBreadcrumb: true, // 隐藏默认面包屑，使用页面自定义面包屑
            },
          },
          {
            path: '/courses/edit/:id',
            name: 'CoursesEdit',
            component: () => import('@/views/Courses/Edit.vue'),
            meta: {
              title: '编辑课程',
              hidden: true,
              activeMenu: '/courses/list',
              hideBreadcrumb: true, // 隐藏默认面包屑，使用页面自定义面包屑
            },
          },
          {
            path: '/courses/approve',
            name: 'CoursesApprove',
            component: () => import('@/views/Courses/Approve.vue'),
            meta: {
              title: '课程审批',
              roles: ['ADMIN', 'STAFF'],
            },
          },
          {
            path: '/courses/credits',
            name: 'Credits',
            component: () => import('@/views/Courses/Credits.vue'),
            meta: {
              title: '学分配置',
            },
          },
        ],
      },
      // 用户管理
      {
        path: '/users',
        name: 'Users',
        redirect: '/users/list',
        meta: {
          title: '用户管理',
          icon: 'User',
        },
        children: [
          {
            path: '/users/list',
            name: 'UsersList',
            component: () => import('@/views/Users/List.vue'),
            meta: {
              title: '用户列表',
            },
          },
          {
            path: '/users/detail/:id',
            name: 'UsersDetail',
            component: () => import('@/views/Users/Detail.vue'),
            meta: {
              title: '用户详情',
              hidden: true,
              activeMenu: '/users/list',
            },
          },
          {
            path: '/users/advisors',
            name: 'Advisors',
            component: () => import('@/views/Users/Advisors.vue'),
            meta: {
              title: '课程顾问',
            },
          },
        ],
      },
      // 企业管理
      {
        path: '/organizations',
        name: 'Organizations',
        redirect: '/organizations/list',
        meta: {
          title: '企业管理',
          icon: 'Suitcase',
        },
        children: [
          {
            path: '/organizations/list',
            name: 'OrganizationsList',
            component: () => import('@/views/Organizations/List.vue'),
            meta: {
              title: '企业列表',
            },
          },
          {
            path: '/organizations/detail/:id',
            name: 'OrganizationsDetail',
            component: () => import('@/views/Organizations/Detail.vue'),
            meta: {
              title: '企业详情',
              hidden: true,
              activeMenu: '/organizations/list',
            },
          },
          {
            path: '/organizations/:id/employees',
            name: 'OrganizationsEmployees',
            component: () => import('@/views/Organizations/Employees.vue'),
            meta: {
              title: '员工管理',
              hidden: true,
              activeMenu: '/organizations/list',
              roles: ['ADMIN', 'TEACHER'],
            },
          },
        ],
      },
      // 报名管理
      {
        path: '/enrollments',
        name: 'Enrollments',
        redirect: '/enrollments/list',
        meta: {
          title: '报名管理',
          icon: 'DocumentChecked',
        },
        children: [
          {
            path: '/enrollments/list',
            name: 'EnrollmentsList',
            component: () => import('@/views/Enrollments/List.vue'),
            meta: {
              title: '报名列表',
            },
          },
          {
            path: '/enrollments/trials',
            name: 'Trials',
            component: () => import('@/views/Enrollments/EnrollmentRequests.vue'),
            meta: {
              title: '试听申请',
            },
          },
          {
            path: '/enrollments/checkins',
            name: 'Checkins',
            component: () => import('@/views/Enrollments/Checkins.vue'),
            meta: {
              title: '签到管理',
            },
          },
          {
            path: '/enrollments/evaluations',
            name: 'Evaluations',
            component: () => import('@/views/Enrollments/Evaluations.vue'),
            meta: {
              title: '评价管理',
              roles: ['ADMIN', 'STAFF'],
            },
          },
          {
            path: '/enrollments/refund-requests',
            name: 'RefundRequests',
            component: () => import('@/views/Enrollments/RefundRequests.vue'),
            meta: {
              title: '退课申请',
              roles: ['ADMIN', 'STAFF', 'TEACHER'],
            },
          },
          {
            path: '/enrollments/credit-requests',
            name: 'CreditRequests',
            component: () => import('@/views/CreditRequests/List.vue'),
            meta: {
              title: '学分申请审批',
              roles: ['ADMIN', 'STAFF'],
            },
          },
          {
            path: '/enrollments/course-gifts',
            name: 'CourseGifts',
            component: () => import('@/views/Enrollments/CourseGifts.vue'),
            meta: {
              title: '赠送记录',
            },
          },
        ],
      },
      // 课件管理
      {
        path: '/materials',
        name: 'Materials',
        redirect: '/materials/list',
        meta: {
          title: '课件管理',
          icon: 'FolderOpened',
        },
        children: [
          {
            path: '/materials/list',
            name: 'MaterialsList',
            component: () => import('@/views/Materials/List.vue'),
            meta: {
              title: '课件列表',
              hideBreadcrumb: true, // 使用页面自定义面包屑
            },
          },
        ],
      },
      // 数据统计
      {
        path: '/statistics',
        name: 'Statistics',
        redirect: '/statistics/users',
        meta: {
          title: '数据统计',
          icon: 'DataAnalysis',
        },
        children: [
          {
            path: '/statistics/users',
            name: 'UserStatistics',
            component: () => import('@/views/Statistics/Users.vue'),
            meta: {
              title: '用户统计',
            },
          },
          {
            path: '/statistics/courses',
            name: 'CourseStatistics',
            component: () => import('@/views/Statistics/Courses.vue'),
            meta: {
              title: '课程统计',
            },
          },
          {
            path: '/statistics/teachers',
            name: 'TeacherStatistics',
            component: () => import('@/views/Statistics/Teachers.vue'),
            meta: {
              title: '讲师统计',
            },
          },
        ],
      },
      // 系统设置
      {
        path: '/settings',
        name: 'Settings',
        redirect: '/settings/basic',
        meta: {
          title: '系统设置',
          icon: 'Setting',
          roles: ['ADMIN'],
        },
        children: [
          {
            path: '/settings/basic',
            name: 'BasicSettings',
            component: () => import('@/views/Settings/Basic.vue'),
            meta: {
              title: '基础设置',
            },
          },
          {
            path: '/settings/roles',
            name: 'RoleSettings',
            component: () => import('@/views/Settings/Roles.vue'),
            meta: {
              title: '角色权限',
            },
          },
          {
            path: '/settings/ai-config',
            name: 'AiConfig',
            component: () => import('@/views/Settings/AiConfig.vue'),
            meta: {
              title: 'AI 配置',
            },
          },
        ],
      },
      // 教学管理（教师专用）
      {
        path: '/teacher',
        name: 'Teacher',
        redirect: '/teacher/courses',
        meta: {
          title: '教学管理',
          icon: 'Reading',
        },
        children: [
          {
            path: '/teacher/courses',
            name: 'TeacherCourses',
            component: () => import('@/views/Teacher/MyCourses.vue'),
            meta: {
              title: '我的课程',
            },
          },
          {
            path: '/teacher/students',
            name: 'TeacherStudents',
            component: () => import('@/views/Teacher/MyStudents.vue'),
            meta: {
              title: '我的学员',
            },
          },
          {
            path: '/teacher/course-students',
            name: 'TeacherCourseStudents',
            component: () => import('@/views/Teacher/CourseStudents.vue'),
            meta: {
              title: '课程学员',
              hidden: true,
              activeMenu: '/teacher/courses',
            },
          },
          {
            path: '/teacher/course-checkins',
            name: 'TeacherCourseCheckins',
            component: () => import('@/views/Teacher/CourseCheckins.vue'),
            meta: {
              title: '签到记录',
              hidden: true,
              activeMenu: '/teacher/courses',
            },
          },
          {
            path: '/teacher/course-evaluations',
            name: 'TeacherCourseEvaluations',
            component: () => import('@/views/Teacher/CourseEvaluations.vue'),
            meta: {
              title: '课程评价',
              hidden: true,
              activeMenu: '/teacher/courses',
            },
          },
          {
            path: '/teacher/credit-requests',
            name: 'TeacherCreditRequests',
            component: () => import('@/views/Teacher/CreditRequests.vue'),
            meta: {
              title: '学分申请',
            },
          },
          {
            path: '/teacher/completion-requests',
            name: 'TeacherCompletionRequests',
            component: () => import('@/views/Teacher/CompletionRequests.vue'),
            meta: {
              title: '结课申请',
            },
          },
        ],
      },
      // 结课申请管理（教务/管理员）
      {
        path: '/completion-requests',
        name: 'CompletionRequests',
        component: () => import('@/views/Completion/List.vue'),
        meta: {
          title: '结课申请审批',
          icon: 'CircleCheck',
          roles: ['ADMIN', 'STAFF'],
        },
      },
      // 个人中心
      {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/Profile/index.vue'),
        meta: {
          title: '个人中心',
          icon: 'User',
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/Error/404.vue'),
    meta: {
      title: '页面不存在',
      requiresAuth: false,
    },
  },
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
  NProgress.start()

  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - EDP管理后台` : 'EDP管理后台'

  const authStore = useAuthStore()

  // 检查是否需要登录
  if (to.meta.requiresAuth !== false && !authStore.token) {
    next('/login')
    return
  }

  // 如果已登录，访问登录页则跳转到首页
  if (to.path === '/login' && authStore.token) {
    next('/')
    return
  }

  // 检查角色权限
  if (to.meta.roles) {
    const roles = to.meta.roles as string[]
    if (!authStore.hasRole(roles)) {
      ElMessage.error('您没有权限访问该页面')
      next(from.path || '/')
      return
    }
  }

  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router


