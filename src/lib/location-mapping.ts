/**
 * Location Mapping Utility
 * Maps user coordinates to Nigerian states and LGAs
 * Uses approximate geographic boundaries for each state/LGA
 */

import { nigerianLGAData } from './nigerian-lgas';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationMatch {
  state: string;
  lga: string;
  confidence: 'high' | 'medium' | 'low';
  distance: number; // distance in km from known center
}

/**
 * Approximate geographic centers of major Nigerian states (capital/major city)
 * Used as reference points for location matching
 */
const STATE_CENTERS: Record<string, Coordinates> = {
  'Lagos': { latitude: 6.5244, longitude: 3.3792 }, // Lagos city
  'Abia': { latitude: 5.1114, longitude: 7.3721 }, // Umuahia
  'Adamawa': { latitude: 9.2076, longitude: 12.4969 }, // Yola
  'Akwa Ibom': { latitude: 4.9181, longitude: 8.3670 }, // Uyo
  'Bauchi': { latitude: 10.3158, longitude: 9.8058 }, // Bauchi
  'Bayelsa': { latitude: 4.7957, longitude: 6.7632 }, // Yenagoa
  'Benue': { latitude: 7.7400, longitude: 8.6753 }, // Makurdi
  'Borno': { latitude: 11.8592, longitude: 13.1939 }, // Maiduguri
  'Cross River': { latitude: 4.9857, longitude: 8.6753 }, // Calabar
  'Delta': { latitude: 5.7465, longitude: 5.6969 }, // Warri
  'Ebonyi': { latitude: 6.3152, longitude: 8.5711 }, // Abakaliki
  'Edo': { latitude: 6.4969, longitude: 5.6289 }, // Benin City
  'Ekiti': { latitude: 7.6232, longitude: 5.2758 }, // Ado-Ekiti
  'Enugu': { latitude: 6.4373, longitude: 7.5104 }, // Enugu
  'FCT': { latitude: 9.0765, longitude: 7.3986 }, // Abuja
  'Gombe': { latitude: 10.2939, longitude: 11.1670 }, // Gombe
  'Imo': { latitude: 5.4867, longitude: 7.0074 }, // Owerri
  'Jigawa': { latitude: 12.2281, longitude: 9.3063 }, // Dutse
  'Kaduna': { latitude: 10.5054, longitude: 7.4314 }, // Kaduna
  'Kano': { latitude: 12.0022, longitude: 8.6753 }, // Kano
  'Katsina': { latitude: 12.9898, longitude: 7.6007 }, // Katsina
  'Kebbi': { latitude: 12.1927, longitude: 4.2007 }, // Birnin Kebbi
  'Kogi': { latitude: 7.7833, longitude: 6.7333 }, // Lokoja
  'Kwara': { latitude: 8.4955, longitude: 4.5430 }, // Ilorin
  'Nasarawa': { latitude: 8.5511, longitude: 8.5166 }, // Lafia
  'Niger': { latitude: 9.6112, longitude: 6.1578 }, // Minna
  'Ogun': { latitude: 6.6753, longitude: 3.3440 }, // Abeokuta
  'Ondo': { latitude: 7.1964, longitude: 5.1853 }, // Akure
  'Osun': { latitude: 7.6600, longitude: 4.5533 }, // Osogbo
  'Oyo': { latitude: 8.9788, longitude: 3.5623 }, // Ibadan
  'Plateau': { latitude: 9.9265, longitude: 8.8953 }, // Jos
  'Rivers': { latitude: 4.7957, longitude: 7.0676 }, // Port Harcourt
  'Sokoto': { latitude: 13.0097, longitude: 5.2470 }, // Sokoto
  'Taraba': { latitude: 8.8953, longitude: 11.3521 }, // Jalingo
  'Yobe': { latitude: 11.8721, longitude: 11.1471 }, // Damaturu
  'Zamfara': { latitude: 12.1667, longitude: 6.9167 }, // Gusau
};

/**
 * Approximate geographic centers of major LGAs in each state
 * Used for fine-grained location matching
 */
const LGA_CENTERS: Record<string, Record<string, Coordinates>> = {
  'Lagos': {
    'Lagos Island': { latitude: 6.4281, longitude: 3.4219 },
    'Ikoyi': { latitude: 6.4667, longitude: 3.4333 },
    'Victoria Island': { latitude: 6.4281, longitude: 3.4219 },
    'Lekki': { latitude: 6.4533, longitude: 3.5728 },
    'Ikeja': { latitude: 6.5848, longitude: 3.3448 },
    'Surulere': { latitude: 6.5143, longitude: 3.3571 },
    'Yaba': { latitude: 6.5097, longitude: 3.3694 },
    'Agege': { latitude: 6.6248, longitude: 3.3248 },
    'Apapa': { latitude: 6.4081, longitude: 3.3627 },
    'Badagry': { latitude: 6.4325, longitude: 2.8928 },
    'Alimosho': { latitude: 6.5633, longitude: 3.2158 },
    'Amuwo-Odofin': { latitude: 6.4714, longitude: 3.1581 },
    'Ojo': { latitude: 6.5042, longitude: 3.1268 },
    'Ajeromi-Ifelodun': { latitude: 6.4981, longitude: 3.3544 },
    'Mushin': { latitude: 6.5435, longitude: 3.3735 },
    'Oshodi-Isolo': { latitude: 6.5674, longitude: 3.4196 },
    'Ifako-Ijaiye': { latitude: 6.6256, longitude: 3.3667 },
    'Somolu': { latitude: 6.5361, longitude: 3.4145 },
    'Shomolu': { latitude: 6.5381, longitude: 3.4145 },
    'Epe': { latitude: 6.5833, longitude: 3.9833 },
    'Ibeju-Lekki': { latitude: 6.5167, longitude: 3.9667 },
    'Ikorodu': { latitude: 6.5603, longitude: 3.5056 },
    'Lagos Mainland': { latitude: 6.5, longitude: 3.4 },
    'Eti-Osa': { latitude: 6.4600, longitude: 3.5500 },
  },
  'FCT': {
    'Abuja Municipal Area Council': { latitude: 9.0765, longitude: 7.3986 },
    'Bwari': { latitude: 9.1819, longitude: 7.4639 },
    'Gwagwalada': { latitude: 8.9397, longitude: 7.0549 },
    'Kuje': { latitude: 8.8897, longitude: 7.1049 },
    'Kwali': { latitude: 9.3208, longitude: 7.6097 },
    'Municipal Area Council': { latitude: 9.0765, longitude: 7.3986 },
  },
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.latitude * Math.PI) / 180) *
      Math.cos((coord2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Determine if a coordinate is within the approximate bounds of a state
 */
function isCoordinateInStateBounds(
  coordinate: Coordinates,
  stateName: string
): boolean {
  // Define approximate bounding boxes for each state (min/max lat/lon)
  const stateBounds: Record<
    string,
    { minLat: number; maxLat: number; minLon: number; maxLon: number }
  > = {
    'Lagos': { minLat: 6.35, maxLat: 6.7, minLon: 2.8, maxLon: 4.0 },
    'FCT': { minLat: 8.8, maxLat: 9.4, minLon: 7.0, maxLon: 7.7 },
    'Oyo': { minLat: 7.8, maxLat: 9.3, minLon: 2.8, maxLon: 5.0 },
    'Ogun': { minLat: 6.4, maxLat: 7.2, minLon: 2.7, maxLon: 4.2 },
    'Osun': { minLat: 7.0, maxLat: 8.6, minLon: 4.0, maxLon: 5.6 },
    'Ondo': { minLat: 5.7, maxLat: 7.8, minLon: 4.3, maxLon: 5.8 },
    'Ekiti': { minLat: 7.2, maxLat: 8.2, minLon: 4.8, maxLon: 5.8 },
    'Kwara': { minLat: 7.8, maxLat: 9.3, minLon: 3.6, maxLon: 5.6 },
    'Kogi': { minLat: 6.3, maxLat: 8.8, minLon: 5.8, maxLon: 7.8 },
    'Enugu': { minLat: 5.8, maxLat: 7.3, minLon: 7.0, maxLon: 8.8 },
    'Ebonyi': { minLat: 5.6, maxLat: 6.8, minLon: 7.3, maxLon: 8.8 },
    'Abia': { minLat: 4.7, maxLat: 6.0, minLon: 6.8, maxLon: 8.2 },
    'Imo': { minLat: 4.5, maxLat: 6.0, minLon: 6.5, maxLon: 8.0 },
    'Rivers': { minLat: 4.0, maxLat: 5.5, minLon: 6.5, maxLon: 7.5 },
    'Bayelsa': { minLat: 4.3, maxLat: 5.4, minLon: 5.8, maxLon: 6.8 },
    'Delta': { minLat: 4.8, maxLat: 6.8, minLon: 4.8, maxLon: 6.8 },
    'Edo': { minLat: 5.6, maxLat: 7.5, minLon: 4.8, maxLon: 6.8 },
    'Akwa Ibom': { minLat: 3.5, maxLat: 5.3, minLon: 7.3, maxLon: 8.8 },
    'Cross River': { minLat: 1.7, maxLat: 5.8, minLon: 7.8, maxLon: 9.4 },
    'Benue': { minLat: 6.2, maxLat: 8.8, minLon: 7.8, maxLon: 9.3 },
    'Nasarawa': { minLat: 7.8, maxLat: 9.5, minLon: 7.8, maxLon: 9.3 },
    'Plateau': { minLat: 8.2, maxLat: 10.5, minLon: 7.8, maxLon: 9.8 },
    'Kaduna': { minLat: 9.0, maxLat: 11.5, minLon: 6.1, maxLon: 8.3 },
    'Niger': { minLat: 7.8, maxLat: 10.8, minLon: 4.3, maxLon: 7.3 },
    'Kano': { minLat: 11.5, maxLat: 12.5, minLon: 7.5, maxLon: 10.2 },
    'Katsina': { minLat: 12.0, maxLat: 13.8, minLon: 6.3, maxLon: 8.8 },
    'Kebbi': { minLat: 11.3, maxLat: 13.8, minLon: 3.3, maxLon: 6.3 },
    'Zamfara': { minLat: 11.1, maxLat: 13.5, minLon: 4.5, maxLon: 7.5 },
    'Sokoto': { minLat: 12.0, maxLat: 13.8, minLon: 4.2, maxLon: 6.8 },
    'Jigawa': { minLat: 11.3, maxLat: 12.8, minLon: 8.8, maxLon: 10.5 },
    'Bauchi': { minLat: 9.3, maxLat: 12.3, minLon: 8.8, maxLon: 11.3 },
    'Borno': { minLat: 10.5, maxLat: 13.8, minLon: 11.3, maxLon: 13.8 },
    'Yobe': { minLat: 10.7, maxLat: 12.9, minLon: 10.5, maxLon: 12.9 },
    'Adamawa': { minLat: 8.2, maxLat: 10.8, minLon: 11.3, maxLon: 13.8 },
    'Taraba': { minLat: 6.3, maxLat: 9.3, minLon: 10.5, maxLon: 12.5 },
    'Gombe': { minLat: 9.3, maxLat: 11.5, minLon: 10.3, maxLon: 12.3 },
  };

  const bounds = stateBounds[stateName];
  if (!bounds) return false;

  return (
    coordinate.latitude >= bounds.minLat &&
    coordinate.latitude <= bounds.maxLat &&
    coordinate.longitude >= bounds.minLon &&
    coordinate.longitude <= bounds.maxLon
  );
}

/**
 * Determine state and LGA from user coordinates
 * Returns the best match based on distance and geographic bounds
 */
export function determineLocationFromCoordinates(
  coordinate: Coordinates
): LocationMatch | null {
  // First, find all states within bounds
  const statesInBounds = Object.keys(STATE_CENTERS).filter((stateName) =>
    isCoordinateInStateBounds(coordinate, stateName)
  );

  // Calculate distances from coordinate to all state centers
  const distanceMap = Object.entries(STATE_CENTERS).map(([stateName, center]) => ({
    stateName,
    distance: calculateDistance(coordinate, center),
  }));

  // Sort by distance
  distanceMap.sort((a, b) => a.distance - b.distance);

  // Get the closest state
  const closestState = distanceMap[0];
  const stateName = closestState.stateName;
  const stateData = nigerianLGAData[stateName];

  if (!stateData) {
    return null;
  }

  // Now find the closest LGA within this state
  let closestLGA = stateData.lgas[0];
  let closestLGADistance = Infinity;

  // Check if we have specific LGA centers for this state
  const lgaCentersForState = LGA_CENTERS[stateName];

  if (lgaCentersForState) {
    let closestLGADistance = Infinity;

    for (const lga of stateData.lgas) {
      const lgaCenter = lgaCentersForState[lga];
      if (lgaCenter) {
        const distance = calculateDistance(coordinate, lgaCenter);
        if (distance < closestLGADistance) {
          closestLGADistance = distance;
          closestLGA = lga;
        }
      }
    }
  } else {
    // If no LGA centers defined, just use the first LGA
    closestLGA = stateData.lgas[0];
    closestLGADistance = 0;
  }

  // Determine confidence based on distance
  let confidence: 'high' | 'medium' | 'low' = 'low';
  const distance = closestState.distance;

  if (statesInBounds.includes(stateName)) {
    if (distance < 25) {
      confidence = 'high';
    } else if (distance < 50) {
      confidence = 'medium';
    } else {
      confidence = 'low';
    }
  } else if (distance < 15) {
    confidence = 'high';
  } else if (distance < 40) {
    confidence = 'medium';
  }

  return {
    state: stateName,
    lga: closestLGA,
    confidence,
    distance,
  };
}

/**
 * Get a user-friendly message about the confidence of the location match
 */
export function getConfidenceMessage(confidence: string): string {
  switch (confidence) {
    case 'high':
      return 'Very accurate location detection';
    case 'medium':
      return 'Approximate location detected';
    case 'low':
      return 'Location detected (may be approximate)';
    default:
      return 'Location detection result';
  }
}
