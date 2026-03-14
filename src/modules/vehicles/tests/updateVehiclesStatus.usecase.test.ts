import { describe, expect, it, vi } from "vitest";
import { UpdateVehicleStatusUseCase } from "../application/updateVehiclesStatus.usecase";
import type { IVehicleRepository } from "../domain/vehicles.repository";

function makeRepository(): IVehicleRepository {
  return {
    getVehicles: vi.fn(),
    createVehicle: vi.fn(),
    updateVehicleStatus: vi.fn(),
    importExcel: vi.fn(),
  };
}

describe("UpdateVehicleStatusUseCase", () => {
  it("throws when id is missing", async () => {
    const repository = makeRepository();
    const useCase = new UpdateVehicleStatusUseCase(repository);

    await expect(useCase.execute("", "ACTIVE")).rejects.toThrow(
      "Invalid vehicle data",
    );

    expect(repository.updateVehicleStatus).not.toHaveBeenCalled();
  });

  it("calls repository when data is valid", async () => {
    const repository = makeRepository();
    vi.mocked(repository.updateVehicleStatus).mockResolvedValue();
    const useCase = new UpdateVehicleStatusUseCase(repository);

    await useCase.execute("vehicle-1", "MAINTENANCE");

    expect(repository.updateVehicleStatus).toHaveBeenCalledWith(
      "vehicle-1",
      "MAINTENANCE",
    );
  });
});
