export type NavItem = {
  href: string;
  label: string;
  icon: string;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/today", label: "Today", icon: "☀" },
  { href: "/borrowers", label: "Borrowers", icon: "👥" },
  { href: "/money", label: "Money", icon: "₱" },
  { href: "/settings", label: "Settings", icon: "⚙" },
];
