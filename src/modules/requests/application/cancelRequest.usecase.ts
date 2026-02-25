import { IRequestRepository } from "../domain/request.repository";
import {
  CoordinatorRequest,
  CancelRequestInput,
} from "../domain/request.entity";

/**
 * Use Case: Cancel Request (Coordinator)
 */
export class CancelRequestUseCase {
  constructor(private requestRepository: IRequestRepository) {}

  async execute(
    requestId: string,
    input?: CancelRequestInput,
  ): Promise<CoordinatorRequest> {
    if (!requestId) throw new Error("Request ID is required");
    return await this.requestRepository.cancelRequest(requestId, input);
  }
}
