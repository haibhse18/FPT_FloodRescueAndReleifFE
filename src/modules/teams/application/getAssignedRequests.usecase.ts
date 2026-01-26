/**
 * Get Assigned Requests Use Case - Application layer
 * Handle fetching assigned requests for team
 */

import { ITeamRepository } from '../domain/team.repository';
import { AssignedRequest } from '../domain/team.entity';

export class GetAssignedRequestsUseCase {
    constructor(private readonly teamRepository: ITeamRepository) {}

    /**
     * Get all assigned requests for the team
     */
    async execute(): Promise<AssignedRequest[]> {
        return this.teamRepository.getAssignedRequests();
    }
}
