import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Funktion til at konvertere korte ugedagsnavne til fulde navne
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
  return days[shortDay] || shortDay; // Hvis dagen ikke findes, returneres det originale input
}

// function getImageUrl(band) {
//   const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
//   return band.logo?.startsWith("https://")
//     ? band.logo
//     : `${baseUrl}/logos/${band.logo}`;
// }

export default function BandSlider({ band, bandSchedule }) {
  const imageUrl = band?.logo
    ? band.logo.startsWith("https://")
      ? band.logo
      : `${process.env.NEXT_PUBLIC_API_URL || ""}/logos/${band.logo}`
    : null;

  return (
    <SheetContent
      className="flex flex-col p-6"
      style={{ height: "100vh", maxHeight: "100vh" }}
    >
      <SheetHeader>
        <SheetTitle className="text-4xl font-bold text-primary">
          {band?.name || "No Band Selected"}
        </SheetTitle>
        <SheetDescription className="text-gray-400">
          Scroll for more information
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 mt-4 space-y-4 overflow-y-auto">
        <div className="flex justify-center py-4">
          {imageUrl ? (
            <Avatar className="w-48 h-48">
              <AvatarImage src={imageUrl} alt={band?.name || "Band"} />
              <AvatarFallback>{band?.name || "?"}</AvatarFallback>
            </Avatar>
          ) : (
            <div>No image available</div>
          )}
        </div>
        <div className="my-2 text-lg">
          {band?.bio || "Biography not available."}
        </div>
        <div className="font-semibold text-white">
          <h3 className="inline-flex mb-2 text-sm font-bold text-primary">
            Genre:
            <span className="ml-1 text-sm text-gray-300">{band?.genre}</span>
          </h3>
        </div>
        <div className="font-semibold text-white">
          <h3 className="inline-flex mb-2 text-sm font-bold text-primary">
            Members:
            <span className="ml-1 text-sm text-gray-300">
              {band?.members?.join(", ") || "No members listed"}
            </span>
          </h3>
        </div>
        <div className="font-semibold text-white">
          <h3 className="inline-flex items-center mb-2 text-sm font-bold text-primary">
            Schedule:
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
