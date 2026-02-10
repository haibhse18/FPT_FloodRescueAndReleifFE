/**
 * Get Request Detail UseCase - Application Layer
 * Lấy chi tiết yêu cầu cứu hộ/cứu trợ
 */

import { IRequestRepository } from '../domain/request.repository';
import { RescueRequest } from '../domain/request.entity';

export class GetRequestDetailUseCase {
    constructor(private requestRepository: IRequestRepository) {}

    async execute(requestId: string): Promise<RescueRequest> {
        if (!requestId) {
            throw new Error('Request ID is required');
        }

        return await this.requestRepository.getRequestDetail(requestId);
    }
}
