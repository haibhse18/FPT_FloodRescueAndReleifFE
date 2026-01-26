# Frontend Folder Structure (React + Next.js + Clean Architecture)

## Overview

* **Framework**: Next.js (App Router)
* **Architecture**: Clean Architecture (Routing / Business / Infrastructure)
* **Principle**:

  * `app/` chỉ dùng cho routing & layout
  * Business logic nằm trong `features/`
  * Module hóa theo **domain nghiệp vụ cứu hộ**

---

## 1. Routing Layer – `app/`

```txt
src/app/
├── (auth)/                       # Đăng nhập / xác thực
│   ├── login/page.tsx
│   └── layout.tsx
│
├── (citizen)/                    # Người dân
│   ├── request/page.tsx          # Gửi yêu cầu cứu hộ
│   ├── tracking/[id]/page.tsx    # Theo dõi trạng thái
│   └── layout.tsx
│
├── (coordinator)/                # Điều phối cứu hộ
│   ├── dashboard/page.tsx
│   ├── requests/page.tsx
│   ├── missions/page.tsx
│   └── layout.tsx
│
├── (team)/                       # Đội cứu hộ
│   ├── missions/page.tsx
│   ├── report/[id]/page.tsx
│   └── layout.tsx
│
├── (manager)/                    # Quản lý tài nguyên
│   ├── resources/page.tsx
│   ├── supplies/page.tsx
│   ├── inventory/page.tsx
│   └── layout.tsx
│
├── (admin)/                      # Quản trị hệ thống
│   ├── users/page.tsx
│   ├── configs/page.tsx
│   ├── reports/page.tsx
│   └── layout.tsx
│
└── api/                          # Route Handlers (nếu cần)
```

> ❗ `page.tsx` **không chứa business logic, không gọi API trực tiếp**

---

## 2. Business Logic Layer – `features/`

### Module structure (áp dụng cho mọi domain)

```txt
features/<module>/
├── components/        # UI riêng module
├── services/          # Business rules
├── repositories/      # Giao tiếp API
├── hooks/             # Hook đặc thù module
├── actions.ts         # Server Actions
├── mapper.ts          # DTO ↔ ViewModel
├── types.ts           # Types riêng module
└── index.ts
```

### Core Modules

```txt
features/
├── auth/              # Login, session, role
├── users/             # User & Role
├── requests/          # Yêu cầu cứu hộ (Citizen, Coordinator)
├── missions/          # Nhiệm vụ cứu hộ
├── teams/             # Đội cứu hộ & vị trí
├── resources/         # Vehicle & Equipment
├── supplies/          # Hàng cứu trợ
├── inventory/         # Kho
├── reports/           # Thống kê, báo cáo
├── notifications/     # Thông báo
└── map/               # Bản đồ (OpenMap / OSM)
```

---

## 3. Shared UI Layer – `components/`

```txt
components/
├── ui/                # Atomic components (shadcn/ui)
│   ├── button.tsx
│   ├── modal.tsx
│   └── table.tsx
│
└── shared/            # Component dùng chung
    ├── Navbar.tsx
    ├── Sidebar.tsx
    ├── RoleGuard.tsx
    └── PageHeader.tsx
```

---

## 4. Infrastructure Layer – `lib/`

```txt
lib/
├── http.ts            # Axios / Fetch wrapper
├── auth.ts            # Token, session, role check
├── permissions.ts     # Role → Permission map
├── map.ts             # Map provider config
├── env.ts
└── utils.ts
```

---

## 5. Cross-cutting Layers

```txt
hooks/
├── useAuth.ts
├── usePermission.ts
├── useDebounce.ts

constants/
├── roles.ts
├── status.ts
├── priority.ts
├── menu.ts

types/
├── user.ts
├── api.ts
├── pagination.ts
```

---

## Notes (Best Practices)

* Mỗi **feature = 1 domain nghiệp vụ**
* Không gộp logic theo role trong component
* Map được tách module riêng để dễ mock & thay provider
* Sẵn sàng scale cho đồ án SE hoặc production
