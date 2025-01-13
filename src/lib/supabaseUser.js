// Henter API-URL og nøgle fra miljøvariablerne
const url = process.env.NEXT_PUBLIC_USER_API_URL // Base-URL for bruger-API
const api = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Supabase API-nøgle
const auth = `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` // Autorisation header med API-nøglen

// Standard headers til alle fetch-anmodninger
const headersList = {
  Accept: 'application/json', // Accepter JSON-format
  'Content-Type': 'application/json', // Angiver at vi sender JSON
  Prefer: 'return=representation', // Beder om at få returneret repræsentationen af opdaterede data
  apikey: api, // API-nøgle til Supabase
  Authorization: auth // Autorisation med "Bearer" token
}

// GET: Henter alle brugere
export async function getUsers () {
  try {
    const response = await fetch(url, {
      method: 'GET', // HTTP GET-metode
      headers: headersList // Bruger standardheaders
    })

    // Tjekker om anmodningen var succesfuld
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`)
    }

    const data = await response.json() // Konverterer svaret til JSON
    return data // Returnerer listen af brugere
  } catch (error) {
    console.error('Supabase getUsers error:', error)
    throw error // Viderefører fejlen til den kaldende funktion
  }
}

// GET: Henter en bruger baseret på email og password
export async function getUserByCredentials (email, password) {
  try {
    const response = await fetch(
      `${url}?user_email=eq.${email}&user_password=eq.${password}`, // Filter i URL'en
      {
        method: 'GET',
        headers: headersList
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`)
    }

    const data = await response.json()
    return data.length > 0 ? data[0] : null // Returnerer brugeren, hvis fundet, ellers null
  } catch (error) {
    console.error('Supabase getUserByCredentials error:', error)
    throw error
  }
}

// POST: Opretter en ny bruger
export async function createUser (userData) {
  try {
    const response = await fetch(url, {
      method: 'POST', // HTTP POST-metode
      headers: headersList,
      body: JSON.stringify({
        user_name: userData.user_name, // Brugerens navn
        user_email: userData.user_email, // Email
        user_password: userData.user_password, // Password
        user_booking_id: userData.user_booking_id || null // Booking-ID (valgfrit)
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Supabase createUser error response:', error)
      throw new Error(`Error creating user: ${error.message}`)
    }

    const data = await response.json()
    return data // Returnerer dataen om den oprettede bruger
  } catch (error) {
    console.error('Supabase createUser error:', error)
    throw error
  }
}

// PATCH: Opdaterer en brugers information
export async function updateUser (userId, updates) {
  try {
    const response = await fetch(`${url}?id=eq.${userId}`, {
      method: 'PATCH', // HTTP PATCH-metode (partiel opdatering)
      headers: headersList,
      body: JSON.stringify(updates) // De opdaterede felter
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Error updating user: ${error.message}`)
    }

    const data = await response.json()
    return data // Returnerer de opdaterede brugerdata
  } catch (error) {
    console.error('Supabase updateUser error:', error)
    throw error
  }
}

// PUT: Erstatter en brugers information
export async function replaceUser (userId, userData) {
  try {
    const response = await fetch(`${url}?id=eq.${userId}`, {
      method: 'PUT', // HTTP PUT-metode (fuld erstatning)
      headers: headersList,
      body: JSON.stringify({
        user_name: userData.user_name, // Brugerens navn
        user_email: userData.user_email, // Email
        user_password: userData.user_password, // Password
        user_booking_id: userData.user_booking_id // Booking-ID
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Error replacing user: ${error.message}`)
    }

    const data = await response.json()
    return data // Returnerer de erstattede brugerdata
  } catch (error) {
    console.error('Supabase replaceUser error:', error)
    throw error
  }
}

// DELETE: Sletter en bruger
export async function deleteUser (userId) {
  try {
    const response = await fetch(`${url}?id=eq.${userId}`, {
      method: 'DELETE', // HTTP DELETE-metode
      headers: headersList
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Error deleting user: ${error.message}`)
    }

    return { message: 'User deleted successfully.' } // Returnerer en succes-besked
  } catch (error) {
    console.error('Supabase deleteUser error:', error)
    throw error
  }
}
