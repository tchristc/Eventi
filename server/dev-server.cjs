const fs = require("fs");
const express = require("express");
const path = require("path");

function loadDotEnv() {
  const envPath = path.resolve(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) {
    return;
  }

  const contents = fs.readFileSync(envPath, "utf8");
  contents.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

loadDotEnv();

const { getEvents, parseFilters } = require("./events-data.cjs");

const app = express();
const port = Number(process.env.PORT || 8081);
const siteDir = path.resolve(__dirname, "..", "_site");

app.get("/api/v1/events", async (req, res) => {
  const filters = parseFilters(req.query);
  const events = await getEvents(filters, {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY
  });

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
