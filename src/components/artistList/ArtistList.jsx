"use client";

import { useEffect } from "react";
import useLikedBandsStore from "@/stores/likedBandsStore";
import BandSlider from "@/components/bandSlider/BandSlider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";

function getImageUrl(band) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  return band?.logo?.startsWith("https://")
    ? band.logo
    : band?.logo
    ? `${baseUrl}/logos/${band.logo}`
    : null;
}

const ArtistList = ({ stages = [], bands = [], onlyLiked = false }) => {
  const { likedBands, addBand, removeBand, loadLikedBands } =
    useLikedBandsStore();

  useEffect(() => {
    loadLikedBands(); // Load liked bands from localStorage
  }, [loadLikedBands]);

  const filteredBands = onlyLiked ? likedBands : bands;

  const isBandLiked = (slug) => likedBands.some((band) => band.slug === slug);

  const toggleLike = (band) => {
    if (isBandLiked(band.slug)) {
      removeBand(band.slug);
    } else {
      addBand(band);
    }
  };

  const getBandSchedule = (bandName) => {
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
              });
            }
          });
        });
      }
    });
    return bandSchedule;
  };

  return (
    <>
      {filteredBands.length === 0 ? (
        <p className="mt-6 text-lg text-center text-primary">
          {onlyLiked ? "No artists liked yet!" : "No artists found!"}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-8 mx-0 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:mx-8">
          {filteredBands.map((band) => {
            const imageUrl = getImageUrl(band);
            const isLiked = isBandLiked(band.slug);
            const bandSchedule = getBandSchedule(band.name);

            return (
              <Sheet key={band.slug}>
                <SheetTrigger asChild>
                  <Card className="transition duration-300 ease-in-out border-2 cursor-pointer hover:scale-105 hover:border-primary rounded-xl">
                    <CardContent className="p-0">
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
                        {/* Like icon */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(band);
                          }}
                          className={`absolute top-2 right-2 w-10 h-10 flex items-center justify-center rounded-full border-2 bg-black ${
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
                <BandSlider
                  band={band}
                  bandSchedule={bandSchedule}
                  toggleLike={() => toggleLike(band)}
                  isLiked={isLiked}
                />
              </Sheet>
            );
          })}
        </div>
      )}
    </>
  );
};

export default ArtistList;
