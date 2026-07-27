import type { UsState } from "./usStates";

/** Canadian provinces & territories. Largest cities first, mirrors usStates.ts. */
export const CANADA_PROVINCES: UsState[] = [
  { name: "Ontario", abbr: "ON", cities: ["Toronto", "Ottawa", "Mississauga", "Hamilton", "London"] },
  { name: "Quebec", abbr: "QC", cities: ["Montreal", "Quebec City", "Laval", "Gatineau"] },
  { name: "British Columbia", abbr: "BC", cities: ["Vancouver", "Surrey", "Burnaby", "Victoria"] },
  { name: "Alberta", abbr: "AB", cities: ["Calgary", "Edmonton", "Red Deer", "Lethbridge"] },
  { name: "Manitoba", abbr: "MB", cities: ["Winnipeg", "Brandon"] },
  { name: "Saskatchewan", abbr: "SK", cities: ["Saskatoon", "Regina"] },
  { name: "Nova Scotia", abbr: "NS", cities: ["Halifax", "Sydney"] },
  { name: "New Brunswick", abbr: "NB", cities: ["Moncton", "Saint John", "Fredericton"] },
  { name: "Newfoundland and Labrador", abbr: "NL", cities: ["St. John's"] },
  { name: "Prince Edward Island", abbr: "PE", cities: ["Charlottetown"] },
  { name: "Northwest Territories", abbr: "NT", cities: ["Yellowknife"] },
  { name: "Yukon", abbr: "YT", cities: ["Whitehorse"] },
  { name: "Nunavut", abbr: "NU", cities: ["Iqaluit"] },
];

/** UK nations & official regions (there's no US-style "state" — this is the closest
 *  granularity for rotating city scans), largest cities first. */
export const UK_REGIONS: UsState[] = [
  { name: "London", abbr: "LDN", cities: ["London", "Croydon", "Bromley"] },
  { name: "South East England", abbr: "SE", cities: ["Brighton", "Southampton", "Reading", "Oxford"] },
  { name: "South West England", abbr: "SW", cities: ["Bristol", "Plymouth", "Exeter", "Bournemouth"] },
  { name: "East of England", abbr: "EE", cities: ["Cambridge", "Norwich", "Ipswich", "Luton"] },
  { name: "West Midlands", abbr: "WM", cities: ["Birmingham", "Coventry", "Wolverhampton", "Stoke-on-Trent"] },
  { name: "East Midlands", abbr: "EM", cities: ["Nottingham", "Leicester", "Derby", "Northampton"] },
  { name: "Yorkshire and the Humber", abbr: "YH", cities: ["Leeds", "Sheffield", "Bradford", "Hull"] },
  { name: "North West England", abbr: "NW", cities: ["Manchester", "Liverpool", "Preston", "Blackpool"] },
  { name: "North East England", abbr: "NE", cities: ["Newcastle upon Tyne", "Sunderland", "Middlesbrough"] },
  { name: "Scotland", abbr: "SCT", cities: ["Glasgow", "Edinburgh", "Aberdeen", "Dundee"] },
  { name: "Wales", abbr: "WAL", cities: ["Cardiff", "Swansea", "Newport"] },
  { name: "Northern Ireland", abbr: "NI", cities: ["Belfast", "Derry"] },
];

/** Australian states & territories. Largest cities first. */
export const AUSTRALIA_STATES: UsState[] = [
  { name: "New South Wales", abbr: "NSW", cities: ["Sydney", "Newcastle", "Wollongong"] },
  { name: "Victoria", abbr: "VIC", cities: ["Melbourne", "Geelong", "Ballarat"] },
  { name: "Queensland", abbr: "QLD", cities: ["Brisbane", "Gold Coast", "Townsville", "Cairns"] },
  { name: "Western Australia", abbr: "WA", cities: ["Perth", "Fremantle", "Bunbury"] },
  { name: "South Australia", abbr: "SA", cities: ["Adelaide", "Mount Gambier"] },
  { name: "Tasmania", abbr: "TAS", cities: ["Hobart", "Launceston"] },
  { name: "Australian Capital Territory", abbr: "ACT", cities: ["Canberra"] },
  { name: "Northern Territory", abbr: "NT", cities: ["Darwin", "Alice Springs"] },
];
