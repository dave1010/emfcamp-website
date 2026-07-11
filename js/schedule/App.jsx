import React, { useState, useEffect } from "react";
import { DateTime } from "luxon";

import Calendar from "./Calendar.jsx";
import Filters from "./Filters.jsx";
import ScheduleData from "./ScheduleData.jsx";
import Messages from "./Messages.jsx";

function now() {
  return DateTime.fromMillis(Date.now(), { zone: "Europe/London" });
}

const scheduleSettingsStorageKey = "schedule-settings:v1";

function App() {
  const [currentTime, setCurrentTime] = useState(now());
  const [selectedVenues, setSelectedVenues] = useState([]);
  const [selectedEventTypes, setSelectedEventTypes] = useState([]);
  const [selectedAgeRanges, setSelectedAgeRanges] = useState([]);
  const [onlyFavourites, setOnlyFavourites] = useState(false);
  const [onlyFamilyFriendly, setOnlyFamilyFriendly] = useState(false);
  const [onlyNoRecording, setOnlyNoRecording] = useState(false);
  const [onlyLottery, setOnlyLottery] = useState(false);
  const [includeFinished, setIncludeFinished] = useState(false);
  const [venueSort, setVenueSort] = useState("official");
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [debug, setDebug] = useState(false);

  const [rawSchedule, setRawSchedule] = useState(null);
  const [schedule, setSchedule] = useState(null);

  const [apiToken, setApiToken] = useState(null);

  function defaultSettings(newSchedule) {
    return {
      selectedVenues: newSchedule.venues.map((v) => v.name),
      selectedEventTypes: [...newSchedule.eventTypes.map((t) => t.id)],
      selectedAgeRanges: [...newSchedule.ageRanges],
      onlyFavourites: false,
      onlyFamilyFriendly: false,
      onlyNoRecording: false,
      onlyLottery: false,
      includeFinished: newSchedule.allFinished,
      venueSort: "official",
    };
  }

  function applySettings(settings) {
    setSelectedVenues(settings.selectedVenues);
    setSelectedEventTypes(settings.selectedEventTypes);
    setSelectedAgeRanges(settings.selectedAgeRanges);
    setOnlyFavourites(settings.onlyFavourites);
    setOnlyFamilyFriendly(settings.onlyFamilyFriendly);
    setOnlyNoRecording(settings.onlyNoRecording);
    setOnlyLottery(settings.onlyLottery);
    setIncludeFinished(settings.includeFinished);
    setVenueSort(settings.venueSort);
  }

  function resetFilters() {
    if (rawSchedule === null) {
      return;
    }

    const newSchedule = new ScheduleData(rawSchedule, { currentTime });
    applySettings(defaultSettings(newSchedule));
  }

  // Get the user's API token
  useEffect(() => {
    let container = document.getElementById("schedule-app");
    let token = container.getAttribute("data-api-token");
    let debug = container.getAttribute("data-debug");

    if (token !== "None") {
      setApiToken(token);
    }
    if (debug === "True") {
      setDebug(true);
    }
  }, []);

  // Pull the correct year's schedule if the year changes.
  useEffect(() => {
    fetch(`/schedule.json`)
      .then((response) => response.json())
      .then((body) => {
        setRawSchedule(body);

        let newSchedule = new ScheduleData(body, { currentTime, venueSort });
        setSchedule(newSchedule);

        let settings = defaultSettings(newSchedule);
        const savedSettings = localStorage.getItem(scheduleSettingsStorageKey);
        if (savedSettings !== null) {
          settings = { ...settings, ...JSON.parse(savedSettings) };
          settings.selectedVenues = settings.selectedVenues.filter((v) =>
            newSchedule.venues.some((venue) => venue.name === v),
          );
          settings.selectedEventTypes = settings.selectedEventTypes.filter(
            (t) => newSchedule.eventTypes.some((type) => type.id === t),
          );
          settings.selectedAgeRanges = settings.selectedAgeRanges.filter((a) =>
            newSchedule.ageRanges.includes(a),
          );
        }
        applySettings(settings);
        setSettingsLoaded(true);
      });
  }, []);

  // Refilter the schedule if options change.
  useEffect(() => {
    if (rawSchedule == null) {
      return;
    }

    let newSchedule = new ScheduleData(rawSchedule, {
      currentTime,
      onlyFavourites,
      onlyFamilyFriendly,
      onlyNoRecording,
      onlyLottery,
      includeFinished,
      selectedVenues,
      selectedEventTypes,
      selectedAgeRanges,
      venueSort,
    });
    setSchedule(newSchedule);
  }, [
    currentTime,
    onlyFavourites,
    onlyFamilyFriendly,
    onlyNoRecording,
    onlyLottery,
    includeFinished,
    selectedVenues,
    selectedEventTypes,
    selectedAgeRanges,
    rawSchedule,
    venueSort,
  ]);

  useEffect(() => {
    if (!settingsLoaded) {
      return;
    }

    localStorage.setItem(
      scheduleSettingsStorageKey,
      JSON.stringify({
        selectedVenues,
        selectedEventTypes,
        selectedAgeRanges,
        onlyFavourites,
        onlyFamilyFriendly,
        onlyNoRecording,
        onlyLottery,
        includeFinished,
        venueSort,
      }),
    );
  }, [
    settingsLoaded,
    selectedVenues,
    selectedEventTypes,
    selectedAgeRanges,
    onlyFavourites,
    onlyFamilyFriendly,
    onlyNoRecording,
    onlyLottery,
    includeFinished,
    venueSort,
  ]);

  // Update time once a minute
  useEffect(() => {
    // In debug mode we want to be able to manually control time.
    if (!debug) {
      let timeout = setTimeout(() => {
        setCurrentTime(now());
      }, 60000);

      return () => clearTimeout(timeout);
    }
  });

  function toggleFavourite(schedule_item) {
    fetch(`/api/schedule-item/${schedule_item.id}/favourite`, {
      headers: { Authorization: apiToken, "Content-Type": "application/json" },
      method: "put",
      body: "{}",
    })
      .then((response) => response.json())
      .then((data) => {
        let schedule = JSON.parse(JSON.stringify(rawSchedule));
        let idx = schedule.findIndex((sid) => sid.id === schedule_item.id);
        schedule[idx].is_fave = data.is_favourite;

        setRawSchedule(schedule);
      })
      .catch((error) => {
        console.error("Error toggling favourite:", schedule_item, error);
      });
  }

  if (schedule === null) {
    return <p>Loading...</p>;
  }

  let filterProps = {
    schedule,
    onlyFavourites,
    setOnlyFavourites,
    onlyFamilyFriendly,
    setOnlyFamilyFriendly,
    onlyNoRecording,
    setOnlyNoRecording,
    onlyLottery,
    setOnlyLottery,
    includeFinished,
    setIncludeFinished,
    selectedVenues,
    setSelectedVenues,
    selectedEventTypes,
    setSelectedEventTypes,
    selectedAgeRanges,
    setSelectedAgeRanges,
    venueSort,
    setVenueSort,
    resetFilters,
    filtersActive:
      onlyFavourites ||
      onlyFamilyFriendly ||
      onlyNoRecording ||
      onlyLottery ||
      selectedVenues.length !== schedule.venues.length ||
      selectedEventTypes.length !== schedule.eventTypes.length ||
      selectedAgeRanges.length !== schedule.ageRanges.length,
    debug,
    currentTime,
    setCurrentTime,
  };

  return (
    <React.StrictMode>
      <Messages />
      <Filters {...filterProps} />
      <Calendar
        schedule={schedule}
        toggleFavourite={toggleFavourite}
        authenticated={apiToken !== null}
      />
    </React.StrictMode>
  );
}

export default App;
