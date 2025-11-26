<template>
  <div class="page-container">
    <h2 class="page-title">基础设置</h2>
    
    <el-tabs v-model="activeTab" class="settings-tabs">
      <!-- 系统配置 -->
      <el-tab-pane label="系统配置" name="config">
        <el-card shadow="never">
          <el-form
            ref="configFormRef"
            :model="configForm"
            :rules="configRules"
            label-width="120px"
          >
            <el-divider content-position="left">
              <el-icon><Setting /></el-icon>
              <span style="margin-left: 8px">基础信息</span>
            </el-divider>
            
            <el-form-item label="小程序名称" prop="appName">
              <el-input
                v-model="configForm.appName"
                placeholder="请输入小程序名称"
                style="width: 400px"
              />
            </el-form-item>
            
            <el-form-item label="小程序Logo" prop="appLogo">
              <ImageUpload
                v-model="configForm.appLogo"
                tips="建议尺寸：200x200，支持jpg、png格式"
              />
            </el-form-item>
            
            <el-form-item label="小程序描述" prop="appDesc">
              <el-input
                v-model="configForm.appDesc"
                type="textarea"
                :rows="4"
                placeholder="请输入小程序描述"
                style="width: 600px"
              />
            </el-form-item>

            <el-divider content-position="left">
              <el-icon><Document /></el-icon>
              <span style="margin-left: 8px">关于我们</span>
            </el-divider>
            
            <el-form-item label="详细介绍" prop="aboutUs">
              <el-input
                v-model="configForm.aboutUs"
                type="textarea"
                :rows="8"
                placeholder="请输入关于我们的详细介绍"
                style="width: 600px"
              />
              <div style="color: #999; font-size: 12px; margin-top: 4px">
                将在"关于我们"页面展示，支持多行文本
              </div>
            </el-form-item>

            <el-divider content-position="left">
              <el-icon><Phone /></el-icon>
              <span style="margin-left: 8px">联系方式</span>
            </el-divider>
            
            <el-form-item label="联系电话" prop="contactPhone">
              <el-input
                v-model="configForm.contactPhone"
                placeholder="请输入联系电话"
                style="width: 400px"
              />
            </el-form-item>
            
            <el-form-item label="联系邮箱" prop="contactEmail">
              <el-input
                v-model="configForm.contactEmail"
                placeholder="请输入联系邮箱"
                style="width: 400px"
              />
            </el-form-item>
            
            <el-form-item label="联系地址" prop="contactAddress">
              <el-input
                v-model="configForm.contactAddress"
                placeholder="请输入联系地址"
                style="width: 600px"
              />
            </el-form-item>

            <el-divider content-position="left">
              <el-icon><Share /></el-icon>
              <span style="margin-left: 8px">社交媒体</span>
            </el-divider>
            
            <el-form-item label="微信二维码" prop="wechatQrCode">
              <ImageUpload
                v-model="configForm.wechatQrCode"
                tips="建议尺寸：400x400，支持jpg、png格式"
              />
            </el-form-item>
            
            <el-form-item label="微博链接" prop="weiboUrl">
              <el-input
                v-model="configForm.weiboUrl"
                placeholder="请输入微博链接"
                style="width: 600px"
              />
            </el-form-item>

            <el-divider content-position="left">
              <el-icon><InfoFilled /></el-icon>
              <span style="margin-left: 8px">版本信息</span>
            </el-divider>
            
            <el-form-item label="应用版本号" prop="appVersion">
              <el-input
                v-model="configForm.appVersion"
                placeholder="请输入版本号，如：1.0.0"
                style="width: 400px"
              />
              <div style="color: #999; font-size: 12px; margin-top: 4px">
                将在小程序"关于我们"页面显示
              </div>
            </el-form-item>

            <el-divider content-position="left">
              <el-icon><Tools /></el-icon>
              <span style="margin-left: 8px">维护设置</span>
            </el-divider>
            
            <el-form-item label="维护模式" prop="isMaintenance">
              <el-switch
                v-model="configForm.isMaintenance"
                active-text="开启"
                inactive-text="关闭"
              />
              <div style="color: #999; font-size: 12px; margin-top: 4px">
                开启后，小程序将显示维护提示信息
              </div>
            </el-form-item>
            
            <el-form-item
              v-if="configForm.isMaintenance"
              label="维护提示"
              prop="maintenanceMsg"
            >
              <el-input
                v-model="configForm.maintenanceMsg"
                type="textarea"
                :rows="3"
                placeholder="请输入维护提示信息"
                style="width: 600px"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="handleSaveConfig" :loading="configLoading">
                <el-icon><Check /></el-icon>
                <span>保存配置</span>
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 轮播图管理 -->
      <el-tab-pane label="轮播图管理" name="banner">
        <el-card shadow="never">
          <div class="toolbar">
            <el-button type="primary" @click="handleAddBanner">
              <el-icon><Plus /></el-icon>
              <span>添加轮播图</span>
            </el-button>
          </div>

          <el-table
            v-loading="bannerLoading"
            :data="bannerList"
            style="width: 100%; margin-top: 16px"
            row-key="id"
          >
            <el-table-column prop="sortOrder" label="排序" width="80" align="center" />
            
            <el-table-column label="图片" width="200">
              <template #default="{ row }">
                <el-image
                  :src="row.imageUrl"
                  fit="cover"
                  style="width: 160px; height: 90px; border-radius: 4px"
                  :preview-src-list="[row.imageUrl]"
                />
              </template>
            </el-table-column>
            
            <el-table-column prop="title" label="标题" min-width="180" />
            
            <el-table-column label="链接类型" width="120">
              <template #default="{ row }">
                <el-tag :type="getLinkTypeColor(row.linkType)">
                  {{ getLinkTypeName(row.linkType) }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-switch
                  v-model="row.isActive"
                  @change="handleToggleBannerStatus(row)"
                />
              </template>
            </el-table-column>
            
            <el-table-column label="创建时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="{ row }">
                <el-button
                  link
                  type="primary"
                  @click="handleEditBanner(row)"
                >
                  编辑
                </el-button>
                <el-button
                  link
                  type="danger"
                  @click="handleDeleteBanner(row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 轮播图编辑对话框 -->
    <el-dialog
      v-model="bannerDialogVisible"
      :title="bannerDialogTitle"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="bannerFormRef"
        :model="bannerForm"
        :rules="bannerRules"
        label-width="100px"
      >
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="bannerForm.title"
            placeholder="请输入标题"
          />
        </el-form-item>
        
        <el-form-item label="轮播图" prop="imageUrl">
          <ImageUpload
            v-model="bannerForm.imageUrl"
            tips="建议尺寸：750x420，支持jpg、png格式"
          />
        </el-form-item>
        
        <el-form-item label="链接类型" prop="linkType">
          <el-radio-group v-model="bannerForm.linkType">
            <el-radio :label="BannerLinkType.NONE">无链接</el-radio>
            <el-radio :label="BannerLinkType.URL">外部链接</el-radio>
            <el-radio :label="BannerLinkType.COURSE">课程详情</el-radio>
            <el-radio :label="BannerLinkType.NEWS">资讯详情</el-radio>
            <el-radio :label="BannerLinkType.ACTIVITY">活动详情</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item
          v-if="bannerForm.linkType === BannerLinkType.URL"
          label="链接地址"
          prop="linkUrl"
        >
          <el-input
            v-model="bannerForm.linkUrl"
            placeholder="请输入链接地址"
          />
        </el-form-item>
        
        <el-form-item
          v-if="[BannerLinkType.COURSE, BannerLinkType.NEWS, BannerLinkType.ACTIVITY].includes(bannerForm.linkType)"
          label="目标ID"
          prop="targetId"
        >
          <el-input
            v-model="bannerForm.targetId"
            placeholder="请输入目标ID"
          />
        </el-form-item>
        
        <el-form-item label="排序号" prop="sortOrder">
          <el-input-number
            v-model="bannerForm.sortOrder"
            :min="0"
            :max="999"
          />
          <div style="color: #999; font-size: 12px; margin-top: 4px">
            数字越小越靠前
          </div>
        </el-form-item>
        
        <el-form-item label="是否启用" prop="isActive">
          <el-switch v-model="bannerForm.isActive" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="bannerDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveBanner" :loading="bannerSaving">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  Setting,
  Phone,
  Share,
  Tools,
  Check,
  Plus,
} from '@element-plus/icons-vue'
import {
  getSystemConfig,
  updateSystemConfig,
  getBannerList,
  createBanner,
  updateBanner,
  deleteBanner,
  BannerLinkType,
  type SystemConfig,
  type Banner,
  type UpdateSystemConfigData,
  type CreateBannerData,
} from '@/api/system-settings'
import ImageUpload from '@/components/Upload/ImageUpload.vue'
import { formatDate } from '@/utils/format'

const activeTab = ref('config')

// ==================== 系统配置 ====================

const configFormRef = ref<FormInstance>()
const configLoading = ref(false)
const configForm = reactive<UpdateSystemConfigData & { aboutUs?: string; appVersion?: string }>({
  appName: '',
  appLogo: '',
  appDesc: '',
  aboutUs: '',
  contactPhone: '',
  contactEmail: '',
  contactAddress: '',
  isMaintenance: false,
  maintenanceMsg: '',
  wechatQrCode: '',
  weiboUrl: '',
  appVersion: '',
})

const configRules: FormRules = {
  appName: [{ required: true, message: '请输入小程序名称', trigger: 'blur' }],
}

// 加载系统配置
const loadSystemConfig = async () => {
  try {
    configLoading.value = true
    const data = await getSystemConfig()
    // 只提取需要的字段，不包含 id、createdAt、updatedAt
    Object.assign(configForm, {
      appName: data.appName || '',
      appLogo: data.appLogo || '',
      appDesc: data.appDesc || '',
      aboutUs: (data as any).aboutUs || '',
      contactPhone: data.contactPhone || '',
      contactEmail: data.contactEmail || '',
      contactAddress: data.contactAddress || '',
      isMaintenance: data.isMaintenance || false,
      maintenanceMsg: data.maintenanceMsg || '',
      wechatQrCode: data.wechatQrCode || '',
      weiboUrl: data.weiboUrl || '',
      appVersion: (data as any).appVersion || '',
    })
  } catch (error) {
    console.error('加载系统配置失败:', error)
  } finally {
    configLoading.value = false
  }
}

// 保存系统配置
const handleSaveConfig = async () => {
  if (!configFormRef.value) return
  
  await configFormRef.value.validate()
  
  try {
    configLoading.value = true
    await updateSystemConfig(configForm)
    ElMessage.success('保存成功')
    await loadSystemConfig()
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    configLoading.value = false
  }
}

// ==================== 轮播图管理 ====================

const bannerLoading = ref(false)
const bannerList = ref<Banner[]>([])
const bannerDialogVisible = ref(false)
const bannerFormRef = ref<FormInstance>()
const bannerSaving = ref(false)
const editingBannerId = ref<string>()

const bannerForm = reactive<CreateBannerData>({
  title: '',
  imageUrl: '',
  linkType: BannerLinkType.NONE,
  linkUrl: '',
  targetId: '',
  sortOrder: 0,
  isActive: true,
})

const bannerRules: FormRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  imageUrl: [{ required: true, message: '请上传轮播图', trigger: 'change' }],
  linkType: [{ required: true, message: '请选择链接类型', trigger: 'change' }],
  linkUrl: [
    {
      required: computed(() => bannerForm.linkType === BannerLinkType.URL),
      message: '请输入链接地址',
      trigger: 'blur',
    },
  ],
  targetId: [
    {
      required: computed(() => 
        [BannerLinkType.COURSE, BannerLinkType.NEWS, BannerLinkType.ACTIVITY].includes(bannerForm.linkType)
      ),
      message: '请输入目标ID',
      trigger: 'blur',
    },
  ],
}

const bannerDialogTitle = computed(() => editingBannerId.value ? '编辑轮播图' : '添加轮播图')

// 加载轮播图列表
const loadBannerList = async () => {
  try {
    bannerLoading.value = true
    const data = await getBannerList()
    bannerList.value = data
  } catch (error) {
    console.error('加载轮播图列表失败:', error)
  } finally {
    bannerLoading.value = false
  }
}

// 添加轮播图
const handleAddBanner = () => {
  editingBannerId.value = undefined
  Object.assign(bannerForm, {
    title: '',
    imageUrl: '',
    linkType: BannerLinkType.NONE,
    linkUrl: '',
    targetId: '',
    sortOrder: 0,
    isActive: true,
  })
  bannerDialogVisible.value = true
}

// 编辑轮播图
const handleEditBanner = (row: Banner) => {
  editingBannerId.value = row.id
  Object.assign(bannerForm, {
    title: row.title,
    imageUrl: row.imageUrl,
    linkType: row.linkType,
    linkUrl: row.linkUrl || '',
    targetId: row.targetId || '',
    sortOrder: row.sortOrder,
    isActive: row.isActive,
  })
  bannerDialogVisible.value = true
}

// 保存轮播图
const handleSaveBanner = async () => {
  if (!bannerFormRef.value) return
  
  await bannerFormRef.value.validate()
  
  try {
    bannerSaving.value = true
    
    if (editingBannerId.value) {
      await updateBanner(editingBannerId.value, bannerForm)
      ElMessage.success('更新成功')
    } else {
      await createBanner(bannerForm)
      ElMessage.success('添加成功')
    }
    
    bannerDialogVisible.value = false
    await loadBannerList()
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    bannerSaving.value = false
  }
}

// 切换轮播图状态
const handleToggleBannerStatus = async (row: Banner) => {
  try {
    await updateBanner(row.id, { isActive: row.isActive })
    ElMessage.success('状态更新成功')
  } catch (error) {
    console.error('状态更新失败:', error)
    row.isActive = !row.isActive // 回滚
    ElMessage.error('状态更新失败')
  }
}

// 删除轮播图
const handleDeleteBanner = async (row: Banner) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除轮播图"${row.title}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await deleteBanner(row.id)
    ElMessage.success('删除成功')
    await loadBannerList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 获取链接类型名称
const getLinkTypeName = (type: BannerLinkType) => {
  const names = {
    [BannerLinkType.NONE]: '无链接',
    [BannerLinkType.URL]: '外部链接',
    [BannerLinkType.COURSE]: '课程详情',
    [BannerLinkType.NEWS]: '资讯详情',
    [BannerLinkType.ACTIVITY]: '活动详情',
  }
  return names[type] || '-'
}

// 获取链接类型颜色
const getLinkTypeColor = (type: BannerLinkType) => {
  const colors = {
    [BannerLinkType.NONE]: 'info',
    [BannerLinkType.URL]: 'success',
    [BannerLinkType.COURSE]: 'primary',
    [BannerLinkType.NEWS]: 'warning',
    [BannerLinkType.ACTIVITY]: 'danger',
  }
  return colors[type] || 'info'
}

// ==================== 初始化 ====================

onMounted(() => {
  loadSystemConfig()
  loadBannerList()
})
</script>

<style lang="scss" scoped>
.page-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}

.settings-tabs {
  :deep(.el-tabs__content) {
    padding-top: 16px;
  }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-divider__text) {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
}
</style>
