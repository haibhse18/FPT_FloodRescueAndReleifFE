# Manager Branch - New APIs to Reuse in citizen-ui-update

This note captures API additions found in branch `feat/manager` so they can be reused in `feat/citizen-ui-update`.

## 1) Combo Supplies APIs
Source: `src/modules/supplies/infrastructure/comboSupply.api.ts`

- `GET /combo-supplies`
  - Optional query: `incidentType`
- `GET /combo-supplies/{id}`

## 2) Mission Supply Allocation API
Source: `src/modules/supplies/infrastructure/missionSupply.api.ts`

- `PATCH /mission-supplies/{id}/allocate`
  - Payload:
    - `warehouseId?: string`
    - `allocatedQty?: number`
    - `actualQty?: number`
    - `status?: "REQUESTED" | "ALLOCATED" | "DELIVERED" | "COMPLETED" | "CANCELLED"`

## 3) Request DTO update (for relief combo)
Source: `src/modules/requests/infrastructure/requests.api.ts`

- Added field in `CreateRescueRequestDTO`:
  - `comboSupplyId?: string | null`

## 4) Vehicle assignment API
Source: `src/modules/vehicles/infrastructure/vehicles.api.ts`

- `PATCH /vehicles/{id}/assign-mission`
  - Payload: `{ missionId: string }`

## 5) Inventory allocation API
Source: `src/modules/inventory/infrastructure/inventory.api.ts`

- `POST /inventory/allocate`
  - Payload:
    - `missionId: string`
    - `supplyId: string`
    - `warehouseId: string`
    - `allocatedQty: number`

## Suggested files to cherry-pick into `feat/citizen-ui-update`

- `src/modules/supplies/infrastructure/comboSupply.api.ts`
- `src/modules/supplies/infrastructure/missionSupply.api.ts`
- `src/modules/requests/infrastructure/requests.api.ts`
- `src/modules/vehicles/infrastructure/vehicles.api.ts`
- `src/modules/inventory/infrastructure/inventory.api.ts`

## Note

At the moment, `docs/API_list.md` and `docs/Swagger/swagger.yaml` do not fully reflect all of the above changes.
