// statusUtils.ts - Single source of truth for all status-related logic

/**
 * Centralized status color mapping
 * Used by: Map markers, StopDetailCard, StatusBtn components
 */
export const STATUS_COLORS = {
  // Completed/Delivered - Green
  delivered: "#B2D235",
  completed: "#B2D235",
  received: "#B2D235",

  // Arrived - Yellow (FIXED)
  arrived: "#74C2F8",
  arrived_at_pickup: "#74C2F8",
  "arrived-at-pickup": "#74C2F8",

  // Picked Up / In Transit - Purple
  picked_up: "#6B7280",
  "picked-up": "#6B7280",
  arrived_at_delivery: "#6B7280",
  "arrived-at-delivery": "#6B7280",

  // Assigned/Open - Light Blue
  assigned: "#74C2F8",
  open: "#74C2F8",

  // Processing/Pending - Orange
  processing: "#E68A00",
  ongoing: "#E68A00",
  pending: "#E68A00",

  // Cancelled/Failed - Light Gray
  canceled: "#f3f4f6",
  cancelled: "#f3f4f6",
  returned: "#f3f4f6",
  undeliverable: "#f3f4f6",
  failed: "#f3f4f6",
  uncollectible: "#f3f4f6",

  // Multiple Statuses - Gray
  multiple: "#6B7280",

  // Void - Gray
  void: "#6B7280",

  // Paid - Green
  paid: "#10B981",

  // Default - Orange
  default: "#E68A00",
} as const;

/**
 * Status priority for z-index ordering on map
 * Higher priority = appears on top
 */
export const STATUS_PRIORITIES = {
  // Assigned (highest - needs attention)
  assigned: 1000,
  open: 1000,

  // Arrived (high priority)
  arrived: 900,
  arrived_at_pickup: 900,
  "arrived-at-pickup": 900,

  // Picked up / In transit
  picked_up: 800,
  "picked-up": 800,
  arrived_at_delivery: 800,
  "arrived-at-delivery": 800,

  // Processing
  processing: 700,
  ongoing: 700,
  pending: 700,

  // Default
  default: 500,

  // Completed (low priority)
  completed: 100,
  delivered: 100,
  received: 100,

  // Cancelled (lowest)
  canceled: 10,
  cancelled: 10,
} as const;

/**
 * Normalize status string for consistent lookups
 * Handles: underscores, hyphens, case sensitivity
 */
export const normalizeStatus = (status: string): string => {
  return status.toLowerCase().replace(/_/g, "-").trim();
};

/**
 * Get color for a status
 */
export const getStatusColor = (status: string): string => {
  const normalized = normalizeStatus(status);
  return (
    STATUS_COLORS[normalized as keyof typeof STATUS_COLORS] ||
    STATUS_COLORS.default
  );
};

/**
 * Get priority for a status (for z-index)
 */
export const getStatusPriority = (status: string): number => {
  const normalized = normalizeStatus(status).replace(/-/g, "_");
  return (
    STATUS_PRIORITIES[normalized as keyof typeof STATUS_PRIORITIES] ||
    STATUS_PRIORITIES.default
  );
};

/**
 * Get display label for a status
 */
export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    processing: "Processing",
    assigned: "Assigned",
    "arrived-at-pickup": "Arrived at Pickup",
    arrived: "Arrived",
    "picked-up": "Picked Up",
    "arrived-at-delivery": "Arrived at Delivery",
    delivered: "Delivered",
    completed: "Completed",
    canceled: "Canceled",
    cancelled: "Cancelled",
    undeliverable: "Undeliverable",
    multiple: "Multiple",
  };

  const normalized = normalizeStatus(status);
  return labels[normalized] || status.charAt(0).toUpperCase() + status.slice(1);
};

/**
 * Check if a status represents a locked/completed state
 */
export const isStatusLocked = (status: string): boolean => {
  const lockedStatuses = ["completed", "delivered", "canceled", "cancelled"];
  return lockedStatuses.includes(normalizeStatus(status));
};

/**
 * Check if pickup is locked for this status
 */
export const isPickupLockedForStatus = (status: string): boolean => {
  const lockingStatuses = [
    "picked-up",
    "arrived-at-delivery",
    "delivered",
    "completed",
    "canceled",
    "cancelled",
    "undeliverable",
  ];
  return lockingStatuses.includes(normalizeStatus(status));
};

/**
 * Check if delivery is locked for this status
 */
export const isDeliveryLockedForStatus = (status: string): boolean => {
  const lockingStatuses = [
    "delivered",
    "completed",
    "canceled",
    "cancelled",
    "undeliverable",
  ];
  return lockingStatuses.includes(normalizeStatus(status));
};
