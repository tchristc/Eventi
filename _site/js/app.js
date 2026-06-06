import { fetchEvents, normalizeRadius, validateDateRange } from "../services/events-service.js";
import {
  formatLocationOptionLabel,
  formatLocationKey,
  getActiveLocation,
  getRecentLocations,
  removeRecentLocation,
  searchAllUsLocations,
  setActiveLocation
} from "../services/location-service.js";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("/sw.js");
    } catch (error) {
      console.error("Service worker registration failed", error);
    }
  });
}

const state = {
  activeLocation: getActiveLocation(),
  recentLocations: getRecentLocations(),
  locationSuggestions: [],
  hasFilterInput: false,
  hasSearched: false,
  locationSearchVersion: 0
};

const filterForm = document.querySelector("#event-filter-form");
const locationInput = document.querySelector("#location-input");
const locationSuggestionsList = document.querySelector("#location-suggestions");
const subjectInput = document.querySelector("#subject-input");
const categorySelect = document.querySelector("#category-select");
const startDateInput = document.querySelector("#start-date-input");
const endDateInput = document.querySelector("#end-date-input");
const radiusInput = document.querySelector("#radius-input");
const searchButton = document.querySelector("#search-button");
const filterError = document.querySelector("#filter-error");
const recentLocationsList = document.querySelector("#recent-locations");
const resultsContainer = document.querySelector("#events-results");
const resultsMeta = document.querySelector("#results-meta");
const eventCardTemplate = document.querySelector("#event-card-template");

function debounce(callback, delayMs) {
  let timeoutId;

  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => callback(...args), delayMs);
  };
}

function formatDateLabel(dateValue) {
  const date = new Date(dateValue);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(date);
}

function buildFilters() {
  const radiusMiles = normalizeRadius(radiusInput.value);
  radiusInput.value = String(radiusMiles);

  return {
    location: state.activeLocation,
    subject: subjectInput.value.trim(),
    category: categorySelect.value,
    startDate: startDateInput.value || "",
    endDate: endDateInput.value || "",
    radiusMiles
  };
}

function renderEvents(events) {
  resultsContainer.innerHTML = "";

  if (!events.length) {
    resultsContainer.innerHTML = "<p class=\"small text-body-secondary\">No events found for the current filters.</p>";
    return;
  }

  const fragment = document.createDocumentFragment();

  events.forEach(event => {
    const clone = eventCardTemplate.content.cloneNode(true);
    clone.querySelector("[data-event-date]").textContent = formatDateLabel(event.startDate);
    clone.querySelector("[data-event-title]").textContent = event.title;
    clone.querySelector("[data-event-venue]").textContent = `${event.venue} - ${event.city}, ${event.state}`;
    clone.querySelector("[data-event-summary]").textContent = event.description;
    fragment.append(clone);
  });

  resultsContainer.append(fragment);
}

function renderRecentLocations() {
  recentLocationsList.innerHTML = "";

  if (!state.recentLocations.length) {
    recentLocationsList.innerHTML = "<li class=\"small text-body-secondary\">No recent locations yet.</li>";
    return;
  }

  const fragment = document.createDocumentFragment();

  state.recentLocations.forEach(location => {
    const item = document.createElement("li");
    item.className = "recent-item";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-sm btn-outline-success";
    button.textContent = location.label;
    button.addEventListener("click", () => {
      applyLocationSelection(location);
    });

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "btn btn-sm btn-link text-danger";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => {
      removeRecentLocation(location);
      state.recentLocations = getRecentLocations();
      renderRecentLocations();
    });

    item.append(button, removeButton);
    fragment.append(item);
  });

  recentLocationsList.append(fragment);
}

function hideLocationSuggestions() {
  locationSuggestionsList.innerHTML = "";
  locationSuggestionsList.classList.remove("is-open");
  locationInput.setAttribute("aria-expanded", "false");
}

function applyLocationSelection(location) {
  state.activeLocation = location;
  setActiveLocation(location);
  state.recentLocations = getRecentLocations();
  state.hasFilterInput = true;
  locationInput.value = location.label;
  hideLocationSuggestions();
  renderRecentLocations();

  if (state.hasSearched) {
    updateEvents();
  }
}

function renderLocationSuggestions() {
  locationSuggestionsList.innerHTML = "";

  if (!state.locationSuggestions.length) {
    hideLocationSuggestions();
    return;
  }

  const fragment = document.createDocumentFragment();

  state.locationSuggestions.forEach(location => {
    const item = document.createElement("li");
    item.className = "location-suggestion-item";
    item.setAttribute("role", "option");
    item.dataset.locationKey = formatLocationKey(location);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "location-suggestion-btn";
    button.textContent = formatLocationOptionLabel(location);
    button.addEventListener("mousedown", event => {
      event.preventDefault();
      applyLocationSelection(location);
    });

    item.append(button);
    fragment.append(item);
  });

  locationSuggestionsList.append(fragment);
  locationSuggestionsList.classList.add("is-open");
  locationInput.setAttribute("aria-expanded", "true");
}

async function updateLocationSuggestions() {
  const query = locationInput.value.trim();

  const searchVersion = state.locationSearchVersion + 1;
  state.locationSearchVersion = searchVersion;

  state.locationSuggestions = await searchAllUsLocations(query, 8);

  if (searchVersion !== state.locationSearchVersion) {
    return;
  }

  renderLocationSuggestions();
}

const debouncedUpdateLocationSuggestions = debounce(() => {
  updateLocationSuggestions();
}, 200);

function renderPreSearchState() {
  resultsContainer.innerHTML = "<p class=\"small text-body-secondary\">Enter a filter and click Search to load local events.</p>";
  resultsMeta.textContent = "Waiting for search";
  filterError.textContent = "";
}

async function updateEvents() {
  if (!state.hasSearched) {
    renderPreSearchState();
    return;
  }

  if (!state.hasFilterInput) {
    renderPreSearchState();
    filterError.textContent = "";
    return;
  }

  const filters = buildFilters();
  const dateValidation = validateDateRange(filters.startDate, filters.endDate);

  if (!dateValidation.valid) {
    filterError.textContent = dateValidation.message;
    return;
  }

  filterError.textContent = "";
  resultsMeta.textContent = "Loading events...";

  const events = await fetchEvents(filters);
  renderEvents(events);

  const locationLabel = state.activeLocation?.label || "selected area";
  resultsMeta.textContent = `${events.length} event(s) near ${locationLabel}`;
}

const debouncedUpdateEvents = debounce(updateEvents, 250);

function initializeFilterHandlers() {
  locationInput.addEventListener("focus", () => {
    debouncedUpdateLocationSuggestions();
  });

  locationInput.addEventListener("input", () => {
    debouncedUpdateLocationSuggestions();
  });

  locationInput.addEventListener("keydown", event => {
    if (event.key !== "Enter") {
      return;
    }

    const firstMatch = state.locationSuggestions[0];
    if (firstMatch) {
      event.preventDefault();
      applyLocationSelection(firstMatch);
    }
  });

  locationInput.addEventListener("blur", () => {
    window.setTimeout(() => {
      hideLocationSuggestions();
      locationInput.value = state.activeLocation.label;
    }, 120);
  });

  [subjectInput, categorySelect, startDateInput, endDateInput].forEach(control => {
    control.addEventListener("input", () => {
      state.hasFilterInput = true;
      if (state.hasSearched) {
        debouncedUpdateEvents();
      }
    });
    control.addEventListener("change", () => {
      state.hasFilterInput = true;
      if (state.hasSearched) {
        debouncedUpdateEvents();
      }
    });
  });

  radiusInput.addEventListener("input", () => {
    state.hasFilterInput = true;
    if (state.hasSearched) {
      debouncedUpdateEvents();
    }
  });

  filterForm.addEventListener("submit", event => {
    event.preventDefault();

    if (!state.hasFilterInput) {
      filterError.textContent = "Enter or change at least one filter before searching.";
      return;
    }

    state.hasSearched = true;
    updateEvents();
  });
}

if (
  filterForm &&
  locationInput &&
  locationSuggestionsList &&
  subjectInput &&
  categorySelect &&
  startDateInput &&
  endDateInput &&
  radiusInput &&
  searchButton &&
  resultsContainer &&
  recentLocationsList &&
  eventCardTemplate
) {
  locationInput.value = state.activeLocation.label;
  renderRecentLocations();
  initializeFilterHandlers();
  renderPreSearchState();
}
