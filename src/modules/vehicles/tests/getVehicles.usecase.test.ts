import { describe, expect, it, vi } from "vitest";
import { GetVehiclesUseCase } from "../application/getVehicles.usecase";
import type { IVehicleRepository } from "../domain/vehicles.repository";
import type { Vehicle } from "../domain/vehicles.enity";

function makeVehicle(overrides: Partial<Vehicle> = {}): Vehicle {
  return {
    licensePlate: "51A-12345",
    type: "TRUCK",
    brand: "Isuzu",
    model: "N-Series",
    year: 2020,
    color: "White",
    capacity: 1000,
    capacityUnit: "KG",
    status: "ACTIVE",
    description: "Test vehicle",
    isActive: true,
    createdBy: "user-1",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

function makeRepository(): IVehicleRepository {
  return {
    getVehicles: vi.fn(),
    createVehicle: vi.fn(),
    updateVehicleStatus: vi.fn(),
    importExcel: vi.fn(),
  };
}

describe("GetVehiclesUseCase", () => {
  it("returns vehicles and total from repository", async () => {
    const repository = makeRepository();
    const response = { vehicles: [makeVehicle()], total: 1 };
    vi.mocked(repository.getVehicles).mockResolvedValue(response);

    const useCase = new GetVehiclesUseCase(repository);
    const result = await useCase.execute();

    expect(result).toEqual(response);
    expect(repository.getVehicles).toHaveBeenCalledTimes(1);
  });
});
