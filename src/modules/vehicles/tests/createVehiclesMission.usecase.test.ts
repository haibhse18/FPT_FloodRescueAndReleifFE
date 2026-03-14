import { describe, expect, it, vi } from "vitest";
import { CreateVehicleUseCase } from "../application/createVehiclesMission.usecase";
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

describe("CreateVehicleUseCase", () => {
  it("throws when license plate is missing", async () => {
    const repository = makeRepository();
    const useCase = new CreateVehicleUseCase(repository);

    await expect(useCase.execute({ brand: "Toyota" })).rejects.toThrow(
      "License plate is required",
    );

    expect(repository.createVehicle).not.toHaveBeenCalled();
  });

  it("throws when repository returns invalid vehicle", async () => {
    const repository = makeRepository();
    vi.mocked(repository.createVehicle).mockResolvedValue({} as Vehicle);
    const useCase = new CreateVehicleUseCase(repository);

    await expect(
      useCase.execute({ licensePlate: "51A-12345" }),
    ).rejects.toThrow("Cannot create vehicle");
  });

  it("returns created vehicle when valid", async () => {
    const repository = makeRepository();
    const created = makeVehicle();
    vi.mocked(repository.createVehicle).mockResolvedValue(created);
    const useCase = new CreateVehicleUseCase(repository);

    const result = await useCase.execute({
      licensePlate: "51A-12345",
      brand: "Isuzu",
    });

    expect(result).toEqual(created);
    expect(repository.createVehicle).toHaveBeenCalledWith({
      licensePlate: "51A-12345",
      brand: "Isuzu",
    });
  });
});
