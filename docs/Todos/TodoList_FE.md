# 📋 TodoList - Flood Rescue Frontend

> **Last Updated:** 2026-02-16
>
> Theo dõi tiến độ implementation Frontend dựa trên [TodoList_BE.md](../Todos/TodoList_BE.md) và [Project_Structure.md](../Project_Structure.md).

---

## 📊 Phase Progress

| Phase       | Description                                               | Progress | Status         |
| :---------- | :-------------------------------------------------------- | :------- | :------------- |
| **Phase 1** | **Core Flow** (Auth, Request, Mission, Team, Timeline UI) | ~40%     | 🚧 In Progress |
| **Phase 2** | **Supply Tracking** (Warehouse & Inventory UI)            | 0%       | 🌑 Pending     |
| **Phase 3** | **GPS Tracking** (Realtime map integration)               | 20%      | 🌑 Pending     |
| **Phase 4** | **Role & Admin** (RBAC UI, System Config)                 | 10%      | 🌑 Pending     |

---

## 1. 🔐 Authentication & Users

### Implemented ✅

- [x] Login Page (`/login`)
- [x] Register Page (`/register`) with `phoneNumber`
- [x] Citizen Profile Page (`/profile`)
- [x] Auth Guards (Middleware/HOC)
- [x] Logout integration

### Not Implemented ❌

- [ ] Forgot Password / Reset Password UI
- [ ] Email Verification UI
- [ ] Update Profile UI (Edit displayName, avatar)
- [ ] Change Password UI

---

## 2. 🆘 Request Management (Citizen & Coordinator)

### Implemented ✅

- [x] Create Request Form (Citizen) - `RescueRequestModal`
- [x] Emergency Button
- [x] Request List (Citizen) - `CitizenHistoryPage`
- [x] Request Detail (Basic)
- [x] **Coordinator Request List**: `CoordinatorRequestsPage` (Filter by status implemented)

### Not Implemented ❌

- [ ] **Request Verification UI**: Coordinator verify/reject request.
- [ ] **Request Location Update**: Coordinator update location map.
- [ ] **Duplicate Marking**: Coordinator mark request as duplicate.
- [ ] **Create On-Behalf**: Coordinator create request form.
- [ ] **(Future) Priority AI**: Auto-suggest priority based on description keywords.

---

## 3. 🚀 Mission & Timeline (Coordinator & Team)

### Implemented ✅

- [x] Coordinator Dashboard - `CoordinatorDashboardPage`
- [x] Coordinator Mission List - `MissionListPage`
- [x] Team Mission List - `TeamMissionsPage`

### Not Implemented ❌

- [ ] **Create Mission UI**:
  - [ ] Create `PLANNED` Mission form.
  - [ ] Assign Team Interface (Filter `AVAILABLE` only).
- [ ] **Mission Detail View**: Show timeline, team, and request info.
- [ ] **(Future) Inventory Check**: Validate supply availability during visual planning.
- [ ] **Assign Team Modal**: Select team for mission.
- [ ] **Timeline Actions (Team)**:
  - [ ] Accept Mission Button
  - [ ] Arrive Button (Update status to `ON_SITE`)
  - [ ] Complete Mission Form (Report results)
  - [ ] Fail/Withdraw Actions
- [ ] **Mission Control (Coordinator)**: Pause/Resume/Abort buttons.

---

## 4. 👥 Team Management (Coordinator vs Team Leader)

### Implemented ✅

- [ ] Setup `teams` module / API services

### Not Implemented ❌

#### 👨‍💼 Coordinator / Admin Role

- [ ] **Global Team List**: View all rescue teams, filter by status (`AVAILABLE`/`BUSY`).
- [ ] **Create Team**: Add new team.
- [ ] **Global Team Detail**: View any team's members and current missions.
- [ ] **Manage Any Members**: Add (`Citizen` -> `Rescue Team`)/Remove members from any team.
- [ ] **Change Leader**: UI to assign new leader for any team.
- [ ] **Delete/Edit Team**: Update team info or delete team.

#### 👷‍♂️ Team Leader Role

- [ ] **My Team Detail**: View own team's details & active missions.
- [ ] **Manage Own Members**: Add/Remove members from their own team (Cannot remove self/leader).

---

## 5. 🗺️ Map & Tracking

### Implemented ✅

- [x] Base Map Component (`OpenMap`, `LocationMap`)

### Not Implemented ❌

- [ ] **Realtime Cluster**: Display multiple requests on map.
- [ ] **Mission Route**: Display route for active missions.
- [ ] **Team Tracking**: Show team location (read-only for Phase 1).

---

## 6. 📦 Supply & Resources (Manager)

### Not Implemented ❌ (Phase 2)

- [ ] Supply List
- [ ] Warehouse Management
- [ ] Inventory View
- [ ] Supply Planning UI (in Mission/Timeline)

---

## 7. 🔔 Notifications

### Implemented ✅

- [x] Notification List (`CitizenNotificationsPage`)
- [x] Unread Badge

### Not Implemented ❌

- [ ] Realtime Toast/Popup integration (WebSocket events).

---

## 📝 Next Priority (Immediate Actions)

1.  **Coordinator Dashboard**: Request verification & Mission creation.
2.  **Team Interface**: Timeline interactions (Accept -> Complete).
3.  **Team CRUD**: Manage teams for assignment.
