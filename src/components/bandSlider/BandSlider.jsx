"use client";

import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import useLikedBandsStore from "@/stores/likedBandsStore";
import { useAuth } from "@/context/AuthContext"; // Import the AuthContext

// Function to convert short day names to full day names
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
  return days[shortDay] || shortDay; // Return original input if the day is not found
}

export default function BandSlider({ band, bandSchedule }) {
  const { likedBands, addBand, removeBand } = useLikedBandsStore(); // Zustand hooks
  const { isLoggedIn } = useAuth(); // Get login status from AuthContext

  const imageUrl = band?.logo
    ? band.logo.startsWith("https://")
      ? band.logo
      : `${process.env.NEXT_PUBLIC_API_URL || ""}/logos/${band.logo}`
    : null;

  // Check if the band is liked
  const isBandLiked = likedBands.some(
    (likedBand) => likedBand.slug === band.slug
  );

  // Function to toggle like
  const toggleLike = () => {
    if (!isLoggedIn) {
      alert("You must be logged in to like this band!"); // Notify user if not logged in
      return;
    }
    isBandLiked ? removeBand(band.slug) : addBand(band);
  };

  return (
    <SheetContent
      className="flex flex-col p-6"
      style={{ height: "100vh", maxHeight: "100vh" }}
    >
      <SheetHeader>
        <SheetTitle className="text-4xl font-bold text-primary">
          {band?.name || "No Band Selected"}
        </SheetTitle>

        {/* Like button below the title */}
        <button
          onClick={toggleLike}
          className={`mt-4 w-10 h-10 flex items-center justify-center rounded-full border-2 bg-black ${
            isBandLiked
              ? "text-primary border-orange"
              : "text-primary border-darkorange hover:border-orange"
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
        {/* Band image */}
        <div className="py-4">
          {imageUrl ? (
            <Avatar className="w-48 h-48">
              <AvatarImage src={imageUrl} alt={band?.name || "Band"} />
              <AvatarFallback>{band?.name || "?"}</AvatarFallback>
            </Avatar>
          ) : (
            <div>No image available</div>
          )}
        </div>

        {/* Band description */}
        <div className="my-2 text-lg">
          {band?.bio || "Biography not available."}
        </div>

        {/* Genre */}
        <div className="font-semibold text-white">
          <h3 className="mb-2 text-sm font-bold text-primary">
            Genre:{" "}
            <span className="ml-1 text-sm text-gray-300">{band?.genre}</span>
          </h3>
        </div>

        {/* Members */}
        <div className="font-semibold text-white">
          <h3 className="mb-2 text-sm font-bold text-primary">
            Members:{" "}
            <span className="ml-1 text-sm text-gray-300">
              {band?.members?.join(", ") || "No members listed"}
            </span>
          </h3>
        </div>

        {/* Schedule */}
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
