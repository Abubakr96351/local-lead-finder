import { US_STATES, type UsState } from "./usStates";
import { INDIA_STATES } from "./indiaStates";
import { CANADA_PROVINCES, UK_REGIONS, AUSTRALIA_STATES } from "./intlStates";

export const REGIONS = ["United States", "Canada", "United Kingdom", "Australia", "India"];

export const COUNTRY_CODES: Record<string, string> = {
  "United States": "US",
  Canada: "CA",
  "United Kingdom": "UK",
  Australia: "AU",
  India: "IN",
};

const STATES_BY_REGION: Record<string, UsState[]> = {
  "United States": US_STATES,
  Canada: CANADA_PROVINCES,
  "United Kingdom": UK_REGIONS,
  Australia: AUSTRALIA_STATES,
  India: INDIA_STATES,
};

export function statesForRegion(region: string): UsState[] {
  return STATES_BY_REGION[region] ?? US_STATES;
}

export function stateByName(region: string, name: string): UsState | undefined {
  return statesForRegion(region).find((s) => s.name === name);
}

/** Rotates through a region's state's cities biggest-first, wrapping around. */
export function cityForRadar(region: string, stateName: string, index: number): string {
  const state = stateByName(region, stateName);
  if (!state || state.cities.length === 0) return stateName;
  return state.cities[index % state.cities.length];
}
