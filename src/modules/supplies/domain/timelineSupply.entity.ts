/**
 * TimelineSupply Entity - Domain layer
 * Represents supplies claimed by a team for a specific timeline
 */

export interface TimelineSupply {
  _id: string;
  timelineId: string;
  missionSupplyId: string;
  supplyId: string;
  carriedQty: number;
  returnedQty?: number;
  claimedAt: string;
  returnedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClaimSupplyInput {
  timelineId: string;
  missionSupplyId: string;
  carriedQty: number;
}

export interface GetTimelineSuppliesFilter {
  timelineId: string;
}
