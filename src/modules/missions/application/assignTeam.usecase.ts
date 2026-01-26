/**
 * Assign Team Use Case - Application layer
 * Handle team assignment operations
 */

import { IMissionRepository } from '../domain/mission.repository';

export class AssignTeamUseCase {
    constructor(private readonly missionRepository: IMissionRepository) {}

    /**
     * Assign a rescue team to a request
     */
    async execute(requestId: string, teamId: string): Promise<void> {
        if (!requestId) {
            throw new Error('ID yêu cầu là bắt buộc');
        }

        if (!teamId) {
            throw new Error('ID đội cứu hộ là bắt buộc');
        }

        await this.missionRepository.assignRescueTeam(requestId, teamId);
    }
}
