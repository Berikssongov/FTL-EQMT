export interface Equipment {
  id?: string;
  name: string;
  category: string;
  status: string;
  location: string;
  notes?: string;
  make: string;
  serialNumber: string;
  modelNumber: string;
  lastInspection?: string;
  assignedTo?: string;

  netWeight?: string;
  grossWeight?: string;
  description?: string;

  legal?: {
    licensePlate?: string;
    insuranceInfo?: string;
  };

  engine?: {
    serialNumber?: string;
    modelNumber?: string;
  };

  damageReports?: DamageReport[];
}

export interface DamageReport {
  partName: string;
  partNumber: string;
  supplier1: string;
  price1: string;
  supplier2: string;
  price2: string;
  supplier3: string;
  price3: string;
  timestamp?: string;
}
