/**
 * Register Use Case - Application layer
 * Orchestrate registration flow với business logic
 */

import { IAuthRepository } from "../domain/auth.repository";
import { RegisterData, RegisterResponse } from "../domain/user.entity";
import { registerSchema } from "@/shared/schemas/validation";

export class RegisterUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  /**
   * Execute registration với validation
   * @param data - { userName, displayName, email, phoneNumber?, password, role? }
   * @param confirmPassword - Xác nhận mật khẩu
   * @returns RegisterResponse - { message, userId }
   */
  async execute(
    data: RegisterData,
    confirmPassword: string,
  ): Promise<RegisterResponse> {
    // Validate using Zod schema
    const validation = registerSchema.safeParse({
      userName: data.userName,
      displayName: data.displayName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      password: data.password,
      confirmPassword: confirmPassword,
    });

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      throw new Error(firstError.message);
    }

    // Call repository
    const response = await this.authRepository.register(data);

    return response;
  }
}
