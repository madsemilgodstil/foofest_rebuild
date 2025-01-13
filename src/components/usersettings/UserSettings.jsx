"use client"; // Angiver, at denne komponent kører på klient-siden (Next.js).

// Importerer nødvendige hooks og komponenter.
import { useState, useEffect } from "react"; // Hooks til tilstandshåndtering og sideeffekter.
import { Button } from "@/components/ui/button"; // UI-komponent til knapper.
import { useAuth } from "@/context/AuthContext"; // Importerer autentifikationskonteksten.

const url = process.env.NEXT_PUBLIC_USER_API_URL; // URL til API'et for brugerdata.
const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // API-nøgle til Supabase.
const authHeader = `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`; // Autorisationstoken til API'et.

export default function UserSettings() {
  const { user, logout } = useAuth(); // Henter den aktuelle bruger og logout-funktion fra AuthContext.
  const [currentData, setCurrentData] = useState({}); // Tilstand til gemning af brugerens data.
  const [name, setName] = useState(""); // Tilstand til at gemme og opdatere brugernavn.
  const [email, setEmail] = useState(""); // Tilstand til at gemme og opdatere email.
  const [password, setPassword] = useState(""); // Tilstand til at gemme og opdatere password.
  const [message, setMessage] = useState(""); // Tilstand til at vise fejl- eller succesbeskeder.

  // Funktion til at hente data for den aktuelle bruger fra API'et.
  const fetchCurrentUser = async () => {
    if (!user) return; // Hvis der ikke er en bruger, gør ingenting.

    try {
      const response = await fetch(`${url}?id=eq.${user.id}`, {
        method: "GET", // HTTP GET-metode for at hente data.
        headers: {
          "Content-Type": "application/json", // Angiver dataformatet.
          apikey: apiKey, // API-nøglen for godkendelse.
          Authorization: authHeader, // Autorisationsheader.
        },
      });

      if (!response.ok) throw new Error("Failed to fetch user data."); // Fejlhåndtering, hvis anmodningen mislykkes.

      const data = await response.json();
      if (data.length > 0) {
        setCurrentData(data[0]); // Gemmer den hentede brugerdata i tilstanden.
      }
    } catch (error) {
      setMessage(error.message); // Viser fejlbeskeden til brugeren.
    }
  };

  // Henter brugerdata, når komponenten renderes første gang eller når `user` ændres.
  useEffect(() => {
    fetchCurrentUser();
  }, [user]);

  // Validerer et password for at sikre, at det opfylder minimumskravene.
  const validatePassword = (password) => {
    const hasLetter = /[a-zA-Z]/.test(password); // Indeholder mindst ét bogstav.
    const hasDigit = /\d/.test(password); // Indeholder mindst ét tal.
    return password.length >= 6 && hasLetter && hasDigit; // Mindst 6 tegn, ét bogstav og ét tal.
  };

  // Håndterer opdatering af brugerdata (navn, email eller password).
  const handleUpdate = async (field, value) => {
    if (!user) {
      setMessage("You must be logged in to update your settings.");
      return;
    }

    // Validerer password, hvis det er feltet der opdateres.
    if (field === "user_password" && !validatePassword(value)) {
      setMessage(
        "Password must be at least 6 characters long and include at least one letter and one digit."
      );
      return;
    }

    try {
      const response = await fetch(`${url}?id=eq.${user.id}`, {
        method: "PATCH", // PATCH bruges til delvise opdateringer.
        headers: {
          "Content-Type": "application/json",
          apikey: apiKey,
          Authorization: authHeader,
        },
        body: JSON.stringify({ [field]: value }), // Sender felt og værdi som JSON.
      });

      if (response.status === 204 || response.ok) {
        const friendlyFieldName = {
          user_name: "Name",
          user_email: "Email",
          user_password: "Password",
        }[field];

        setMessage(`${friendlyFieldName} updated successfully!`); // Succesbesked.
        fetchCurrentUser(); // Henter opdaterede data for at vise dem.
        return;
      }

      const result = await response.json();
      throw new Error(result.message || `Failed to update ${field}.`);
    } catch (error) {
      setMessage(error.message); // Viser fejlbesked.
    }
  };

  // Sletter den aktuelle bruger.
  const handleDeleteAccount = async () => {
    if (!user) {
      setMessage("You must be logged in to delete your account.");
      return;
    }

    // Bekræfter med brugeren, om de vil slette kontoen.
    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return; // Stopper, hvis brugeren annullerer.
    }

    try {
      const response = await fetch(`${url}?id=eq.${user.id}`, {
        method: "DELETE", // DELETE-metode for at fjerne brugeren.
        headers: {
          "Content-Type": "application/json",
          apikey: apiKey,
          Authorization: authHeader,
        },
      });

      if (response.status === 204 || response.ok) {
        setMessage("Your account has been deleted successfully."); // Succesbesked.
        logout(); // Logger brugeren ud og rydder sessionen.
        return;
      }

      const result = await response.json();
      throw new Error(result.message || "Failed to delete account.");
    } catch (error) {
      setMessage(error.message); // Viser fejlbesked.
    }
  };

  return (
    <div className="max-w-lg p-8 mx-auto mt-16 text-white bg-black rounded-lg shadow-lg">
      <h2 className="mb-8 text-3xl font-bold text-center">User Settings</h2>
      {message && (
        <p className="mb-6 text-sm text-center text-red-500">{message}</p>
      )}

      {/* Sektion for opdatering af navn */}
      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-primary">
          Name
        </label>
        <p className="mb-2 text-sm text-gray-400 ">
          Current Name: {currentData.user_name || "Loading..."}
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 text-white bg-gray-800 rounded-md outline-none focus:ring-1 focus:ring-darkorange"
          placeholder="Enter new name"
        />
        <Button
          onClick={() => handleUpdate("user_name", name)}
          className="w-full py-2 mt-3 font-semibold text-white bg-orange-600 rounded-md hover:bg-orange-700"
        >
          Update Name
        </Button>
      </div>

      {/* Sektion for opdatering af email */}
      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-primary">
          Email
        </label>
        <p className="mb-2 text-sm text-gray-400">
          Current Email: {currentData.user_email || "Loading..."}
        </p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 text-white bg-gray-800 rounded-md outline-none focus:ring-1 focus:ring-darkorange"
          placeholder="Enter new email"
        />
        <Button
          onClick={() => handleUpdate("user_email", email)}
          className="w-full py-2 mt-3 font-semibold text-white bg-orange-600 rounded-md hover:bg-orange-700"
        >
          Update Email
        </Button>
      </div>

      {/* Sektion for opdatering af password */}
      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-primary">
          Password
        </label>
        <p className="mb-2 text-sm text-gray-400">
          Current Password: {currentData.user_password || "Hidden for security"}
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 text-white bg-gray-800 rounded-md outline-none focus:ring-1 focus:ring-darkorange"
          placeholder="Enter new password"
        />
        <Button
          onClick={() => handleUpdate("user_password", password)}
          className="w-full py-2 mt-3 font-semibold text-white bg-orange-600 rounded-md hover:bg-orange-700"
        >
          Update Password
        </Button>
      </div>

      {/* Knappen til at slette kontoen */}
      <div className="mt-8">
        <Button
          onClick={handleDeleteAccount}
          className="w-full py-2 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          Delete Account
        </Button>
      </div>
    </div>
  );
}
