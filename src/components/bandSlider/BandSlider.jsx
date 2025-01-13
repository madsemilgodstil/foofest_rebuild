"use client"; // Indikerer, at denne komponent kører på klient-siden i Next.js.

import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"; // Importerer UI-komponenter til Sheet-layout.
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Avatar-komponenter til billedevisning.
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai"; // Hjerteikoner til like/unlike-funktionalitet.
import useLikedBandsStore from "@/stores/likedBandsStore"; // Zustand store til håndtering af likede bands.
import { useState } from "react"; // State hook fra React.
import { useAuth } from "@/context/AuthContext"; // Importerer AuthContext for loginstatus.

// Funktion til at konvertere korte ugedagsnavne til fulde navne.
function getFullDayName(shortDay) {
  const days = {
    mon: "Monday",
    tue: "Tuesday",
    wed: "Wednesday",
    thu: "Thursday",
    fri: "Friday",
    sat: "Saturday",
    sun: "Sunday",
  };
  return days[shortDay] || shortDay; // Returnerer det originale input, hvis dagen ikke findes.
}

// BandSlider-komponenten til visning af banddetaljer.
export default function BandSlider({ band, bandSchedule }) {
  const { likedBands, addBand, removeBand } = useLikedBandsStore(); // Zustand hooks til likede bands.
  const { isLoggedIn } = useAuth(); // Henter loginstatus fra AuthContext.
  const [showFullBio, setShowFullBio] = useState(false); // State til "Read More"-funktionalitet.

  // Henter bandets logo-URL eller returnerer `null`, hvis der ikke er noget logo.
  const imageUrl = band?.logo
    ? band.logo.startsWith("https://")
      ? band.logo
      : `${process.env.NEXT_PUBLIC_API_URL || ""}/logos/${band.logo}`
    : null;

  // Tjekker, om bandet er liket.
  const isBandLiked = likedBands.some(
    (likedBand) => likedBand.slug === band.slug
  );

  // Funktion til at like/unlike et band.
  const toggleLike = () => {
    if (!isLoggedIn) {
      alert("You must be logged in to like this band!"); // Advarsel, hvis brugeren ikke er logget ind.
      return;
    }
    isBandLiked ? removeBand(band.slug) : addBand(band);
  };

  // Funktion til at forkorte biografi.
  const getShortBio = (bio) => {
    const maxLength = 150; // Maksimalt antal tegn for kort version.
    return bio.length > maxLength ? bio.substring(0, maxLength) + "..." : bio;
  };

  return (
    <SheetContent
      className="flex flex-col p-6"
      style={{ height: "100vh", maxHeight: "100vh" }} // Sheet fylder hele viewport-højden.
    >
      <SheetHeader>
        <SheetTitle className="text-4xl font-bold text-primary">
          {band?.name || "No Band Selected"}{" "}
          {/* Bandets navn eller standardtekst. */}
        </SheetTitle>

        {/* Like-knap under overskriften */}
        <button
          onClick={toggleLike}
          className={`mt-4 w-10 h-10 flex items-center justify-center rounded-full border-2 bg-black ${
            isBandLiked
              ? "text-primary border-orange" // Style hvis bandet er liket.
              : "text-primary border-darkorange hover:border-orange" // Style hvis bandet ikke er liket.
          } transition duration-200`}
        >
          {isBandLiked ? (
            <AiFillHeart size={20} />
          ) : (
            <AiOutlineHeart size={20} />
          )}
        </button>

        <SheetDescription className="mt-4 text-gray-400">
          Scroll for more information
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 mt-4 space-y-4 overflow-y-auto">
        {/* Bandets billede */}
        <div className="py-4">
          {imageUrl ? (
            <Avatar className="mx-auto w-60 h-60">
              <AvatarImage src={imageUrl} alt={band?.name || "Band"} />
              <AvatarFallback>{band?.name || "?"}</AvatarFallback>
            </Avatar>
          ) : (
            <div>No image available</div>
          )}
        </div>

        {/* Bandets biografi */}
        <div className="my-2 text-lg">
          {band?.bio ? (
            <>
              {showFullBio ? band.bio : getShortBio(band.bio)}
              {band.bio.length > 150 && (
                <button
                  onClick={() => setShowFullBio((prev) => !prev)}
                  className="ml-2 underline text-primary"
                >
                  {showFullBio ? "Read Less" : "Read More"}
                </button>
              )}
            </>
          ) : (
            "Biography not available."
          )}
        </div>

        {/* Bandets genre */}
        <div className="font-semibold text-white">
          <h3 className="mb-2 text-sm font-bold text-primary">
            Genre:{" "}
            <span className="ml-1 text-sm text-gray-300">{band?.genre}</span>
          </h3>
        </div>

        {/* Bandmedlemmer */}
        <div className="font-semibold text-white">
          <h3 className="mb-2 text-sm font-bold text-primary">
            Members:{" "}
            <span className="ml-1 text-sm text-gray-300">
              {band?.members?.join(", ") || "No members listed"}
            </span>
          </h3>
        </div>

        {/* Bandets spilleplan */}
        <div className="font-semibold text-white">
          <h3 className="mb-2 text-sm font-bold text-primary">
            Schedule:{" "}
            {bandSchedule?.length > 0 ? (
              <span className="ml-1 text-sm text-gray-300">
                {bandSchedule.map((slot, index) => (
                  <span key={index}>
                    {getFullDayName(slot.day)}: {slot.start} - {slot.end} on{" "}
                    {slot.stage}
                    {index < bandSchedule.length - 1 && ", "}
                  </span>
                ))}
              </span>
            ) : (
              <span className="ml-1 text-gray-400">No schedule available.</span>
            )}
          </h3>
        </div>
      </div>
    </SheetContent>
  );
}
