import { ITeamRepository } from "../domain/team.repository";
import { teamRepository } from "../infrastructure/team.repository.impl";
import { Team } from "../domain/team.entity";

export class ApproveTeamApplicationUseCase {
    constructor(
        private readonly teamRepository: ITeamRepository,
    ) { }

    /**
     * Get notifications for a user
     */
    async execute(applicationId: string): Promise<Team> {
        return this.teamRepository.approve(applicationId);
    }
}