const ACTIVE_LOCATION_KEY = "events.activeLocation";
const RECENT_LOCATIONS_KEY = "events.recentLocations";
const MAX_RECENT_LOCATIONS = 5;
const US_GEOCODE_SEARCH_URL = "https://nominatim.openstreetmap.org/search";

const LOCATION_INDEX = [
  { label: "Seattle, WA", city: "Seattle", state: "WA", zipCodes: ["98101", "98102", "98104"], latitude: 47.6062, longitude: -122.3321 },
  { label: "San Francisco, CA", city: "San Francisco", state: "CA", zipCodes: ["94102", "94103", "94110"], latitude: 37.7749, longitude: -122.4194 },
  { label: "Portland, OR", city: "Portland", state: "OR", zipCodes: ["97201", "97205", "97209"], latitude: 45.5152, longitude: -122.6784 },
  { label: "Austin, TX", city: "Austin", state: "TX", zipCodes: ["73301", "78701", "78704"], latitude: 30.2672, longitude: -97.7431 },
  { label: "Chicago, IL", city: "Chicago", state: "IL", zipCodes: ["60601", "60607", "60614"], latitude: 41.8781, longitude: -87.6298 },
  { label: "New York, NY", city: "New York", state: "NY", zipCodes: ["10001", "10003", "10011"], latitude: 40.7128, longitude: -74.006 },
  { label: "Los Angeles, CA", city: "Los Angeles", state: "CA", zipCodes: ["90001", "90012", "90017"], latitude: 34.0522, longitude: -118.2437 },
  { label: "Denver, CO", city: "Denver", state: "CO", zipCodes: ["80202", "80203", "80205"], latitude: 39.7392, longitude: -104.9903 }
];

function safeParse(json, fallback) {
  try {
    const value = JSON.parse(json);
    return value ?? fallback;
  } catch (_error) {
    return fallback;
  }
}

function safeStorageGet(key, fallback) {
  if (typeof window === "undefined" || !window.localStorage) {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  return safeParse(raw, fallback);
}

function safeStorageSet(key, value) {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function sameCoordinates(a, b) {
  return a && b && a.latitude === b.latitude && a.longitude === b.longitude;
}

function computeMatchScore(location, query) {
  if (!query) {
    return 1;
  }

  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return 1;
  }

  const isZipQuery = /^\d+$/.test(normalized);
  const city = (location.city || "").toLowerCase();
  const state = (location.state || "").toLowerCase();
  const label = location.label.toLowerCase();

  let score = 0;

  if (isZipQuery) {
    const exactZip = location.zipCodes.find(zip => zip === normalized);
    const startsWithZip = location.zipCodes.find(zip => zip.startsWith(normalized));
    if (exactZip) {
      score += 300;
    } else if (startsWithZip) {
      score += 200;
    }
  }

  if (city === normalized) {
    score += 250;
  } else if (city.startsWith(normalized)) {
    score += 160;
  } else if (city.includes(normalized)) {
    score += 90;
  }

  if (state === normalized) {
    score += 80;
  }

  if (label.includes(normalized)) {
    score += 30;
  }

  return score;
}

export function searchLocations(query, limit = 8) {
  return LOCATION_INDEX
    .map(location => ({ location, score: computeMatchScore(location, query) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.location.label.localeCompare(b.location.label))
    .slice(0, limit)
    .map(item => item.location);
}

function toLabel(parts) {
  const city = parts.city || parts.town || parts.village || parts.hamlet || parts.county || "";
  const state = parts.state || "";

  if (city && state) {
    return `${city}, ${state}`;
  }

  return city || state || "Unknown location";
}

function normalizeGeocodeResult(result) {
  const latitude = Number(result.lat);
  const longitude = Number(result.lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  const address = result.address || {};
  const label = toLabel(address);
  const postal = address.postcode ? String(address.postcode) : "";

  return {
    label,
    city: address.city || address.town || address.village || address.hamlet || address.county || "",
    state: address.state || "",
    zipCodes: postal ? [postal] : [],
    latitude,
    longitude
  };
}

export async function searchAllUsLocations(query, limit = 8) {
  const normalizedQuery = (query || "").trim();

  if (!normalizedQuery) {
    return searchLocations("", limit);
  }

  const params = new URLSearchParams({
    format: "jsonv2",
    addressdetails: "1",
    countrycodes: "us",
    limit: String(limit),
    q: normalizedQuery
  });

  try {
    const response = await fetch(`${US_GEOCODE_SEARCH_URL}?${params.toString()}`, {
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Geocode API error: ${response.status}`);
    }

    const payload = await response.json();
    if (!Array.isArray(payload)) {
      throw new Error("Unexpected geocode API payload");
    }

    const normalized = payload
      .map(normalizeGeocodeResult)
      .filter(Boolean)
      .filter((location, index, items) =>
        index === items.findIndex(other => other.latitude === location.latitude && other.longitude === location.longitude)
      );

    if (normalized.length) {
      return normalized;
    }

    return searchLocations(normalizedQuery, limit);
  } catch (_error) {
    return searchLocations(normalizedQuery, limit);
  }
}

export function getActiveLocation() {
  return safeStorageGet(ACTIVE_LOCATION_KEY, LOCATION_INDEX[0]);
}

export function setActiveLocation(location) {
  safeStorageSet(ACTIVE_LOCATION_KEY, location);
  addRecentLocation(location);
}

export function getRecentLocations() {
  return safeStorageGet(RECENT_LOCATIONS_KEY, []);
}

export function addRecentLocation(location) {
  const existing = getRecentLocations().filter(item => !sameCoordinates(item, location));
  const next = [location, ...existing].slice(0, MAX_RECENT_LOCATIONS);
  safeStorageSet(RECENT_LOCATIONS_KEY, next);
}

export function removeRecentLocation(location) {
  const next = getRecentLocations().filter(item => !sameCoordinates(item, location));
  safeStorageSet(RECENT_LOCATIONS_KEY, next);
}

export function formatLocationKey(location) {
  return `${location.latitude},${location.longitude}`;
}

export function parseLocationKey(value) {
  const [lat, lng] = value.split(",");
  const latitude = Number(lat);
  const longitude = Number(lng);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  const inSuggestions = LOCATION_INDEX.find(item =>
    item.latitude === latitude && item.longitude === longitude
  );

  if (inSuggestions) {
    return inSuggestions;
  }

  const recent = getRecentLocations().find(item =>
    item.latitude === latitude && item.longitude === longitude
  );

  return recent || null;
}

export function formatLocationOptionLabel(location) {
  const zip = location.zipCodes && location.zipCodes.length ? ` (${location.zipCodes[0]})` : "";
  return `${location.label}${zip}`;
}
