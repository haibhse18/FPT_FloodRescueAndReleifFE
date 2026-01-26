# Architecture Flow - Clean Architecture

Tài liệu này giải thích luồng hoạt động của cấu trúc Clean Architecture trong dự án.

---

## 1. Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION                             │
│  (React Components, Pages, Hooks)                               │
│  - Chỉ chứa UI logic                                            │
│  - Gọi Use Cases để thực hiện business logic                    │
└───────────────────────────┬─────────────────────────────────────┘
                            │ calls
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        APPLICATION                               │
│  (Use Cases)                                                     │
│  - Chứa business logic                                          │
│  - Orchestrate flow giữa các layers                             │
│  - Validation dữ liệu                                           │
└───────────────────────────┬─────────────────────────────────────┘
                            │ uses interface
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                          DOMAIN                                  │
│  (Entities, Repository Interfaces)                              │
│  - Định nghĩa entities (data structures)                        │
│  - Định nghĩa contracts (interfaces)                            │
│  - KHÔNG phụ thuộc framework                                    │
└───────────────────────────┬─────────────────────────────────────┘
                            │ implements
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      INFRASTRUCTURE                              │
│  (API Adapters, Repository Implementations)                     │
│  - Implement các interfaces từ Domain                           │
│  - Gọi API backend                                              │
│  - Xử lý data transformation                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Luồng hoạt động chi tiết

### Ví dụ: User đăng nhập

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  LoginPage   │───▶│ LoginUseCase │───▶│ IAuthRepo    │───▶│  authApi     │
│  (UI)        │    │ (Business)   │    │ (Interface)  │    │  (HTTP)      │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
       │                   │                   │                   │
       │ 1. User click     │                   │                   │
       │    "Đăng nhập"    │                   │                   │
       │                   │                   │                   │
       ├──────────────────▶│                   │                   │
       │ 2. Gọi            │                   │                   │
       │    loginUseCase   │                   │                   │
       │    .execute()     │                   │                   │
       │                   │                   │                   │
       │                   ├──────────────────▶│                   │
       │                   │ 3. Validate &     │                   │
       │                   │    gọi repository │                   │
       │                   │    .login()       │                   │
       │                   │                   │                   │
       │                   │                   ├──────────────────▶│
       │                   │                   │ 4. Gọi API        │
       │                   │                   │    POST /login    │
       │                   │                   │                   │
       │                   │                   │◀──────────────────┤
       │                   │                   │ 5. Response       │
       │                   │                   │    (tokens)       │
       │                   │                   │                   │
       │                   │◀──────────────────┤                   │
       │                   │ 6. Lưu token      │                   │
       │                   │    vào storage    │                   │
       │                   │                   │                   │
       │◀──────────────────┤                   │                   │
       │ 7. Return         │                   │                   │
       │    AuthTokens     │                   │                   │
       │                   │                   │                   │
       │ 8. Redirect       │                   │                   │
       │    to /citizen    │                   │                   │
       ▼                   ▼                   ▼                   ▼
```

---

## 3. Chi tiết từng layer

### 3.1 Domain Layer (Lõi)

**Mục đích:** Định nghĩa "what" - cấu trúc dữ liệu và contracts

```typescript
// domain/user.entity.ts - Định nghĩa cấu trúc dữ liệu
export interface User {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
}

// domain/auth.repository.ts - Định nghĩa contract
export interface IAuthRepository {
    login(credentials: LoginCredentials): Promise<AuthTokens>;
    logout(): Promise<void>;
    getCurrentUser(): Promise<User>;
}
```

**Nguyên tắc:**
- ❌ KHÔNG import từ infrastructure, presentation
- ❌ KHÔNG phụ thuộc framework (React, Next.js)
- ✅ Chỉ chứa interfaces và types thuần

---

### 3.2 Application Layer (Use Cases)

**Mục đích:** Định nghĩa "how" - business logic và orchestration

```typescript
// application/login.usecase.ts
export class LoginUseCase {
    constructor(private readonly authRepository: IAuthRepository) {}

    async execute(credentials: LoginCredentials): Promise<AuthTokens> {
        // 1. Validation
        if (!credentials.password) {
            throw new Error('Mật khẩu là bắt buộc');
        }

        // 2. Gọi repository (không biết implementation cụ thể)
        const tokens = await this.authRepository.login(credentials);

        return tokens;
    }
}
```

**Nguyên tắc:**
- ✅ Chỉ gọi interfaces từ Domain
- ✅ Chứa business rules và validation
- ❌ KHÔNG gọi API trực tiếp
- ❌ KHÔNG biết về UI

---

### 3.3 Infrastructure Layer (Adapters)

**Mục đích:** Implement các interfaces - kết nối với external services

```typescript
// infrastructure/auth.api.ts - API calls
export const authApi = {
    login: async (credentials: LoginCredentials): Promise<AuthTokens> => {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
        return response.json();
    },
};

// infrastructure/auth.repository.impl.ts - Implement interface
export class AuthRepositoryImpl implements IAuthRepository {
    async login(credentials: LoginCredentials): Promise<AuthTokens> {
        const tokens = await authApi.login(credentials);
        
        // Lưu token vào localStorage
        localStorage.setItem('accessToken', tokens.accessToken);
        
        return tokens;
    }
}

// Singleton instance
export const authRepository = new AuthRepositoryImpl();
```

**Nguyên tắc:**
- ✅ Implement interfaces từ Domain
- ✅ Xử lý side effects (API, storage, etc.)
- ✅ Data transformation

---

### 3.4 Presentation Layer (UI)

**Mục đích:** Hiển thị UI và xử lý user interactions

```typescript
// presentation/pages/LoginPage.tsx
import { LoginUseCase } from '../application/login.usecase';
import { authRepository } from '../infrastructure/auth.repository.impl';

// Khởi tạo use case với repository
const loginUseCase = new LoginUseCase(authRepository);

export default function LoginPage() {
    const handleSubmit = async (e: React.FormEvent) => {
        try {
            // Gọi use case, KHÔNG gọi API trực tiếp
            const tokens = await loginUseCase.execute({ 
                phoneNumber, 
                password 
            });
            
            router.push('/citizen');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* UI components */}
        </form>
    );
}
```

**Nguyên tắc:**
- ✅ Gọi Use Cases, KHÔNG gọi API trực tiếp
- ✅ Chỉ chứa UI logic (state, effects, handlers)
- ❌ KHÔNG chứa business logic

---

## 4. Dependency Flow

```
Presentation ──────▶ Application ──────▶ Domain ◀────── Infrastructure
     │                    │                 │                  │
     │                    │                 │                  │
     │    imports         │    imports      │     implements   │
     │    Use Cases       │    Interfaces   │     Interfaces   │
     │                    │                 │                  │
     └────────────────────┴─────────────────┴──────────────────┘
```

**Quy tắc Dependency:**
- Domain KHÔNG phụ thuộc layer nào
- Application chỉ phụ thuộc Domain
- Infrastructure phụ thuộc Domain (để implement interfaces)
- Presentation phụ thuộc Application và Infrastructure

---

## 5. Cấu trúc thư mục module

```
modules/requests/
├── domain/                          # Layer 1: Core
│   ├── request.entity.ts            # Entities, Types
│   └── request.repository.ts        # Repository Interface
│
├── application/                     # Layer 2: Business Logic
│   ├── createRescueRequest.usecase.ts
│   └── getMyRequests.usecase.ts
│
├── infrastructure/                  # Layer 3: External
│   ├── requests.api.ts              # API calls
│   └── request.repository.impl.ts   # Repository Implementation
│
├── presentation/                    # Layer 4: UI
│   ├── components/
│   │   ├── EmergencyButton.tsx
│   │   └── RescueRequestModal.tsx
│   ├── hooks/
│   └── pages/
│       └── CitizenRequestPage.tsx
│
└── index.ts                         # Module exports
```

---

## 6. Lợi ích của Clean Architecture

### 6.1 Testability
```typescript
// Dễ dàng mock repository để test use case
const mockRepository: IAuthRepository = {
    login: jest.fn().mockResolvedValue({ accessToken: 'test' }),
};

const useCase = new LoginUseCase(mockRepository);
const result = await useCase.execute({ phone: '123', password: 'abc' });

expect(result.accessToken).toBe('test');
```

### 6.2 Maintainability
- Thay đổi API? → Chỉ sửa Infrastructure
- Thay đổi business rules? → Chỉ sửa Application
- Thay đổi UI? → Chỉ sửa Presentation

### 6.3 Scalability
- Dễ dàng thêm features mới
- Mỗi module độc lập
- Code reusable giữa các modules

---

## 7. Best Practices

### ✅ NÊN làm:
1. Presentation gọi Use Cases
2. Use Cases gọi Repository Interfaces
3. Infrastructure implements Interfaces
4. Mỗi module có index.ts để export

### ❌ KHÔNG nên làm:
1. Presentation gọi API trực tiếp
2. Domain import từ Infrastructure
3. Trộn business logic vào UI components
4. Hardcode dependencies

---

## 8. Quick Reference

| Layer | Chứa gì | Import từ | Được import bởi |
|-------|---------|-----------|-----------------|
| Domain | Entities, Interfaces | Không có | Tất cả |
| Application | Use Cases | Domain | Presentation |
| Infrastructure | API, Implementations | Domain | Presentation |
| Presentation | Components, Pages | Application, Infrastructure | app/ |
