import React, { useState } from "react";
import { DateTime } from "luxon";
import { Checkbox, CheckboxGroup, DateTimePicker } from "./Controls.jsx";

function DebugOptions({ debug, currentTime, setCurrentTime }) {
  if (!debug) {
    return null;
  }

  return (
    <>
      <h3>Debug Nonsense</h3>
      <p className="filter-control-row">
        <label>Current time:</label>
        <DateTimePicker value={currentTime} onChange={setCurrentTime} />
      </p>
    </>
  );
}

function TabButton({ activeTab, tab, setActiveTab, children }) {
  return (
    <li role="presentation" className={activeTab === tab ? "active" : ""}>
      <a
        href="#"
        onClick={(ev) => {
          ev.preventDefault();
          setActiveTab(tab);
        }}
      >
        {children}
      </a>
    </li>
  );
}

function SortButton({ venueSort, value, setVenueSort, children }) {
  return (
    <button
      type="button"
      className={`btn btn-default${venueSort === value ? " active" : ""}`}
      onClick={() => setVenueSort(value)}
    >
      {children}
    </button>
  );
}

function Filters({
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
  filtersActive,
  debug,
  currentTime,
  setCurrentTime,
}) {
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("filters");

  function selectOfficialVenues(ev) {
    ev.preventDefault();
    setSelectedVenues(
      schedule.venues.filter((v) => v.official).map((v) => v.name),
    );
  }

  function renderBody() {
    let venueFilters = [
      { name: "Official Venues Only", callback: selectOfficialVenues },
    ];

    return (
      <div className="panel-body settings-tabs">
        <ul className="nav nav-tabs" role="tablist">
          <TabButton
            activeTab={activeTab}
            tab="filters"
            setActiveTab={setActiveTab}
          >
            Filters
          </TabButton>
          <TabButton
            activeTab={activeTab}
            tab="venues"
            setActiveTab={setActiveTab}
          >
            Venues
          </TabButton>
          <TabButton
            activeTab={activeTab}
            tab="types"
            setActiveTab={setActiveTab}
          >
            Event Types
          </TabButton>
        </ul>

        <div className="tab-content">
          <div
            className={`tab-pane${activeTab === "filters" ? " active" : ""}`}
          >
            <div className="form-group form-inline">
              <Checkbox checked={onlyFavourites} onChange={setOnlyFavourites}>
                Favourites only
              </Checkbox>
              <Checkbox checked={onlyLottery} onChange={setOnlyLottery}>
                Ticketed only
              </Checkbox>
              <Checkbox
                checked={onlyFamilyFriendly}
                onChange={setOnlyFamilyFriendly}
              >
                Family friendly only
              </Checkbox>
              <Checkbox checked={onlyNoRecording} onChange={setOnlyNoRecording}>
                No Recording only
              </Checkbox>
              <Checkbox checked={includeFinished} onChange={setIncludeFinished}>
                Include finished events
              </Checkbox>
            </div>
            <DebugOptions
              debug={debug}
              currentTime={currentTime}
              setCurrentTime={setCurrentTime}
            />
          </div>

          <div className={`tab-pane${activeTab === "venues" ? " active" : ""}`}>
            <div className="filter-control-row venue-sort-control">
              <span className="control-label">Venue sort:</span>
              <div
                className="btn-group"
                role="group"
                aria-label="Venue sort order"
              >
                <SortButton
                  venueSort={venueSort}
                  value="official"
                  setVenueSort={setVenueSort}
                >
                  Official first
                </SortButton>
                <SortButton
                  venueSort={venueSort}
                  value="name"
                  setVenueSort={setVenueSort}
                >
                  A–Z
                </SortButton>
              </div>
            </div>
            <CheckboxGroup
              options={schedule.venues.map((v) => v.name)}
              selectedOptions={selectedVenues}
              onChange={setSelectedVenues}
              filters={venueFilters}
            />
          </div>

          <div className={`tab-pane${activeTab === "types" ? " active" : ""}`}>
            <CheckboxGroup
              options={schedule.eventTypes.map((t) => t.id)}
              selectedOptions={selectedEventTypes}
              labels={schedule.eventTypes.map((t) => t.name)}
              onChange={setSelectedEventTypes}
            />
          </div>
        </div>

        <button
          type="button"
          className="btn btn-info reset-filters"
          onClick={resetFilters}
        >
          Reset Filters
        </button>
      </div>
    );
  }

  return (
    <div className="panel panel-default filters">
      <div className="panel-heading">
        <h2 className="panel-title">
          <span className="title">
            Filtering options
            {filtersActive && (
              <span className="filter-active-indicator">Filtered</span>
            )}
          </span>
          <span className="toggle">
            <a
              href="#"
              onClick={(ev) => {
                ev.preventDefault();
                setVisible(!visible);
              }}
            >
              {visible ? "Hide" : "Show"}
            </a>
          </span>
        </h2>
      </div>

      {visible && renderBody()}
    </div>
  );
}

export default Filters;
