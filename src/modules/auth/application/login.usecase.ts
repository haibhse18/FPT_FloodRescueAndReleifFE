/**
 * Login Use Case - Application layer
 * Orchestrate login flow với business logic
 */

import { IAuthRepository } from "../domain/auth.repository";
import { LoginCredentials, LoginResponse } from "../domain/user.entity";
import { loginSchema } from "@/shared/schemas/validation";

export class LoginUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  /**
   * Execute login với validation
   * @param credentials - { email, password }
   * @returns LoginResponse - { accessToken, user }
   */
  async execute(credentials: LoginCredentials): Promise<LoginResponse> {
    // Validate credentials using Zod schema
    const validation = loginSchema.safeParse(credentials);

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      throw new Error(firstError.message);
    }

    // Call repository
    const response = await this.authRepository.login(credentials);

    return response;
  }
}
