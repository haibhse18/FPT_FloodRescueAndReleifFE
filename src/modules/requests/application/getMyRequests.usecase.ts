/**
 * Get My Requests Use Case - Application layer
 * Fetch user's rescue requests
 */

import { IRequestRepository } from '../domain/request.repository';
import { RescueRequest, GetRequestsFilter } from '../domain/request.entity';

export class GetMyRequestsUseCase {
    constructor(private readonly requestRepository: IRequestRepository) {}

    /**
     * Execute get my requests
     */
    async execute(filters?: GetRequestsFilter): Promise<RescueRequest[]> {
        const requests = await this.requestRepository.getMyRequests(filters);
        return requests;
    }
}
