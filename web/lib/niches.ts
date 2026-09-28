import type { LucideIcon } from "lucide-react";
import {
  Home,
  Wind,
  Sun,
  BatteryCharging,
  Warehouse,
  Fence,
  Layers,
  Construction,
  PaintRoller,
  Blinds as BlindsIcon,
  PanelsTopLeft,
  Tent,
  ShieldCheck,
  Hammer,
  Bath,
  Bug,
  Leaf,
  Waves,
  Sparkles,
  SprayCan,
  CloudRain,
  Dumbbell,
  HardHat,
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

export const NICHE_CATEGORIES: NicheCategory[] = [
  {
    title: "Home Improvement & Trades",
    niches: withColors([
      { label: "Roofing", value: "roofing contractor", icon: Home },
      { label: "HVAC", value: "hvac contractor", icon: Wind },
      { label: "Solar", value: "solar panel installer", icon: Sun },
      { label: "Batteries", value: "solar battery installer", icon: BatteryCharging },
      { label: "Garage doors", value: "garage door company", icon: Warehouse },
      { label: "Gates", value: "gate installation company", icon: Fence },
      { label: "Epoxy flooring", value: "epoxy flooring contractor", icon: Layers },
      {
        label: "Concrete resurfacing",
        value: "concrete resurfacing contractor",
        icon: Construction,
      },
      { label: "Painting", value: "painting contractor", icon: PaintRoller },
      { label: "Blinds", value: "blinds supplier", icon: BlindsIcon },
      { label: "Shutters", value: "shutters supplier", icon: PanelsTopLeft },
      { label: "Awnings", value: "awning company", icon: Tent },
      { label: "Security screens", value: "security screen installer", icon: ShieldCheck },
      { label: "Kitchen renovation", value: "kitchen renovation company", icon: Hammer },
      { label: "Bathroom renovation", value: "bathroom renovation company", icon: Bath },
      { label: "Pest control", value: "pest control", icon: Bug },
      { label: "Lawn care", value: "lawn care service", icon: Leaf },
      { label: "Pool maintenance", value: "pool maintenance service", icon: Waves },
      { label: "Cleaning", value: "cleaning service", icon: Sparkles },
      { label: "Window cleaning", value: "window cleaning service", icon: SprayCan },
      { label: "Gutter services", value: "gutter cleaning service", icon: CloudRain },
    ]),
  },
  {
    title: "Renovation & Lifestyle",
    niches: withColors([
      {
        label: "Fitness, wellness & leisure",
        value: "fitness and wellness center",
        icon: Dumbbell,
      },
      { label: "Pool installation", value: "pool builder", icon: Waves },
      { label: "House renovation", value: "home renovation company", icon: HardHat },
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
