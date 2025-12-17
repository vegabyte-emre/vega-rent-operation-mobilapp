export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  segment: string;
  transmission: string;
  fuel_type: string;
  seat_count: number;
  door_count: number;
  daily_rate: number;
  color: string;
  mileage: number;
  status: 'available' | 'reserved' | 'rented' | 'maintenance';
  image_url?: string;
}

export interface Customer {
  id: string;
  tc_no: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  license_no?: string;
  license_class?: string;
}

export interface Reservation {
  id: string;
  vehicle_id: string;
  customer_id: string;
  start_date: string;
  end_date: string;
  pickup_location: string;
  return_location: string;
  status: 'created' | 'confirmed' | 'delivered' | 'returned' | 'closed';
  total_amount: number;
  notes?: string;
  created_at: string;
  vehicle?: Vehicle;
  customer?: Customer;
}

export interface Delivery {
  id: string;
  reservation_id: string;
  km_reading: number;
  fuel_level: number;
  photos: string[];
  notes?: string;
  kvkk_consent: boolean;
  delivered_by: string;
  delivered_at: string;
}

export interface Return {
  id: string;
  reservation_id: string;
  km_reading: number;
  fuel_level: number;
  photos: string[];
  damage_photos?: string[];
  damage_notes?: string;
  extra_charges?: number;
  notes?: string;
  returned_by: string;
  returned_at: string;
}

export interface GPSVehicle {
  vehicle_id: string;
  plate: string;
  latitude: number;
  longitude: number;
  speed: number;
  last_update: string;
}
