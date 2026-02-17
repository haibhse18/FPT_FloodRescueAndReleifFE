import { IRequestRepository } from "../domain/request.repository";

/**
 * Use Case: Update Request Priority
 * Coordinator set priority cho request (critical, high, normal)
 */
export class UpdateRequestPriorityUseCase {
  constructor(private requestRepository: IRequestRepository) {}

  async execute(requestId: string, priority: string): Promise<void> {
    if (!requestId) {
      throw new Error("Request ID is required");
    }

    const validPriorities = ["critical", "high", "normal"];

    if (!validPriorities.includes(priority)) {
      throw new Error(`Invalid priority: ${priority}`);
    }

    await this.requestRepository.updateRequestPriority(requestId, priority);
  }
}
