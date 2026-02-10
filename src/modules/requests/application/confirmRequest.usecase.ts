/**
 * Confirm Request UseCase - Application Layer
 * Citizen xác nhận đã an toàn / đã nhận hỗ trợ
 */

import { IRequestRepository } from '../domain/request.repository';

export class ConfirmRequestUseCase {
    constructor(private requestRepository: IRequestRepository) { }

    async execute(requestId: string): Promise<void> {
        if (!requestId) {
            throw new Error('Request ID is required');
        }

        await this.requestRepository.confirmRequest(requestId);
    }
}
