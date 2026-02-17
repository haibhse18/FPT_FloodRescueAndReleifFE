import { IRequestRepository } from "../domain/request.repository";
import { PaginatedRequests, GetRequestsFilter } from "../domain/request.entity";

/**
 * Use Case: Get All Requests
 * Coordinator xem tất cả requests trong hệ thống
 */
export class GetAllRequestsUseCase {
  constructor(private requestRepository: IRequestRepository) {}

  async execute(filters?: GetRequestsFilter): Promise<PaginatedRequests> {
    return await this.requestRepository.getAllRequests(filters);
  }
}
