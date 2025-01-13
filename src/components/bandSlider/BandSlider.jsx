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
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

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
  return days[shortDay] || shortDay;
}

export default function BandSlider({ band, bandSchedule }) {
  const { likedBands, addBand, removeBand } = useLikedBandsStore();
  const { isLoggedIn } = useAuth();
  const [showFullBio, setShowFullBio] = useState(false);
  const [spotifyEmbedUrl, setSpotifyEmbedUrl] = useState(""); // Spotify player embed URL

  const imageUrl = band?.logo
    ? band.logo.startsWith("https://")
      ? band.logo
      : `${process.env.NEXT_PUBLIC_API_URL || ""}/logos/${band.logo}`
    : null;

  const isBandLiked = likedBands.some(
    (likedBand) => likedBand.slug === band.slug
  );

  const toggleLike = () => {
    if (!isLoggedIn) {
      alert("You must be logged in to like this band!");
      return;
    }
    isBandLiked ? removeBand(band.slug) : addBand(band);
  };

  const getShortBio = (bio) => {
    const maxLength = 150;
    return bio.length > maxLength ? bio.substring(0, maxLength) + "..." : bio;
  };

  // Fetch Spotify data for the band
  useEffect(() => {
    const fetchSpotifyData = async () => {
      if (!band?.name) return;

      try {
        const clientId = "f363ca326bce47dd906f8ed0c009f614"; // Your Spotify Client ID
        const clientSecret = "b5391d7518a241bb9fecba7e64b7dd04"; // Your Spotify Client Secret

        // Fetch Spotify Access Token
        const tokenResponse = await fetch(
          "https://accounts.spotify.com/api/token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
            },
            body: "grant_type=client_credentials",
          }
        );

        const tokenData = await tokenResponse.json();
        const token = tokenData.access_token;

        // Search for the artist
        const response = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(
            band.name
          )}&type=artist&limit=1`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        const artist = data.artists?.items[0];

        if (artist) {
          setSpotifyEmbedUrl(
            `https://open.spotify.com/embed/artist/${artist.id}`
          );
        }
      } catch (error) {
        console.error("Error fetching Spotify data:", error);
      }
    };

    fetchSpotifyData();
  }, [band?.name]);

  return (
    <SheetContent
      className="flex flex-col p-6"
      style={{ height: "100vh", maxHeight: "100vh" }}
    >
      <SheetHeader>
        <SheetTitle className="text-4xl font-bold text-primary">
          {band?.name || "No Band Selected"}
        </SheetTitle>

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

        <div className="font-semibold text-white">
          <h3 className="mb-2 text-sm font-bold text-primary">
            Genre:{" "}
            <span className="ml-1 text-sm text-gray-300">{band?.genre}</span>
          </h3>
        </div>

        <div className="font-semibold text-white">
          <h3 className="mb-2 text-sm font-bold text-primary">
            Members:{" "}
            <span className="ml-1 text-sm text-gray-300">
              {band?.members?.join(", ") || "No members listed"}
            </span>
          </h3>
        </div>

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

        {/* Spotify embedded player */}
        {spotifyEmbedUrl && (
          <div className="mt-6">
            <iframe
              src={spotifyEmbedUrl}
              width="100%"
              height="380"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              className="rounded-lg"
            ></iframe>
          </div>
        )}
      </div>
    </SheetContent>
  );
}
