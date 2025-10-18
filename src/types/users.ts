
// Define user role type to match the database enum
export type UserRole = "admin" | "manager" | "staff";

// Define the user profile interface
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  active: boolean;
  status: 'pending' | 'active' | 'inactive';
  last_active: string;
  created_at: string;
}

// Form values for user creation/editing
export interface UserFormValues {
  email: string;
  full_name: string;
  role: UserRole;
  active: boolean;
}
