/**
 * Get All Requests Use Case - Application layer
 * Handle fetching all requests for coordination
 */

import { IMissionRepository } from '../domain/mission.repository';
import { CoordinatorRequest, GetAllRequestsFilter } from '../domain/mission.entity';

export class GetAllRequestsUseCase {
    constructor(private readonly missionRepository: IMissionRepository) {}

    /**
     * Get all rescue requests for coordination
     */
    async execute(filters?: GetAllRequestsFilter): Promise<CoordinatorRequest[]> {
        return this.missionRepository.getAllRequests(filters);
    }
}
