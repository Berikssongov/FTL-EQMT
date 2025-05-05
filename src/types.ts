// ---------- Equipment ----------
export interface Equipment {
  id?: string;
  name: string;
  category: string;
  make: string;
  modelNumber: string;
  serialNumber: string;
  location: string;
  status: string;
  condition: string;
  notes?: string;
  legal?: {
    licensePlate?: string;
    insuranceInfo?: string;
  };
  engine?: {
    serialNumber?: string;
    modelNumber?: string;
  };
  weightCapacity?: number;
  towingCapacity?: number;
  assignedTo?: string;
  lastInspection?: string;
}

// ---------- UI-Friendly Equipment Extensions ----------
export interface EquipmentServiceRecord {
  id: string;
  equipmentId: string;
  date: string;
  summary: string;
  totalCost: number;
  items?: {
    description: string;
    cost: number;
  }[];
}

export interface EquipmentPart {
  id: string;
  equipmentId: string;
  name: string; // maps from partName
  partNumber: string;
  vendor: string;
  price: number;
}

// ---------- Firestore Records ----------
export interface ServiceRecord {
  id?: string;
  equipmentId: string;
  date: string;
  summary?: string;
  totalCost?: number;
  items: LineItem[];
  vendorName?: string;
  vendorContact?: string;
}


export interface PartRecord {
  id?: string;
  equipmentId: string;
  partName: string;
  partNumber: string;
  price: number;
  vendor?: string;
  vendorName?: string;
  vendorContact?: string;
  dateInstalled?: string;
}

// ---------- Hand Tools ----------
export interface HandTool {
  id?: string;
  name: string;
  location: string;
  condition: string;
  quantity: number;
}

// ---------- Power Tools ----------
export interface PowerTool {
  id?: string;
  name: string;
  location: string;
  serialNumber?: string;
  condition: string;
}

// ---------- Shared ----------
export interface Location {
  id?: string;
  name: string;
}

// ---------- Optional: for future use ----------
export interface DamageReport {
  id?: string;
  equipmentId: string;
  description: string;
  reportedBy: string;
  dateReported: string;
}

export interface LineItem {
  description: string;
  cost: number;
}

export interface KeyRecord {
  id: string;
  name: string;
  info?: string;
  isRestricted: boolean;
  currentAssignment?: {
    type: "person" | "lockbox";
    name: string;
  };
}

export interface KeyLog {
  id?: string;
  keyName: string;
  action: "Signing In" | "Signing Out";
  person: string;
  lockbox: string;
  timestamp: string;
}


export interface KeyHolder {
  name: string;
  type: "person" | "lockbox";
  quantity?: number;
}

export interface KeyData {
  id: string;
  keyName: string;
  isRestricted?: boolean;
  holders?: KeyHolder[];
  currentHolder?: KeyHolder;
}

export interface KeyLogEntry {
  action: string;
  keyName: string;
  lockbox: string;
  person: string;
  timestamp: string;
}


