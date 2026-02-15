import { ICoordinatorRepository } from "../domain/coordinator.repository";
import { PaginatedRequests, RequestFilters } from "../domain/request.entity";

/**
 * Use Case: Get All Requests
 * Coordinator xem tất cả requests trong hệ thống
 */
export class GetAllRequestsUseCase {
  constructor(private coordinatorRepository: ICoordinatorRepository) {}

  async execute(filters?: RequestFilters): Promise<PaginatedRequests> {
    return await this.coordinatorRepository.getAllRequests(filters);
  }
}
