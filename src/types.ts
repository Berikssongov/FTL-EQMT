export interface Equipment {
  id?: string;
  name: string;
  category: string;
  status: 'available' | 'in_use' | 'maintenance';
  location: string;
  notes?: string;
  lastInspection?: string;
  assignedTo?: string;

  // 🔧 New core fields
  make: string;
  serialNumber: string;
  modelNumber: string;

  // Nested optional groups
  legal?: {
    licensePlate?: string;
    insuranceInfo?: string;
  };

  engine?: {
    serialNumber?: string;
    modelNumber?: string;
  };
}
