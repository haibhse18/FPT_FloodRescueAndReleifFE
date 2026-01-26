/**
 * Update Request Status Use Case - Application layer
 * Handle updating request status by team
 */

import { ITeamRepository } from '../domain/team.repository';
import { UpdateRequestStatusData } from '../domain/team.entity';

export class UpdateRequestStatusUseCase {
    constructor(private readonly teamRepository: ITeamRepository) {}

    /**
     * Update the status of a request
     */
    async execute(requestId: string, data: UpdateRequestStatusData): Promise<void> {
        if (!requestId) {
            throw new Error('ID yêu cầu là bắt buộc');
        }

        if (!data.status) {
            throw new Error('Trạng thái là bắt buộc');
        }

        await this.teamRepository.updateRequestStatus(requestId, data);
    }
}
