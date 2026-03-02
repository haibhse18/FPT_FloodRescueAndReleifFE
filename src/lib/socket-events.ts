/**
 * Socket event constants — phải khớp với BE (notification.emitter.js)
 *
 * Không bao gồm MISSION_RESCUED (đã bị loại bỏ).
 */
export const SOCKET_EVENTS = {
  // ─── Request Lifecycle ───────────────────────────
  /** Citizen gửi request mới → Coordinator nhận */
  REQUEST_SUBMITTED: "REQUEST_SUBMITTED",

  /** Coordinator xác minh request → Citizen nhận */
  REQUEST_VERIFIED: "REQUEST_VERIFIED",

  /** Coordinator từ chối request → Citizen nhận */
  REQUEST_REJECTED: "REQUEST_REJECTED",

  // ─── Mission Lifecycle ───────────────────────────
  /** Coordinator assign team → Citizen + Team Leader nhận */
  MISSION_ASSIGNED: "MISSION_ASSIGNED",

  /** Team accept nhiệm vụ → Coordinator nhận */
  MISSION_ACCEPTED: "MISSION_ACCEPTED",

  /** Team đang trên đường → Citizen nhận */
  MISSION_APPROACHING: "MISSION_APPROACHING",

  /** Mission hoàn thành → Citizen + Coordinator nhận */
  MISSION_COMPLETED: "MISSION_COMPLETED",

  /** Mission thất bại → Citizen + Coordinator nhận */
  MISSION_FAILED: "MISSION_FAILED",

  /** Mission được chuyển cho team khác → Team Leader mới nhận */
  MISSION_REASSIGNED: "MISSION_REASSIGNED",

  /** Team từ chối / rút khỏi mission → Coordinator nhận */
  MISSION_WITHDRAWN: "MISSION_WITHDRAWN",

  // ─── General ─────────────────────────────────────
  /** Notification mới (generic) */
  NEW_NOTIFICATION: "NEW_NOTIFICATION",

  /** Cập nhật số lượng chưa đọc */
  UNREAD_COUNT_UPDATE: "UNREAD_COUNT_UPDATE",

  /** Server confirm kết nối thành công */
  CONNECTED: "CONNECTED",
} as const;

export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
