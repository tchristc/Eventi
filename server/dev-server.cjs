const express = require("express");
const path = require("path");
const { filterEvents, parseFilters } = require("./events-data.cjs");

const app = express();
const port = Number(process.env.PORT || 8081);
const siteDir = path.resolve(__dirname, "..", "_site");

app.get("/api/v1/events", (req, res) => {
  const filters = parseFilters(req.query);
  const events = filterEvents(filters);

  res.json({
    success: true,
    data: {
      filters: {
        location: Number.isFinite(filters.locationLat) && Number.isFinite(filters.locationLng)
          ? { lat: filters.locationLat, lng: filters.locationLng }
          : null,
        subject: filters.subject,
        category: filters.category,
        start_date: filters.startDate,
        end_date: filters.endDate,
        radius_miles: filters.radiusMiles,
        api_sources: (req.query.api_sources || "").split(",").filter(Boolean)
      },
      events
    }
  });
});

app.use(express.static(siteDir));

app.get("*", (_req, res) => {
  res.sendFile(path.join(siteDir, "index.html"));
});

app.listen(port, () => {
  console.log(`Dev server running at http://localhost:${port}`);
});
