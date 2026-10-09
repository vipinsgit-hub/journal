export interface Profile {
  id: string;
  display_name: string | null;
  preferred_currency: string;
  timezone: string;
  forex_pairs?: string[];
  strategies?: string[];
  created_at: string;
  updated_at: string;
}
