import { IRequestRepository } from "../domain/request.repository";
import {
  VerifyRequestInput,
  CoordinatorRequest,
} from "../domain/request.entity";

/**
 * Use Case: Verify Request
 * Coordinator approve / reject a SUBMITTED request
 */
export class VerifyRequestUseCase {
  constructor(private requestRepository: IRequestRepository) {}

  async execute(
    requestId: string,
    input: VerifyRequestInput,
  ): Promise<CoordinatorRequest> {
    if (!requestId) throw new Error("Request ID is required");
    return await this.requestRepository.verifyRequest(requestId, input);
  }
}
