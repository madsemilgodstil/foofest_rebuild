"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import BandSlider from "@/components/bandSlider/BandSlider";

const Schedule = ({ stages, bands }) => {
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [selectedBand, setSelectedBand] = useState(null);

  const allDays = [
    ...new Set(
      stages.flatMap(({ stageSchedule }) => Object.keys(stageSchedule))
    ),
  ];

  const allGenres = [
    ...new Set(
      stages.flatMap(({ stageSchedule }) =>
        Object.values(stageSchedule).flatMap((day) =>
          day
            .map(({ genre }) => genre)
            .filter((genre) => genre && genre !== "Unknown")
        )
      )
    ),
  ];

  const handleStageFilter = (stageName) => {
    setSelectedStage(stageName === selectedStage ? null : stageName);
  };

  const handleGenreFilter = (genre) => {
    setSelectedGenre(genre === selectedGenre ? null : genre);
  };

  const scrollToDay = (day) => {
    const element = document.getElementById(day);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleBandClick = (event, stage, day) => {
    console.log("Selected event:", event, "Stage:", stage, "Day:", day);

    // Find band fra bands-listen baseret på event.act
    const matchedBand = bands.find(
      (band) =>
        band.name.toLowerCase().trim() === event.act.toLowerCase().trim()
    );

    if (matchedBand) {
      // Kombiner band-data med event-detaljer og tilføj stage og day
      setSelectedBand({
        ...matchedBand,
        schedule: [{ ...event, stage, day }],
      });
      console.log("Matched Band:", matchedBand);
    } else {
      console.error("No band matched for:", event.act);
    }
  };

  return (
    <div className="mx-4 lg:mx-24">
      <div className="gap-6 mb-20 mt-7 ">
        {/* Stage filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8 font-oswald">
          {stages.map(({ name }) => (
            <button
              key={name}
              onClick={() => handleStageFilter(name)}
              className={`px-6 py-2 rounded-full border ${
                selectedStage === name
                  ? "bg-primary text-white border-primary"
                  : "bg-black text-white border-primary hover:bg-primary transition ease-out duration-200"
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {/* Day filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8 font-oswald">
          {allDays.map((day) => (
            <button
              key={day}
              onClick={() => scrollToDay(day)}
              className="px-6 py-2 text-white transition duration-200 ease-out border rounded-full bg-primary hover:bg-black border-primary"
            >
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </button>
          ))}
        </div>

        {/* Genre filter */}
        <div className="flex flex-wrap justify-center gap-3 mt-6 font-oswald">
          {allGenres.map((genre) => (
            <button
              key={genre}
              onClick={() => handleGenreFilter(genre)}
              className={`px-6 py-2 rounded-full border ${
                selectedGenre === genre
                  ? "bg-primary text-white border-primary"
                  : "bg-black text-white border-primary hover:bg-primary transition ease-out duration-200"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      <div
        className={`${
          selectedStage
            ? "flex justify-center items-center"
            : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-6"
        }`}
      >
        {stages
          .filter(({ name }) => !selectedStage || selectedStage === name)
          .map(({ name, stageSchedule }) => (
            <div
              key={name}
              className={`rounded-xl shadow bg-black border-darkorange border-2 text-center p-8 mb-8 ${
                selectedStage ? "w-full max-w-7xl" : ""
              }`}
            >
              <h2 className="mb-8 text-3xl font-bold text-white text-md font-oswald">
                {name}
              </h2>
              {Object.keys(stageSchedule).map((day) => {
                const filteredEvents = stageSchedule[day]?.filter(
                  ({ genre }) =>
                    (!selectedGenre || genre === selectedGenre) &&
                    genre !== "Unknown"
                );

                if (!filteredEvents || filteredEvents.length === 0) {
                  return null;
                }

                return (
                  <div key={day} id={day} className="mb-2">
                    <h3 className="mb-1 text-lg font-semibold capitalize text-primary">
                      {day}
                    </h3>
                    <div className="grid gap-1">
                      {filteredEvents.map((event, index) => (
                        <Sheet key={index}>
                          <SheetTrigger asChild>
                            <Card
                              onClick={() => handleBandClick(event, name, day)}
                              className={`hover:scale-[1.03] transition ease-in-out duration-300 border rounded-[10px] cursor-pointer ${
                                event.cancelled
                                  ? "bg-red-900 border-red-500 text-white"
                                  : "border-darkorange hover:border-primary hover:text-primary"
                              }`}
                            >
                              <CardHeader className="p-2">
                                <CardTitle className="flex items-center justify-between text-xs font-bold">
                                  <span>{event.act}</span>
                                  {event.cancelled && (
                                    <span className="font-semibold text-red-500">
                                      (CANCELED)
                                    </span>
                                  )}
                                  <span className="text-gray-500 text-[10px]">
                                    {event.start} - {event.end}
                                  </span>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="p-2">
                                {event.genre && (
                                  <p className="text-gray-400 italic text-[10px]">
                                    {event.genre}
                                  </p>
                                )}
                              </CardContent>
                            </Card>
                          </SheetTrigger>
                          {selectedBand &&
                            selectedBand.schedule[0].act === event.act && (
                              <BandSlider
                                band={selectedBand}
                                bandSchedule={selectedBand.schedule}
                              />
                            )}
                        </Sheet>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
      </div>
    </div>
  );
};

export default Schedule;
