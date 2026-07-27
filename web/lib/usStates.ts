export interface UsState {
  name: string;
  abbr: string;
  /** Largest cities first — Radar rotates through these, biggest first. */
  cities: string[];
}

export const US_STATES: UsState[] = [
  { name: "Alabama", abbr: "AL", cities: ["Huntsville", "Birmingham", "Montgomery", "Mobile", "Tuscaloosa", "Hoover", "Dothan", "Auburn"] },
  { name: "Alaska", abbr: "AK", cities: ["Anchorage", "Fairbanks", "Juneau", "Wasilla", "Sitka", "Ketchikan"] },
  { name: "Arizona", abbr: "AZ", cities: ["Phoenix", "Tucson", "Mesa", "Chandler", "Scottsdale", "Gilbert", "Glendale", "Tempe"] },
  { name: "Arkansas", abbr: "AR", cities: ["Little Rock", "Fort Smith", "Fayetteville", "Springdale", "Jonesboro", "Rogers"] },
  { name: "California", abbr: "CA", cities: ["Los Angeles", "San Diego", "San Jose", "San Francisco", "Fresno", "Sacramento", "Long Beach", "Oakland"] },
  { name: "Colorado", abbr: "CO", cities: ["Denver", "Colorado Springs", "Aurora", "Fort Collins", "Lakewood", "Boulder"] },
  { name: "Connecticut", abbr: "CT", cities: ["Bridgeport", "New Haven", "Hartford", "Stamford", "Waterbury", "Norwalk"] },
  { name: "Delaware", abbr: "DE", cities: ["Wilmington", "Dover", "Newark", "Middletown", "Bear"] },
  { name: "District of Columbia", abbr: "DC", cities: ["Washington"] },
  { name: "Florida", abbr: "FL", cities: ["Jacksonville", "Miami", "Tampa", "Orlando", "St. Petersburg", "Deerfield Beach", "Fort Lauderdale", "Hialeah"] },
  { name: "Georgia", abbr: "GA", cities: ["Atlanta", "Augusta", "Columbus", "Savannah", "Athens", "Sandy Springs"] },
  { name: "Hawaii", abbr: "HI", cities: ["Honolulu", "Hilo", "Kailua", "Kapolei", "Kaneohe"] },
  { name: "Idaho", abbr: "ID", cities: ["Boise", "Meridian", "Nampa", "Idaho Falls", "Pocatello", "Coeur d'Alene"] },
  { name: "Illinois", abbr: "IL", cities: ["Chicago", "Aurora", "Naperville", "Joliet", "Rockford", "Springfield"] },
  { name: "Indiana", abbr: "IN", cities: ["Indianapolis", "Fort Wayne", "Evansville", "South Bend", "Carmel", "Bloomington"] },
  { name: "Iowa", abbr: "IA", cities: ["Des Moines", "Cedar Rapids", "Davenport", "Sioux City", "Iowa City", "Ames"] },
  { name: "Kansas", abbr: "KS", cities: ["Wichita", "Overland Park", "Kansas City", "Topeka", "Olathe", "Lawrence"] },
  { name: "Kentucky", abbr: "KY", cities: ["Louisville", "Lexington", "Bowling Green", "Owensboro", "Covington"] },
  { name: "Louisiana", abbr: "LA", cities: ["New Orleans", "Baton Rouge", "Shreveport", "Lafayette", "Lake Charles"] },
  { name: "Maine", abbr: "ME", cities: ["Portland", "Lewiston", "Bangor", "South Portland", "Auburn"] },
  { name: "Maryland", abbr: "MD", cities: ["Baltimore", "Columbia", "Germantown", "Silver Spring", "Frederick", "Rockville"] },
  { name: "Massachusetts", abbr: "MA", cities: ["Boston", "Worcester", "Springfield", "Cambridge", "Lowell", "Brockton"] },
  { name: "Michigan", abbr: "MI", cities: ["Detroit", "Grand Rapids", "Warren", "Sterling Heights", "Ann Arbor", "Lansing"] },
  { name: "Minnesota", abbr: "MN", cities: ["Minneapolis", "St. Paul", "Rochester", "Duluth", "Bloomington", "Plymouth"] },
  { name: "Mississippi", abbr: "MS", cities: ["Jackson", "Gulfport", "Southaven", "Hattiesburg", "Biloxi"] },
  { name: "Missouri", abbr: "MO", cities: ["Kansas City", "St. Louis", "Springfield", "Columbia", "Independence"] },
  { name: "Montana", abbr: "MT", cities: ["Billings", "Missoula", "Great Falls", "Bozeman", "Helena"] },
  { name: "Nebraska", abbr: "NE", cities: ["Omaha", "Lincoln", "Bellevue", "Grand Island", "Kearney"] },
  { name: "Nevada", abbr: "NV", cities: ["Las Vegas", "Henderson", "Reno", "North Las Vegas", "Sparks"] },
  { name: "New Hampshire", abbr: "NH", cities: ["Manchester", "Nashua", "Concord", "Dover", "Rochester"] },
  { name: "New Jersey", abbr: "NJ", cities: ["Newark", "Jersey City", "Paterson", "Elizabeth", "Trenton", "Edison"] },
  { name: "New Mexico", abbr: "NM", cities: ["Albuquerque", "Las Cruces", "Rio Rancho", "Santa Fe", "Roswell"] },
  { name: "New York", abbr: "NY", cities: ["New York City", "Buffalo", "Rochester", "Yonkers", "Syracuse", "Albany"] },
  { name: "North Carolina", abbr: "NC", cities: ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem", "Asheville"] },
  { name: "North Dakota", abbr: "ND", cities: ["Fargo", "Bismarck", "Grand Forks", "Minot", "West Fargo"] },
  { name: "Ohio", abbr: "OH", cities: ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron", "Dayton"] },
  { name: "Oklahoma", abbr: "OK", cities: ["Oklahoma City", "Tulsa", "Norman", "Broken Arrow", "Edmond"] },
  { name: "Oregon", abbr: "OR", cities: ["Portland", "Eugene", "Salem", "Gresham", "Hillsboro", "Bend"] },
  { name: "Pennsylvania", abbr: "PA", cities: ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading", "Scranton"] },
  { name: "Rhode Island", abbr: "RI", cities: ["Providence", "Cranston", "Warwick", "Pawtucket", "Woonsocket"] },
  { name: "South Carolina", abbr: "SC", cities: ["Charleston", "Columbia", "North Charleston", "Greenville", "Myrtle Beach"] },
  { name: "South Dakota", abbr: "SD", cities: ["Sioux Falls", "Rapid City", "Aberdeen", "Brookings", "Watertown"] },
  { name: "Tennessee", abbr: "TN", cities: ["Nashville", "Memphis", "Knoxville", "Chattanooga", "Clarksville", "Murfreesboro"] },
  { name: "Texas", abbr: "TX", cities: ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth", "El Paso", "Rowlett"] },
  { name: "Utah", abbr: "UT", cities: ["Salt Lake City", "West Valley City", "Provo", "West Jordan", "Orem", "St. George"] },
  { name: "Vermont", abbr: "VT", cities: ["Burlington", "South Burlington", "Rutland", "Essex", "Montpelier"] },
  { name: "Virginia", abbr: "VA", cities: ["Virginia Beach", "Norfolk", "Chesapeake", "Richmond", "Arlington", "Alexandria"] },
  { name: "Washington", abbr: "WA", cities: ["Seattle", "Spokane", "Tacoma", "Vancouver", "Bellevue", "Everett"] },
  { name: "West Virginia", abbr: "WV", cities: ["Charleston", "Huntington", "Morgantown", "Parkersburg", "Wheeling"] },
  { name: "Wisconsin", abbr: "WI", cities: ["Milwaukee", "Madison", "Green Bay", "Kenosha", "Racine", "Appleton"] },
  { name: "Wyoming", abbr: "WY", cities: ["Cheyenne", "Casper", "Laramie", "Gillette", "Rock Springs"] },
];

export function stateByName(name: string): UsState | undefined {
  return US_STATES.find((s) => s.name === name);
}

/** Rotates through a state's cities biggest-first, wrapping around. */
export function cityForRadar(stateName: string, index: number): string {
  const state = stateByName(stateName);
  if (!state || state.cities.length === 0) return stateName;
  return state.cities[index % state.cities.length];
}
