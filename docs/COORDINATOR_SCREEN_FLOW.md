# Coordinator Screen Flow

## 📱 Overview
Coordinator role quản lý và điều phối các rescue requests, assign missions cho rescue teams.

---

## 🎯 Main Screens

### 1. **Login Screen** (`/login`)
**Purpose:** Authentication
- Input: Phone number + Password
- Success → Redirect to Dashboard
- Failed → Show error message

---

### 2. **Dashboard/Homepage** (`/coordinator` hoặc `/coordinator/dashboard`)
**Purpose:** Overview và quick stats

**Components:**
```
┌─────────────────────────────────────────────────┐
│ Header (Logo, Notifications, Profile)          │
├─────────────────────────────────────────────────┤
│ Sidebar                                         │
│ - Dashboard                                     │
│ - Requests (Active)                             │
│ - Teams                                         │
│ - Map View                                      │
│ - Reports                                       │
├─────────────────────────────────────────────────┤
│ Stats Cards                                     │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│ │ Pending  │ │ Active   │ │ Completed│        │
│ │ Requests │ │ Missions │ │ Today    │        │
│ └──────────┘ └──────────┘ └──────────┘        │
├─────────────────────────────────────────────────┤
│ Recent Requests (Table)                         │
│ - Quick view latest 5 requests                  │
│ - Click to view details                         │
├─────────────────────────────────────────────────┤
│ Map Overview                                    │
│ - Show all active requests on map               │
│ - Color coded by urgency                        │
└─────────────────────────────────────────────────┘
```

**Actions:**
- View stats
- Click request → Go to Request Detail
- Click "All Requests" → Go to Requests List

---

### 3. **Requests List** (`/coordinator/requests`)
**Purpose:** Quản lý tất cả rescue requests

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ Filters & Search                                │
│ [Status▼] [Priority▼] [Location▼] [Search...]  │
├─────────────────────────────────────────────────┤
│ Requests Table                                  │
│ ┌────────────────────────────────────────────┐ │
│ │ ID │ Location │ Priority │ Status │ Actions││
│ ├────────────────────────────────────────────┤ │
│ │ #123│ Hanoi   │ Critical │ Pending│ [Assign]││
│ │ #124│ HCM     │ High    │ Active │ [View]  ││
│ │ #125│ Da Nang │ Medium  │ Pending│ [Assign]││
│ └────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│ Pagination [<] 1 2 3 [>]                        │
└─────────────────────────────────────────────────┘
```

**Filters:**
- Status: All, Pending, Assigned, In Progress, Completed
- Priority: Critical, High, Medium, Low
- Location: District/City
- Date range

**Actions per Request:**
- **View Details** → Request Detail Screen
- **Assign Team** → Team Assignment Modal
- **Update Priority** → Priority Update Modal
- **Mark as Verified** → Confirmation dialog

---

### 4. **Request Detail** (`/coordinator/requests/:id`)
**Purpose:** Chi tiết request và assign team

**Sections:**
```
┌─────────────────────────────────────────────────┐
│ ← Back to Requests                              │
├─────────────────────────────────────────────────┤
│ Request Info                                    │
│ ┌───────────────────────────────────────────┐  │
│ │ Request #123 - Critical                   │  │
│ │ Location: 123 Nguyen Trai, Hanoi          │  │
│ │ Submitted: 2026-01-29 10:30               │  │
│ │ Reporter: Nguyen Van A (0912345678)       │  │
│ │ People affected: 5                        │  │
│ │ Description: Flood water 1.5m...          │  │
│ └───────────────────────────────────────────┘  │
├─────────────────────────────────────────────────┤
│ Photos                                          │
│ [📷 Image1] [📷 Image2] [📷 Image3]            │
├─────────────────────────────────────────────────┤
│ Map Location                                    │
│ [Interactive Map showing exact location]        │
├─────────────────────────────────────────────────┤
│ Status & Priority                               │
│ Status: [Pending ▼]                             │
│ Priority: [Critical ▼]                          │
│ [Update Status & Priority]                      │
├─────────────────────────────────────────────────┤
│ Team Assignment                                 │
│ Current Team: Not assigned                      │
│ [Assign Rescue Team]                            │
├─────────────────────────────────────────────────┤
│ Activity Timeline                               │
│ • 10:30 - Request submitted                     │
│ • 10:32 - Marked as Critical                    │
│ • 10:35 - Team A assigned                       │
└─────────────────────────────────────────────────┘
```

**Actions:**
- Update priority
- Assign/Reassign team
- Verify request
- Add notes
- Mark as completed

---

### 5. **Team Assignment Modal**
**Purpose:** Assign rescue team to request

**Flow:**
```
┌─────────────────────────────────────────────────┐
│ Assign Team to Request #123                    │
├─────────────────────────────────────────────────┤
│ Available Teams                                 │
│ ┌───────────────────────────────────────────┐  │
│ │ ● Team A - District 1 (3 members)        │  │
│ │   Status: Available                       │  │
│ │   Distance: 2.5km                         │  │
│ │   [ ] Select                              │  │
│ ├───────────────────────────────────────────┤  │
│ │ ● Team B - District 2 (4 members)        │  │
│ │   Status: On Mission (ETA: 15 min)       │  │
│ │   Distance: 1.8km                         │  │
│ │   [ ] Select                              │  │
│ └───────────────────────────────────────────┘  │
├─────────────────────────────────────────────────┤
│ Notes (optional)                                │
│ [Text area for special instructions]            │
├─────────────────────────────────────────────────┤
│ [Cancel] [Assign Team]                          │
└─────────────────────────────────────────────────┘
```

**Validation:**
- Must select one team
- Confirm if team is busy
- Add priority note if critical

---

### 6. **Teams Management** (`/coordinator/teams`)
**Purpose:** View và manage rescue teams

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ Teams Overview                                  │
│ [Status: All ▼] [Location ▼]                    │
├─────────────────────────────────────────────────┤
│ Teams Grid                                      │
│ ┌──────────────┐ ┌──────────────┐              │
│ │ Team A       │ │ Team B       │              │
│ │ ✅ Available │ │ 🔄 On Mission│              │
│ │ 3 members    │ │ 4 members    │              │
│ │ District 1   │ │ District 2   │              │
│ │ [View]       │ │ [Track]      │              │
│ └──────────────┘ └──────────────┘              │
├─────────────────────────────────────────────────┤
│ Map View                                        │
│ [Interactive map showing team locations]        │
└─────────────────────────────────────────────────┘
```

**Team Statuses:**
- 🟢 Available
- 🔵 On Mission
- 🔴 Off Duty
- 🟡 Returning

---

### 7. **Map View** (`/coordinator/map`)
**Purpose:** Real-time overview trên map

**Features:**
```
┌─────────────────────────────────────────────────┐
│ Filters: [Requests] [Teams] [Zones]            │
├─────────────────────────────────────────────────┤
│                                                 │
│             [Interactive Map]                   │
│                                                 │
│  Markers:                                       │
│  🔴 Critical Request                            │
│  🟠 High Priority Request                       │
│  🟡 Medium Priority Request                     │
│  🟢 Rescue Team Available                       │
│  🔵 Rescue Team On Mission                      │
│  ⚠️ Flood Zone                                  │
│                                                 │
├─────────────────────────────────────────────────┤
│ Legend: [Show/Hide details]                     │
└─────────────────────────────────────────────────┘
```

**Interactions:**
- Click marker → Show popup with quick info
- Click "Details" → Navigate to detail page
- Filter by status/priority
- Real-time updates

---

### 8. **Reports** (`/coordinator/reports`)
**Purpose:** Statistics và reports

**Sections:**
- Date range selector
- Export options (PDF, Excel)
- Charts:
  - Requests by status
  - Response times
  - Team performance
  - Request by location
- Summary tables

---

## 🔄 Navigation Flow

```
Login
  ↓
Dashboard ←→ Requests List ←→ Request Detail
  ↓              ↓                ↓
Teams         Map View      Assign Team Modal
  ↓              ↓                ↓
Reports       [Real-time Updates]
```

---

## 📊 State Management

### Global States:
- **User Session:** authToken, userInfo, role
- **Notifications:** Real-time alerts
- **Filters:** Persisted across navigation

### Page-level States:
- **Requests List:** filters, pagination, selectedRequests
- **Request Detail:** requestData, assignmentStatus, notes
- **Teams:** teamsList, teamStatus, locations

---

## 🔔 Real-time Features

### WebSocket Events:
1. **New Request Created** → Show notification
2. **Request Status Updated** → Update list/detail
3. **Team Location Updated** → Update map
4. **Mission Completed** → Show success alert

### Auto-refresh:
- Dashboard stats: Every 30s
- Requests list: Every 60s
- Map markers: Every 10s

---

## 🎨 Color Coding

**Priority Levels:**
- 🔴 Critical: Red (#EF4444)
- 🟠 High: Orange (#F97316)
- 🟡 Medium: Yellow (#EAB308)
- 🟢 Low: Green (#22C55E)

**Status:**
- ⚪ Pending: Gray
- 🔵 Assigned: Blue
- 🟣 In Progress: Purple
- 🟢 Completed: Green
- 🔴 Cancelled: Red

---

## 📱 Responsive Design

### Desktop (>1024px):
- Sidebar always visible
- 2-column layouts
- Detailed tables

### Tablet (768-1024px):
- Collapsible sidebar
- Cards instead of tables
- Simplified views

### Mobile (<768px):
- Bottom navigation
- Stack layouts
- Essential info only
- Touch-optimized buttons

---

## 🔐 Permissions

Coordinator can:
- ✅ View all requests
- ✅ Assign/reassign teams
- ✅ Update priorities
- ✅ Verify requests
- ✅ View team status
- ✅ Generate reports
- ❌ Delete requests
- ❌ Manage users

---

## 🚀 Performance

### Optimization:
- Lazy load images
- Virtual scrolling for long lists
- Debounced search
- Cached API responses
- Optimistic UI updates

### Loading States:
- Skeleton screens
- Progress indicators
- Smooth transitions

---

## 📝 Notes

- All times display in local timezone
- Auto-save notes/comments
- Undo/redo for critical actions
- Confirmation dialogs for destructive actions
- Toast notifications for feedback
