import { IRequestRepository } from "../domain/request.repository";
import { CoordinatorRequest } from "../domain/request.entity";

/**
 * Use Case: Close Request
 * Coordinator close a FULFILLED / PARTIALLY_FULFILLED request
 */
export class CloseRequestUseCase {
  constructor(private requestRepository: IRequestRepository) {}

  async execute(requestId: string): Promise<CoordinatorRequest> {
    if (!requestId) throw new Error("Request ID is required");
    return await this.requestRepository.closeRequest(requestId);
  }
}
