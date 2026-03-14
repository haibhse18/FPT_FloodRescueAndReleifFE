/**
 * Supplies Module Exports
 * Clean Architecture: Domain, Application, Infrastructure, Presentation
 */

// Domain
export type { Supply, SupplyRequest, SupplyItem, SupplyCategory, SupplyStatus, CreateSupplyRequestData } from './domain/supply.entity';
export type { ISupplyRepository } from './domain/supply.repository';

// Application
export { GetSuppliesUseCase } from './application/getSupplies.usecase';
export { GetSupplyRequestsUseCase } from './application/getSupplyRequests.usecase';
export { CreateSupplyRequestUseCase } from './application/createSupplyRequest.usecase';
export { UpdateSupplyStatusUseCase } from './application/updateSupplyStatus.usecase';

// Infrastructure
export { supplyApi } from './infrastructure/supply.api';
export { supplyRepository, SupplyRepositoryImpl } from './infrastructure/supply.repository.impl';

// Presentation - Components
export { SupplyList } from './presentation/components/SupplyList';
export { SupplyRequestForm } from './presentation/components/SupplyRequestForm';

// Presentation - Pages
export { default as SupplyManagement } from './presentation/pages/SupplyManagement';
