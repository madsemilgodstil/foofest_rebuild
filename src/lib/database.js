// URL til API'et. Værdien hentes fra miljøvariablerne i Next.js
const url = process.env.NEXT_PUBLIC_API_URL

// Standard headers, der bruges i flere fetch-anmodninger
const headersList = {
  Accept: '/', // Angiver, hvilke formater serveren kan returnere
  'Content-Type': 'application/json', // Angiver, at vi sender JSON-data
  Prefer: 'return=representation' // Beder serveren returnere den opdaterede repræsentation af data
}

// GET: Henter alle bands fra API'et
export async function getBands () {
  const response = await fetch(url + '/bands', {
    method: 'GET', // Angiver HTTP-metoden
    headers: headersList // Sender standardheadersne med
  })

  const data = await response.json() // Konverterer svaret til JSON
  return data // Returnerer de hentede bands
}

// GET: Henter skemaet for en bestemt scene
export async function getSchedule (stage) {
  const response = await fetch(`${url}/schedule`, {
    method: 'GET', // Angiver HTTP-metoden
    headers: headersList // Sender standardheadersne med
  })

  const data = await response.json() // Konverterer svaret til JSON

  return data[stage] // Returnerer skemaet for den ønskede scene
}

// GET: Henter hele skemaet (brugt til en slider eller overordnet visning)
export async function getScheduleSlider () {
  try {
    const response = await fetch(`${url}/schedule`, {
      method: 'GET',
      headers: headersList
    })

    // Tjekker om anmodningen var succesfuld
    if (!response.ok) {
      throw new Error(`Failed to fetch schedule: ${response.status}`)
    }

    const data = await response.json()
    return data || {} // Returnerer skemaet eller en tom objekt, hvis der ikke er noget data
  } catch (error) {
    console.error('Error fetching schedule:', error)
    return {} // Returnerer en tom objekt, hvis der opstod en fejl
  }
}

// GET: Henter data om campingområder og tilgængelige pladser
export async function getCampingAreas () {
  const response = await fetch(`${url}/available-spots`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
  const data = await response.json() // Konverterer svaret til JSON
  return data // Returnerer de tilgængelige campingområder
}

// PUT: Reserverer en campingplads
export async function reserveSpot (area, totalTents) {
  // Opretter kroppen til anmodningen som JSON
  const bodyContent = JSON.stringify({
    area: area, // Navnet på campingområdet
    amount: totalTents // Antal telte, der skal reserveres
  })

  const response = await fetch(`${url}/reserve-spot`, {
    method: 'PUT', // PUT bruges til at opdatere eller reservere ressourcer
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: bodyContent // Sender kroppen med data til reservationen
  })

  const data = await response.json()

  return {
    id: data.id, // ID for reservationen
    timeout: data.timeout // Timeout-værdi for, hvor længe reservationen er gyldig
  }
}

// POST: Fuldfører en eksisterende reservation baseret på dens ID
export async function fullfillReservation (reservationId) {
  // Opretter kroppen til anmodningen som JSON
  const bodyContent = JSON.stringify({
    id: reservationId // ID for den reservation, der skal fuldføres
  })

  const response = await fetch(`${url}/fullfill-reservation`, {
    method: 'POST', // POST bruges til at fuldføre eller indsende data
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: bodyContent // Sender kroppen med reservationens ID
  })

  const data = await response.json() // Konverterer svaret til JSON
  return data // Returnerer dataen fra serveren (f.eks. bekræftelse på fuldførelse)
}
