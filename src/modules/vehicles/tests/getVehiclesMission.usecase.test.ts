import { describe, expect, it, vi } from "vitest";
import { GetVehiclesMissionUseCase } from "../application/getVehiclesMission.usecase";
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

describe("GetVehiclesMissionUseCase", () => {
  it("returns only vehicles list from repository response", async () => {
    const repository = makeRepository();
    const vehicles = [makeVehicle(), makeVehicle({ licensePlate: "51A-67890" })];
    vi.mocked(repository.getVehicles).mockResolvedValue({ vehicles, total: 2 });

    const useCase = new GetVehiclesMissionUseCase(repository);
    const result = await useCase.execute();

    expect(result).toEqual(vehicles);
    expect(repository.getVehicles).toHaveBeenCalledTimes(1);
  });
});
