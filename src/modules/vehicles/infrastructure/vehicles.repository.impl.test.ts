import { beforeEach, describe, expect, it, vi } from "vitest";
import { VehicleRepositoryImpl } from "./vehicles.repository.impl";
import { vehicleApi } from "./vehicles.api";

vi.mock("./vehicles.api", () => ({
  vehicleApi: {
    getVehicles: vi.fn(),
    createVehicle: vi.fn(),
    updateVehicleStatus: vi.fn(),
    importExcel: vi.fn(),
  },
}));

describe("VehicleRepositoryImpl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps getVehicles response to domain shape", async () => {
    vi.mocked(vehicleApi.getVehicles).mockResolvedValue({
      data: [{ licensePlate: "51A-12345" }],
      meta: { total: 7 },
    } as any);

    const repository = new VehicleRepositoryImpl();
    const result = await repository.getVehicles();

    expect(result).toEqual({
      vehicles: [{ licensePlate: "51A-12345" }],
      total: 7,
    });
  });

  it("returns safe defaults when api returns empty payload", async () => {
    vi.mocked(vehicleApi.getVehicles).mockResolvedValue(undefined as any);

    const repository = new VehicleRepositoryImpl();
    const result = await repository.getVehicles();

    expect(result).toEqual({ vehicles: [], total: 0 });
  });

  it("returns created vehicle from api data", async () => {
    vi.mocked(vehicleApi.createVehicle).mockResolvedValue({
      data: { licensePlate: "51A-12345" },
    } as any);

    const repository = new VehicleRepositoryImpl();
    const result = await repository.createVehicle({ licensePlate: "51A-12345" });

    expect(result).toEqual({ licensePlate: "51A-12345" });
    expect(vehicleApi.createVehicle).toHaveBeenCalledWith({
      licensePlate: "51A-12345",
    });
  });

  it("forwards updateVehicleStatus call to api", async () => {
    vi.mocked(vehicleApi.updateVehicleStatus).mockResolvedValue();

    const repository = new VehicleRepositoryImpl();
    await repository.updateVehicleStatus("vehicle-1", "ACTIVE");

    expect(vehicleApi.updateVehicleStatus).toHaveBeenCalledWith(
      "vehicle-1",
      "ACTIVE",
    );
  });

  it("forwards importExcel call to api", async () => {
    const file = new File(["a"], "vehicles.xlsx");
    vi.mocked(vehicleApi.importExcel).mockResolvedValue(undefined as any);

    const repository = new VehicleRepositoryImpl();
    await repository.importExcel(file);

    expect(vehicleApi.importExcel).toHaveBeenCalledWith(file);
  });
});
