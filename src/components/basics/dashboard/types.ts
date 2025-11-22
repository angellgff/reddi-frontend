import { ReactNode } from "react";

export type NavLink = {
  name: string;
  href: string;
  icon?: string;
  subLinks?: Omit<NavLink, "subLinks">[];
};
