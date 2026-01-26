# Structure.md

Đây là phiên bản đơn giản của cấu trúc dự án Next.js theo hướng module-based + Clean Architecture, áp dụng trực tiếp với các module và pages bạn cung cấp.

---

## 1. Cấu trúc tổng quan

```
src/
├── app/                  # Next.js App Router (routing + layouts only)
│   ├── (auth)/
│   ├── (citizen)/
│   ├── (coordinator)/
│   ├── (team)/
│   ├── (manager)/
│   └── (admin)/
│
├── modules/              # Business modules (Clean Architecture)
│   ├── auth/
│   ├── users/
│   ├── requests/
│   ├── missions/
│   ├── teams/
│   ├── resources/
│   ├── supplies/
│   ├── inventory/
│   ├── reports/
│   ├── notifications/
│   └── map/
│
├── shared/               # shared UI, hooks, types, utils
│   ├── ui/
│   ├── hooks/
│   ├── types/
│   └── utils/
│
├── services/             # app-wide infra (apiClient, authSession, websocket)
└── store/                # global state (Redux Toolkit / Zustand / ...)
```

---

## 2. Cấu trúc module (mẫu - `modules/requests`)

```
modules/requests/
├── domain/               # entity, value objects, repository interface
│   ├── request.entity.ts
│   └── request.repository.ts
│
├── application/          # use-cases (thuần business logic)
│   ├── createRequest.usecase.ts
│   └── getRequestDetail.usecase.ts
│
├── infrastructure/      # adapters: api calls, repository implementations
│   ├── request.api.ts
│   └── request.repository.impl.ts
│
└── presentation/         # UI components, hooks, page-level components
    ├── components/
    ├── hooks/
    └── pages/
        ├── CitizenRequestPage.tsx
        └── TrackingPage.tsx
```

**Nguyên tắc:**

* `domain` không phụ thuộc framework.
* `application` chỉ gọi interfaces từ `domain`.
* `infrastructure` implement các interface đó.
* `presentation` chứa React components và hooks; pages trong `app/` chỉ import và render các component ở đây.

---

## 3. Mapping pages → module (ví dụ đơn giản)

* `app/(citizen)/request/page.tsx` → `modules/requests/presentation/pages/CitizenRequestPage.tsx`
* `app/(citizen)/tracking/[id]/page.tsx` → `modules/requests/presentation/pages/TrackingPage.tsx`
* `app/(coordinator)/requests/page.tsx` → `modules/requests/presentation/pages/CoordinatorRequestsPage.tsx`
* `app/(coordinator)/missions/page.tsx` → `modules/missions/presentation/pages/CoordinatorMissionsPage.tsx`
* `app/(team)/missions/page.tsx` → `modules/missions/presentation/pages/TeamMissionsPage.tsx`
* `app/(team)/report/[id]/page.tsx` → `modules/reports/presentation/pages/TeamReportPage.tsx`
* `app/(manager)/inventory/page.tsx` → `modules/inventory/presentation/pages/InventoryPage.tsx`
* `app/(admin)/users/page.tsx` → `modules/users/presentation/pages/AdminUsersPage.tsx`

**Pattern cho `app` page:**
`app/.../page.tsx` chỉ làm wrapper và import component từ `modules/*/presentation/pages`.

---

## 4. Auth & Role

* `modules/auth` chứa session entity, use-cases (login/logout/checkPermission), adapter cho API.
* `modules/auth/presentation/guards` chứa guards (CitizenGuard, CoordinatorGuard, AdminGuard).
* Dùng guards trong `app/(role)/layout.tsx` để bảo vệ route groups.

---

## 5. Map (OSM) - module dùng chung

* `modules/map` cung cấp:

  * `presentation/components/RescueMap.tsx` (tái sử dụng)
  * `application` use-cases cho tracking
  * `infrastructure/osm.adapter.ts` (wrappers cho OSM/OpenMap)
* Các module `missions`, `teams`, `requests` import component + hook từ `modules/map`.

---

## 6. Ghi chú ngắn

* `app/` không chứa business logic. Chỉ route/layout/wrappers.
* Test focus: viết unit test cho `application` (use-cases) và integration test cho `infrastructure`.
* Tổ chức state: ưu tiên server-state (React Server Components/React Query) cho dữ liệu fetch; dùng `store/` cho client-only UI state hoặc data cần chia sẻ realtime.

---

Phiên bản này đơn giản, đủ để bắt đầu implement. Nếu cần, tôi có thể tạo skeleton repo cho 1 module cụ thể (ví dụ `requests`).
