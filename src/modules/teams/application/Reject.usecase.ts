import { ITeamRepository } from "../domain/team.repository";
import { teamRepository } from "../infrastructure/team.repository.impl";
import { Team } from "../domain/team.entity";

export class RejectTeamApplicationUseCase {
    constructor(
        private readonly teamRepository: ITeamRepository,
    ) { }

    /**
     * Get notifications for a user
     */
    async execute(applicationId: string, reason: string): Promise<Team> {
        return this.teamRepository.reject(applicationId, reason);
    }
}