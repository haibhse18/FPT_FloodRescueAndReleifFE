/**
 * Create On Behalf Use Case - Application layer
 * Orchestrate request creation on behalf of citizen by coordinator
 */

import { IRequestRepository } from '../domain/request.repository';
import { CoordinatorRequest, CreateOnBehalfInput } from '../domain/request.entity';

export class CreateOnBehalfUseCase {
    constructor(private readonly requestRepository: IRequestRepository) { }

    /**
     * Execute create request on behalf with validation
     */
    async execute(data: CreateOnBehalfInput): Promise<CoordinatorRequest> {
        // Validate required fields
        if (!data.type) {
            throw new Error('Loại yêu cầu là bắt buộc (Rescue/Relief)');
        }

        if (!data.location || !data.location.coordinates || data.location.coordinates.length !== 2) {
            throw new Error('Vị trí (tọa độ) là bắt buộc');
        }

        if (!data.description) {
            throw new Error('Mô tả là bắt buộc');
        }

        if (!data.userName) {
            throw new Error('Tên người gửi là bắt buộc');
        }

        if (!data.phoneNumber) {
            throw new Error('Số điện thoại là bắt buộc');
        }

        // Call repository
        return await this.requestRepository.createOnBehalf(data);
    }
}
