import { IRequestRepository } from "../domain/request.repository";

/**
 * Use Case: Update Request Status
 * Coordinator verify request hoặc mark as spam/rejected
 */
export class UpdateRequestStatusUseCase {
  constructor(private requestRepository: IRequestRepository) {}

  async execute(requestId: string, status: string): Promise<void> {
    if (!requestId) {
      throw new Error("Request ID is required");
    }

    const validStatuses = [
      "Submitted",
      "Verified",
      "In Progress",
      "Completed",
      "Spam",
      "Rejected",
      "Cancelled",
    ];

    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    await this.requestRepository.updateRequestStatus(requestId, status);
  }
}
