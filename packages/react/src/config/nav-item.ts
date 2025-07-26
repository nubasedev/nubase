// Navigation item interface
export interface NavItem {
  id: string;
  label: string;
  children?: NavItem[];
  // For leaf items - either use router link or onClick handler
  href?: string;
  onClick?: () => void;
  // Optional properties
  disabled?: boolean;
  badge?: string | number;
}
