# 小程序管理后台

基于 Vue 3 + Vite 构建的小程序后端管理前端项目。

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **Vue Router** - Vue.js 官方路由管理器
- **Pinia** - Vue 的状态管理库
- **Element Plus** - 基于 Vue 3 的组件库
- **Axios** - 基于 Promise 的 HTTP 客户端
- **ECharts** - 数据可视化图表库

## 项目结构

```
web-admin/
├── src/
│   ├── assets/          # 静态资源
│   ├── components/      # 公共组件
│   │   └── Layout.vue   # 布局组件（侧边栏+头部）
│   ├── router/          # 路由配置
│   │   └── index.js
│   ├── store/           # Pinia 状态管理
│   │   └── index.js
│   ├── utils/           # 工具函数
│   │   └── request.js   # Axios 请求封装
│   ├── views/           # 页面组件
│   │   ├── Login.vue    # 登录页
│   │   ├── Dashboard.vue # 仪表盘
│   │   ├── Customer.vue  # 客户管理
│   │   ├── SysUser.vue  # 系统用户管理
│   │   ├── Ranking.vue  # 排行管理
│   │   └── System.vue   # 系统管理
│   ├── App.vue          # 根组件
│   └── main.js          # 入口文件
├── .env.development     # 开发环境配置
├── .env.production      # 生产环境配置
└── vite.config.js       # Vite 配置
```

## 快速开始

### 安装依赖

```bash
cd web-admin
npm install
```

### 开发环境运行

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 环境配置

在 `.env.development` 和 `.env.production` 文件中配置 API 基础地址：

```env
VITE_API_BASE_URL=http://localhost:8080
```

注意：后端服务的 context-path 是 `/api`，所以完整的 API 路径是 `http://localhost:8080/api`

## 功能特性

### 已实现功能

- ✅ 用户登录/登出
- ✅ 路由守卫（需要登录的页面自动跳转到登录页）
- ✅ Axios 请求拦截器（自动添加 token）
- ✅ 响应拦截器（统一错误处理）
- ✅ Pinia 状态管理（用户信息、token 管理）
- ✅ Element Plus UI 组件库
- ✅ 响应式布局

### 页面功能

1. **仪表盘（Dashboard）**
   - 总用户数、今日新增用户
   - 总游戏记录数、活跃用户数
   - 用户增长趋势图表（支持7/30/90天）
   - 游戏数据统计表格
   - 最近游戏记录列表

2. **客户管理（Customer）**
   - 分页查询客户列表
   - 搜索功能（昵称、openid）
   - 查看客户详情
   - 删除/批量删除客户

3. **系统用户管理（SysUser）**
   - 分页查询系统用户列表
   - 搜索功能（用户名、姓名、手机号）
   - 角色筛选（管理员/运营人员）
   - 状态筛选（启用/禁用）
   - 新增/编辑系统用户
   - 启用/禁用用户
   - 删除用户

4. **排行管理（Ranking）**
   - 分页查询排行记录
   - 搜索功能（游戏名称、openid、难度）
   - 删除/批量删除排行记录

5. **系统管理（System）**
   - 系统信息展示（Java版本、操作系统、内存使用情况）
   - 系统配置展示（应用名称、版本号、维护状态）

## 开发说明

### 添加新页面

1. 在 `src/views/` 目录下创建新的 Vue 组件
2. 在 `src/router/index.js` 中添加路由配置（放在 Layout 的 children 中）
3. 在 `src/components/Layout.vue` 的侧边栏菜单中添加菜单项

### 使用 API 请求

```javascript
import request from '../utils/request'

// GET 请求
const res = await request.get('/api/sys/customer/page', {
  params: { current: 1, size: 10 }
})

// POST 请求
const res = await request.post('/api/sys/user', {
  username: 'admin',
  password: '123456'
})

// PUT 请求
const res = await request.put('/api/sys/user/1', {
  realName: '管理员'
})

// DELETE 请求
const res = await request.delete('/api/sys/user/1')
```

### 响应数据格式

后端返回的数据格式为：
```json
{
  "code": 200,
  "message": "操作成功",
  "data": { ... },
  "timestamp": 1234567890
}
```

响应拦截器会自动提取 `data` 字段，所以在组件中直接使用 `res` 即可。

### Token 管理

- Token 存储在 localStorage 中
- 请求拦截器自动在请求头中添加 `Authorization: Bearer {token}`
- Token 过期或401错误时自动跳转到登录页

## 注意事项

1. 确保后端服务已启动，并且 context-path 配置为 `/api`
2. 所有管理后台接口都需要登录认证
3. 默认管理员账号：用户名 `admin`，密码 `admin123`
4. ECharts 图表库已添加到依赖中，如果不需要图表功能可以移除

## License

MIT
