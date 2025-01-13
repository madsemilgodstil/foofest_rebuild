"use client"; // Angiver, at denne komponent kører på klient-siden i Next.js.

import { useState, useEffect } from "react"; // React hooks til state-håndtering og sideeffekter.
import { useAuth } from "@/context/AuthContext"; // Henter brugerens loginstatus fra AuthContext.
import useLikedBandsStore from "@/stores/likedBandsStore"; // Zustand tilstandshåndtering for likede bands.
import BandSlider from "@/components/bandSlider/BandSlider"; // Komponent til visning af banddetaljer i en slider.
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"; // UI-komponenter til kortlayout.
import { Sheet, SheetTrigger } from "@/components/ui/sheet"; // UI-komponenter til detaljerede sheets.
import { Input } from "@/components/ui/input"; // UI-komponent til tekstinput (søgefelt).
import { Avatar, AvatarImage } from "@/components/ui/avatar"; // Avatar-komponenter til bandbilleder.
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai"; // Ikoner til like/unlike-funktionalitet.

function getImageUrl(band) {
  // Funktion til at hente korrekt bandlogo URL.
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || ""; // Basen URL hentes fra miljøvariabler.
  return band?.logo?.startsWith("https://")
    ? band.logo
    : band?.logo
    ? `${baseUrl}/logos/${band.logo}`
    : null; // Hvis logoet ikke findes, returneres `null`.
}

const ArtistList = ({ stages = [], bands = [], onlyLiked = false }) => {
  // Initialiserer state og hooks.
  const { likedBands, addBand, removeBand, loadLikedBands } =
    useLikedBandsStore(); // Håndterer likede bands.
  const { isLoggedIn } = useAuth(); // Loginstatus for brugeren.
  const [searchQuery, setSearchQuery] = useState(""); // State for søgeinput.
  const [visibleBands, setVisibleBands] = useState(12); // Antal bands der vises.

  useEffect(() => {
    loadLikedBands(); // Loader likede bands fra lokal tilstand.
  }, [loadLikedBands]);

  // Filtrer bands baseret på søgeinput eller kun likede bands.
  const filteredBands = (onlyLiked ? likedBands : bands).filter((band) =>
    band.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isBandLiked = (slug) => likedBands.some((band) => band.slug === slug); // Tjekker om et band er liket.

  const toggleLike = (band) => {
    // Tilføjer eller fjerner et band fra likede bands.
    isBandLiked(band.slug) ? removeBand(band.slug) : addBand(band);
  };

  const getBandSchedule = (bandName) => {
    // Finder bandets optrædener baseret på scener og skemaer.
    const bandSchedule = [];
    stages.forEach(({ name: stageName, stageSchedule }) => {
      if (stageSchedule) {
        Object.entries(stageSchedule).forEach(([day, events]) => {
          events.forEach((event) => {
            if (
              event.act?.toLowerCase().trim() === bandName.toLowerCase().trim()
            ) {
              bandSchedule.push({
                stage: stageName,
                day,
                start: event.start,
                end: event.end,
                genre: event.genre || "Unknown",
                canceled: event.cancelled || false, // Marker eventet som aflyst.
              });
            }
          });
        });
      }
    });
    return bandSchedule;
  };

  const handleLoadMore = () => {
    // Øger antallet af bands der vises.
    setVisibleBands((prev) => prev + 12);
  };

  return (
    <>
      <div className="flex justify-center mb-6">
        <div className="w-full max-w-2xl">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} // Opdaterer søgeinput.
            placeholder="Search for artists..."
            className="w-full px-4 py-2 border rounded-lg bg-background text-foreground focus:ring-primary focus:ring-2"
          />
        </div>
      </div>
      {filteredBands.length === 0 ? (
        // Viser besked hvis ingen bands findes.
        <p className="mt-6 text-lg text-center text-primary">
          {onlyLiked ? "No artists liked yet!" : "No artists found!"}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-8 mx-0 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:mx-8">
            {filteredBands.slice(0, visibleBands).map((band) => {
              const imageUrl = getImageUrl(band);
              const isLiked = isBandLiked(band.slug);
              const bandSchedule = getBandSchedule(band.name);

              // Tjek om bandet har aflyste events.
              const isCanceled = bandSchedule.some((slot) => slot.canceled);

              return (
                <Sheet key={band.slug}>
                  <SheetTrigger asChild>
                    <Card className="relative overflow-hidden transition duration-300 ease-in-out border-2 cursor-pointer hover:scale-105 rounded-xl">
                      {/* Overlay for aflyste bands */}
                      {isCanceled && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-primary bg-opacity-90">
                          <span className="text-lg font-bold text-white">
                            Cancelled
                          </span>
                        </div>
                      )}
                      <CardContent className="relative p-0">
                        <div className="relative w-full h-40 overflow-hidden rounded-t-xl">
                          {imageUrl ? (
                            <Avatar className="absolute inset-0 w-full h-full">
                              <AvatarImage
                                src={imageUrl}
                                alt={band.name}
                                loading="lazy"
                                className="object-cover w-full h-full"
                              />
                            </Avatar>
                          ) : (
                            <div className="flex items-center justify-center w-full h-full text-gray-600 bg-gray-200">
                              No image available
                            </div>
                          )}
                          {/* Like-knap */}
                          {isLoggedIn && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLike(band);
                              }}
                              className={`absolute top-2 right-2 w-10 h-10 flex items-center justify-center rounded-full border-2 bg-black z-20 ${
                                isLiked
                                  ? "text-primary border-orange"
                                  : "text-primary border-darkorange hover:border-orange"
                              } transition duration-200`}
                            >
                              {isLiked ? (
                                <AiFillHeart size={20} />
                              ) : (
                                <AiOutlineHeart size={20} />
                              )}
                            </button>
                          )}
                        </div>
                      </CardContent>
                      <CardHeader className="py-4">
                        <CardTitle className="text-2xl font-bold text-center text-white">
                          {band.name}
                        </CardTitle>
                        <CardDescription className="text-center text-primary">
                          {band.genre || "Unknown Genre"}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </SheetTrigger>
                  <BandSlider band={band} bandSchedule={bandSchedule} />
                </Sheet>
              );
            })}
          </div>
          {visibleBands < filteredBands.length && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleLoadMore}
                className="px-6 py-2 text-white transition duration-200 ease-out border rounded-full bg-primary hover:bg-black border-primary"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default ArtistList;
