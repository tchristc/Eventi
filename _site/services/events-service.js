const MOCK_EVENTS = [
  {
    id: "evt-1",
    title: "Riverfront Farmers Market",
    description: "Fresh produce, local vendors, and family-friendly activities.",
    category: "community",
    startDate: "2026-06-13",
    endDate: "2026-06-13",
    venue: "Riverside Park",
    city: "Seattle",
    state: "WA",
    latitude: 47.6062,
    longitude: -122.3321
  },
  {
    id: "evt-2",
    title: "Indie Film Night",
    description: "Independent short films and Q&A with filmmakers.",
    category: "arts",
    startDate: "2026-06-19",
    endDate: "2026-06-19",
    venue: "Broadway Arts Hall",
    city: "Seattle",
    state: "WA",
    latitude: 47.615,
    longitude: -122.3205
  },
  {
    id: "evt-3",
    title: "Community Tech Meetup",
    description: "Monthly meetup for developers, designers, and founders.",
    category: "technology",
    startDate: "2026-06-23",
    endDate: "2026-06-23",
    venue: "Downtown Library",
    city: "Seattle",
    state: "WA",
    latitude: 47.6067,
    longitude: -122.3325
  },
  {
    id: "evt-4",
    title: "Sunset Live Music",
    description: "Outdoor live music from local bands by the waterfront.",
    category: "music",
    startDate: "2026-06-25",
    endDate: "2026-06-25",
    venue: "Harbor Stage",
    city: "San Francisco",
    state: "CA",
    latitude: 37.7749,
    longitude: -122.4194
  },
  {
    id: "evt-5",
    title: "Neighborhood Food Festival",
    description: "Taste dishes from local chefs and food trucks.",
    category: "food",
    startDate: "2026-06-28",
    endDate: "2026-06-29",
    venue: "Mission Plaza",
    city: "San Francisco",
    state: "CA",
    latitude: 37.7599,
    longitude: -122.4148
  },
  {
    id: "evt-6",
    title: "Early Morning Yoga in the Park",
    description: "All-level yoga class in a public green space.",
    category: "wellness",
    startDate: "2026-07-02",
    endDate: "2026-07-02",
    venue: "City Green",
    city: "Portland",
    state: "OR",
    latitude: 45.5152,
    longitude: -122.6784
  }
];

const API_PATH = "/api/v1/events";
const CONFIGURED_EVENT_APIS = ["eventbrite", "meetup", "community-feeds", "user-submissions"];

function shouldUseRemoteApi() {
  if (typeof window === "undefined") {
    return false;
  }

  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return true;
  }

  // Opt-in switch for environments where a real API route exists.
  return window.localStorage?.getItem("events.remoteApiEnabled") === "true";
}

function milesBetween(lat1, lng1, lat2, lng2) {
  const toRadians = value => (value * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMiles * c;
}

function overlapsDateRange(eventStart, eventEnd, filterStart, filterEnd) {
  if (!filterStart && !filterEnd) {
    return true;
  }

  const eventStartDate = new Date(eventStart);
  const eventEndDate = new Date(eventEnd || eventStart);
  const filterStartDate = filterStart ? new Date(filterStart) : null;
  const filterEndDate = filterEnd ? new Date(filterEnd) : null;

  if (filterStartDate && eventEndDate < filterStartDate) {
    return false;
  }

  if (filterEndDate && eventStartDate > filterEndDate) {
    return false;
  }

  return true;
}

function mockFilterEvents(filters) {
  return MOCK_EVENTS.filter(event => {
    if (filters.subject) {
      const query = filters.subject.toLowerCase();
      const haystack = `${event.title} ${event.description}`.toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }

    if (filters.category && filters.category !== "all") {
      if (event.category !== filters.category) {
        return false;
      }
    }

    if (!overlapsDateRange(event.startDate, event.endDate, filters.startDate, filters.endDate)) {
      return false;
    }

    if (filters.location && Number.isFinite(filters.location.latitude) && Number.isFinite(filters.location.longitude)) {
      const distance = milesBetween(
        filters.location.latitude,
        filters.location.longitude,
        event.latitude,
        event.longitude
      );

      if (distance > filters.radiusMiles) {
        return false;
      }
    }

    return true;
  });
}

function toQueryString(filters) {
  const params = new URLSearchParams();

  if (filters.location) {
    params.set("location_lat", String(filters.location.latitude));
    params.set("location_lng", String(filters.location.longitude));
  }

  if (filters.subject) {
    params.set("subject", filters.subject);
  }

  if (filters.category && filters.category !== "all") {
    params.set("category", filters.category);
  }

  if (filters.startDate) {
    params.set("start_date", filters.startDate);
  }

  if (filters.endDate) {
    params.set("end_date", filters.endDate);
  }

  params.set("radius_miles", String(filters.radiusMiles));
  params.set("api_sources", CONFIGURED_EVENT_APIS.join(","));
  return params.toString();
}

export async function fetchEvents(filters) {
  if (!shouldUseRemoteApi()) {
    return mockFilterEvents(filters);
  }

  const query = toQueryString(filters);
  const endpoint = `${API_PATH}?${query}`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Event API error: ${response.status}`);
    }

    const payload = await response.json();

    if (!payload?.success || !Array.isArray(payload?.data?.events)) {
      throw new Error("Event API returned an invalid payload");
    }

    return payload.data.events;
  } catch (_error) {
    return mockFilterEvents(filters);
  }
}

export function normalizeRadius(value) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return 50;
  }

  return Math.min(100, Math.max(1, Math.round(parsed)));
}

export function validateDateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    return { valid: true };
  }

  if (new Date(startDate) > new Date(endDate)) {
    return { valid: false, message: "Start date must be before or equal to end date." };
  }

  return { valid: true };
}
