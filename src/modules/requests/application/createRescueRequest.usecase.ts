/**
 * Create Rescue Request Use Case - Application layer
 * Orchestrate rescue request creation với business logic
 */

import { IRequestRepository } from '../domain/request.repository';
import { RescueRequest, CreateRescueRequestData } from '../domain/request.entity';

export class CreateRescueRequestUseCase {
    constructor(private readonly requestRepository: IRequestRepository) { }

    /**
     * Execute create rescue request với validation
     */
    async execute(data: CreateRescueRequestData): Promise<RescueRequest> {
        // Validate required fields
        if (!data.latitude || !data.longitude) {
            throw new Error('Vị trí GPS là bắt buộc');
        }

        if (!data.incidentType && !data.dangerType && !data.type) {
            throw new Error('Loại nguy hiểm là bắt buộc');
        }

        // Call repository
        const request = await this.requestRepository.createRescueRequest(data);

        return request;
    }
}
