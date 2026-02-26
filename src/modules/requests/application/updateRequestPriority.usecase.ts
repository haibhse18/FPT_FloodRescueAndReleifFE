import { IRequestRepository } from "../domain/request.repository";
import {
  UpdatePriorityInput,
  CoordinatorRequest,
} from "../domain/request.entity";

/**
 * Use Case: Update Request Priority
 * Coordinator set priority cho request (Critical, High, Normal)
 */
export class UpdateRequestPriorityUseCase {
  constructor(private requestRepository: IRequestRepository) {}

  async execute(
    requestId: string,
    input: UpdatePriorityInput,
  ): Promise<CoordinatorRequest> {
    if (!requestId) {
      throw new Error("Request ID is required");
    }

    return await this.requestRepository.updateRequestPriority(requestId, input);
  }
}
