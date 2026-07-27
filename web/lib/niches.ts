import type { LucideIcon } from "lucide-react";
import {
  Wrench,
  Zap,
  Wind,
  Home,
  Leaf,
  Bug,
  Sparkles,
  PaintRoller,
  Layers,
  KeyRound,
  Box,
  AppWindow,
  Hammer,
  HardHat,
  Waves,
  Scale,
  PiggyBank,
  Shield,
  Building2,
  TrendingUp,
  Store,
  Utensils,
  Shirt,
  GraduationCap,
  Stethoscope,
  Truck,
  Calculator,
  Gem,
  Scissors,
  Cake,
  Moon,
  BedDouble,
  PartyPopper,
  Milk,
  Plane,
} from "lucide-react";

export interface Niche {
  label: string;
  value: string;
  icon: LucideIcon;
  bg: string;
  fg: string;
}

export interface NicheCategory {
  title: string;
  niches: Niche[];
}

/** Pastel bubble background colors, cycled per-niche within a category. */
const PALETTE = [
  { bg: "#e0edff", fg: "#2563eb" }, // blue
  { bg: "#fef3c7", fg: "#b45309" }, // amber
  { bg: "#e0f2fe", fg: "#0284c7" }, // sky
  { bg: "#fde2e2", fg: "#dc2626" }, // red
  { bg: "#dcfce7", fg: "#16a34a" }, // green
  { bg: "#fee2e2", fg: "#ea580c" }, // orange
  { bg: "#fce7f3", fg: "#db2777" }, // pink
  { bg: "#ede9fe", fg: "#7c3aed" }, // purple
  { bg: "#ccfbf1", fg: "#0d9488" }, // teal
  { bg: "#fef9c3", fg: "#ca8a04" }, // yellow
];

function withColors(icons: Omit<Niche, "bg" | "fg">[]): Niche[] {
  return icons.map((niche, i) => ({
    ...niche,
    bg: PALETTE[i % PALETTE.length].bg,
    fg: PALETTE[i % PALETTE.length].fg,
  }));
}

/**
 * Grouped by what the business does, never by country — a niche that reads
 * as regionally specific (e.g. Kirana Store, Tiffin Service) still sits
 * alongside its closest universal equivalents rather than in a country-named
 * bucket, since every one of these trades in markets worldwide.
 */
export const NICHE_CATEGORIES: NicheCategory[] = [
  {
    title: "Home Services",
    niches: withColors([
      { label: "Plumbing", value: "plumber", icon: Wrench },
      { label: "Electrician", value: "electrician", icon: Zap },
      { label: "HVAC", value: "hvac contractor", icon: Wind },
      { label: "Roofing", value: "roofing contractor", icon: Home },
      { label: "Landscaping", value: "landscaping company", icon: Leaf },
      { label: "Pest control", value: "pest control", icon: Bug },
      { label: "Cleaning", value: "cleaning service", icon: Sparkles },
      { label: "Painting", value: "painting contractor", icon: PaintRoller },
      { label: "Flooring", value: "flooring company", icon: Layers },
      { label: "Locksmith", value: "locksmith", icon: KeyRound },
      { label: "Moving", value: "moving company", icon: Box },
      { label: "Packers & Movers", value: "packers and movers", icon: Truck },
      { label: "Windows", value: "window company", icon: AppWindow },
      { label: "Handyman", value: "handyman", icon: Hammer },
      { label: "Construction", value: "construction company", icon: HardHat },
      { label: "Pool service", value: "pool service", icon: Waves },
    ]),
  },
  {
    title: "Professional Services",
    niches: withColors([
      { label: "Legal", value: "law firm", icon: Scale },
      { label: "Accounting", value: "accounting firm", icon: PiggyBank },
      { label: "CA Firm", value: "chartered accountant", icon: Calculator },
      { label: "Insurance", value: "insurance agency", icon: Shield },
      { label: "Real estate", value: "real estate agency", icon: Building2 },
      { label: "Finance", value: "financial advisor", icon: TrendingUp },
    ]),
  },
  {
    title: "Retail",
    niches: withColors([
      { label: "Grocery / Kirana Store", value: "kirana store", icon: Store },
      { label: "Jewellery Shop", value: "jewellery shop", icon: Gem },
      { label: "Boutique & Apparel", value: "saree boutique", icon: Shirt },
    ]),
  },
  {
    title: "Food & Beverage",
    niches: withColors([
      { label: "Meal / Tiffin Service", value: "tiffin service", icon: Utensils },
      { label: "Bakery & Sweet Shop", value: "sweet shop", icon: Cake },
      { label: "Dairy Booth", value: "dairy milk booth", icon: Milk },
    ]),
  },
  {
    title: "Health & Beauty",
    niches: withColors([
      { label: "Alternative Medicine Clinic", value: "ayurvedic clinic", icon: Stethoscope },
      { label: "Salon & Spa", value: "salon and spa", icon: Scissors },
    ]),
  },
  {
    title: "Events & Hospitality",
    niches: withColors([
      { label: "Wedding Planner", value: "wedding planner", icon: PartyPopper },
      { label: "Travel Agency", value: "travel agency", icon: Plane },
      { label: "PG & Hostel", value: "pg hostel", icon: BedDouble },
    ]),
  },
  {
    title: "Personal Services",
    niches: withColors([
      { label: "Tuition Center", value: "tuition center", icon: GraduationCap },
      { label: "Astrologer", value: "astrologer", icon: Moon },
    ]),
  },
];

export const EXAMPLE_CITIES = [
  "Boise, ID",
  "Deerfield Beach, FL",
  "Tampa, FL",
  "Meridian, ID",
  "Austin, TX",
  "Scottsdale, AZ",
  "Charlotte, NC",
  "Boulder, CO",
];
