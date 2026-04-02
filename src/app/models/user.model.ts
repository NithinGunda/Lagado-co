export interface Address {
  id?: number | string;
  type?: 'billing' | 'shipping' | string;
  street?: string;
  location?: string;
  landmark?: string;
  pincode?: string;
  state?: string;
  city?: string;
}

export interface User {
  id?: number | string;
  name?: string;
  email?: string;
  phone?: string;
  /** Some APIs return split name / DOB */
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  mobile?: string;
  is_admin?: boolean;
  addresses?: Address[];
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  token: string;
  token_type?: string;
  expires_in?: number;
  user?: User;
}
