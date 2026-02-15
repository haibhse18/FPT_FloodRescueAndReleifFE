import { create } from "zustand";
import { toast } from "sonner";
import {
  User,
  UserRole,
  RegisterData,
  LoginCredentials,
} from "@/modules/auth/domain/user.entity";
import { authRepository } from "@/modules/auth/infrastructure/auth.repository.impl";
import { LoginUseCase } from "@/modules/auth/application/login.usecase";
import { RegisterUseCase } from "@/modules/auth/application/register.usecase";
import { LogoutUseCase } from "@/modules/auth/application/logout.usecase";
import { GetCurrentUserUseCase } from "@/modules/auth/application/getCurrentUser.usecase";
import { RefreshTokenUseCase } from "@/modules/auth/application/refreshToken.usecase";
import { tokenManager } from "@/lib/axios";

// Khởi tạo use cases - Dependency Injection
const loginUseCase = new LoginUseCase(authRepository);
const registerUseCase = new RegisterUseCase(authRepository);
const logoutUseCase = new LogoutUseCase(authRepository);
const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);
const refreshTokenUseCase = new RefreshTokenUseCase(authRepository);

interface AuthState {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData, confirmPassword: string) => Promise<boolean>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  initAuth: () => Promise<void>;
  clearAuth: () => void;
}

/**
 * Auth Store - Zustand
 *
 * Theo auth-flow.md:
 * - Access token lưu trong memory (tokenManager), KHÔNG persist
 * - Refresh token trong HTTP-only cookie (server set)
 * - Khi reload page, gọi /auth/me hoặc /auth/refresh để khôi phục session
 */
export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  role: null,
  loading: false,
  isAuthenticated: false,

  /**
   * Đăng nhập
   * POST /api/auth/login
   */
  login: async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      set({ loading: true });

      const response = await loginUseCase.execute(credentials);

      // Token đã được lưu vào memory bởi authRepository
      set({
        user: response.user,
        role: response.user.role,
        isAuthenticated: true,
      });

      toast.success("Đăng nhập thành công!");
      return true;
    } catch (error) {
      console.error("Login error:", error);
      const message =
        error instanceof Error ? error.message : "Đăng nhập thất bại";
      toast.error(message);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Đăng ký
   * POST /api/auth/register
   */
  register: async (
    data: RegisterData,
    confirmPassword: string,
  ): Promise<boolean> => {
    try {
      set({ loading: true });

      await registerUseCase.execute(data, confirmPassword);

      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      return true;
    } catch (error) {
      console.error("Register error:", error);
      const message =
        error instanceof Error ? error.message : "Đăng ký thất bại";
      toast.error(message);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Đăng xuất
   * POST /api/auth/logout
   */
  logout: async (): Promise<void> => {
    try {
      set({ loading: true });
      await logoutUseCase.execute();

      get().clearAuth();
      toast.success("Đăng xuất thành công!");
    } catch (error) {
      console.error("Logout error:", error);
      // Vẫn xóa local state dù API fail
      get().clearAuth();
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Lấy thông tin user hiện tại
   * GET /api/auth/me
   */
  getCurrentUser: async (): Promise<void> => {
    try {
      set({ loading: true });

      const response = await getCurrentUserUseCase.execute();

      set({
        user: response,
        role: response.role,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error("Get current user error:", error);
      // Token không hợp lệ, xóa auth state
      get().clearAuth();
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Refresh token
   * POST /api/auth/refresh
   */
  refreshToken: async (): Promise<boolean> => {
    try {
      const response = await refreshTokenUseCase.execute();

      // Token đã được lưu vào memory bởi authRepository
      set({
        user: response.user,
        role: response.user.role,
        isAuthenticated: true,
      });

      return true;
    } catch (error) {
      // Silently clear auth on refresh failure (no user logged in or token expired)
      // Don't log error here as it's expected on initial load without valid session
      get().clearAuth();
      return false;
    }
  },

  /**
   * Khởi tạo auth state khi app load
   * Theo auth-flow.md: Khi reload, gọi /auth/refresh để lấy token mới
   * (vì access token chỉ lưu trong memory, mất khi refresh page)
   */
  initAuth: async (): Promise<void> => {
    try {
      set({ loading: true });

      // Thử refresh token từ cookie để lấy access token mới
      const success = await get().refreshToken();

      if (!success) {
        get().clearAuth();
      }
    } catch (error) {
      console.error("Init auth error:", error);
      get().clearAuth();
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Xóa toàn bộ auth state
   */
  clearAuth: (): void => {
    tokenManager.clearToken();
    set({
      user: null,
      role: null,
      isAuthenticated: false,
    });
  },
}));
