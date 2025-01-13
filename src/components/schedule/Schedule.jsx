"use client"; // Angiver, at komponenten kører på klient-siden (Next.js).

import { useState } from "react"; // Importerer useState til håndtering af lokal tilstand.
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Importerer UI-komponenter til visning af kort.
import { Sheet, SheetTrigger } from "@/components/ui/sheet"; // Importerer komponenter til "sheet"-layout.
import BandSlider from "@/components/bandSlider/BandSlider"; // Importerer en komponent til visning af banddetaljer.

const Schedule = ({ stages, bands }) => {
  // Lokal tilstand til filtre og valgte elementer
  const [selectedGenre, setSelectedGenre] = useState(null); // Valgt genre
  const [selectedStage, setSelectedStage] = useState(null); // Valgt scene
  const [selectedBand, setSelectedBand] = useState(null); // Valgt band

  // Udleder alle dage fra sceneplanen
  const allDays = [
    ...new Set(
      stages.flatMap(({ stageSchedule }) => Object.keys(stageSchedule)) // Samler unikke dage fra alle scener.
    ),
  ];

  // Udleder alle unikke genrer fra sceneplanen
  const allGenres = [
    ...new Set(
      stages.flatMap(({ stageSchedule }) =>
        Object.values(stageSchedule).flatMap(
          (day) =>
            day
              .map(({ genre }) => genre) // Henter genrer fra hvert event
              .filter((genre) => genre && genre !== "Unknown") // Filtrerer ukendte genrer fra
        )
      )
    ),
  ];

  // Håndterer klik på en scene i filteret
  const handleStageFilter = (stageName) => {
    setSelectedStage(stageName === selectedStage ? null : stageName); // Toggler scenen som valgt/ikke valgt.
  };

  // Håndterer klik på en genre i filteret
  const handleGenreFilter = (genre) => {
    setSelectedGenre(genre === selectedGenre ? null : genre); // Toggler genren som valgt/ikke valgt.
  };

  // Ruller til en bestemt dag i oversigten
  const scrollToDay = (day) => {
    const element = document.getElementById(day); // Finder elementet for dagen.
    if (element) {
      element.scrollIntoView({ behavior: "smooth" }); // Glat rulning til elementet.
    }
  };

  // Håndterer klik på et bandkort
  const handleBandClick = (event, stage, day) => {
    console.log("Selected event:", event, "Stage:", stage, "Day:", day);

    // Finder det valgte band fra bands-listen baseret på eventets navn
    const matchedBand = bands.find(
      (band) =>
        band.name.toLowerCase().trim() === event.act.toLowerCase().trim()
    );

    if (matchedBand) {
      // Kombinerer banddata med eventdetaljer
      setSelectedBand({
        ...matchedBand,
        schedule: [{ ...event, stage, day }],
      });
      console.log("Matched Band:", matchedBand);
    } else {
      console.error("No band matched for:", event.act); // Logger fejl, hvis bandet ikke findes.
    }
  };

  return (
    <div className="mx-4 lg:mx-24">
      <div className="gap-6 mb-20 mt-7">
        {/* Filter for scener */}
        <div className="flex flex-wrap justify-center gap-3 mb-8 font-oswald">
          {stages.map(({ name }) => (
            <button
              key={name}
              onClick={() => handleStageFilter(name)} // Toggler scenefilteret
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

        {/* Filter for dage */}
        <div className="flex flex-wrap justify-center gap-3 mb-8 font-oswald">
          {allDays.map((day) => (
            <button
              key={day}
              onClick={() => scrollToDay(day)} // Ruller til den valgte dag
              className="px-6 py-2 text-white transition duration-200 ease-out border rounded-full bg-primary hover:bg-black border-primary"
            >
              {day.charAt(0).toUpperCase() + day.slice(1)}{" "}
              {/* Formaterer dagen */}
            </button>
          ))}
        </div>

        {/* Filter for genrer */}
        <div className="flex flex-wrap justify-center gap-3 mt-6 font-oswald">
          {allGenres.map((genre) => (
            <button
              key={genre}
              onClick={() => handleGenreFilter(genre)} // Toggler genrefilteret
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

      {/* Oversigt over scener */}
      <div
        className={`${
          selectedStage
            ? "flex justify-center items-center"
            : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-6"
        }`}
      >
        {stages
          .filter(({ name }) => !selectedStage || selectedStage === name) // Filtrerer scener baseret på valget
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
                    (!selectedGenre || genre === selectedGenre) && // Filtrerer events baseret på genre
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
                              onClick={() => handleBandClick(event, name, day)} // Åbner banddetaljer
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
