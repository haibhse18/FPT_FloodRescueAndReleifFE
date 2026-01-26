/**
 * Get Dashboard Stats Use Case - Application layer
 * Handle fetching dashboard statistics for manager
 */

import { IManagerRepository } from '../domain/user.repository';
import { DashboardStats } from '../domain/user.entity';

export class GetDashboardStatsUseCase {
    constructor(private readonly managerRepository: IManagerRepository) {}

    /**
     * Get dashboard statistics
     */
    async execute(): Promise<DashboardStats> {
        return this.managerRepository.getDashboardStats();
    }
}
