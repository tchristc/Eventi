const EVENTS = [
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

function normalizeRadius(value) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return 50;
  }

  return Math.min(100, Math.max(1, Math.round(parsed)));
}

function parseFilters(query) {
  return {
    locationLat: Number(query.location_lat),
    locationLng: Number(query.location_lng),
    subject: (query.subject || "").trim(),
    category: (query.category || "all").trim(),
    startDate: (query.start_date || "").trim(),
    endDate: (query.end_date || "").trim(),
    radiusMiles: normalizeRadius(query.radius_miles)
  };
}

function filterEvents(filters) {
  return EVENTS.filter(event => {
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

    if (Number.isFinite(filters.locationLat) && Number.isFinite(filters.locationLng)) {
      const distance = milesBetween(
        filters.locationLat,
        filters.locationLng,
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

module.exports = {
  filterEvents,
  parseFilters
};
