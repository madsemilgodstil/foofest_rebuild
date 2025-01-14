import Schedule from '@/components/schedule/Schedule'
// Importerer Schedule-komponenten, der bruges til at vise programmet for festivalen.

import { getSchedule, getBands } from '@/lib/database'
// Importerer funktioner til at hente skemaer og bands fra databasen.

export default async function ProgramPage () {
  // Definerer en asynkron funktion, der fungerer som en side i Next.js.

  const [midgard, vanaheim, jotunheim, bands] = await Promise.all([
    getSchedule('Midgard'),
    getSchedule('Vanaheim'),
    getSchedule('Jotunheim'),
    getBands()
  ])
  // Henter data parallelt for at optimere ydeevnen:
  // - Skemaer for scenerne 'Midgard', 'Vanaheim' og 'Jotunheim'.
  // - Listen over bands via `getBands`.

  const genreMap = bands.reduce((acc, band) => {
    acc[band.name.toLowerCase().trim()] = band.genre // Mapper hvert bands navn (lowercase og trimmet) til deres genre.
    return acc
  }, {})
  // Opretter en map (key-value-par), hvor bandets navn er nøgle, og genren er værdien.
  // Dette gør det nemt at slå genrer op baseret på bandnavne.

  const stages = [
    { name: 'Midgard', stageSchedule: mapGenresToSchedule(midgard, genreMap) },
    {
      name: 'Vanaheim',
      stageSchedule: mapGenresToSchedule(vanaheim, genreMap)
    },
    {
      name: 'Jotunheim',
      stageSchedule: mapGenresToSchedule(jotunheim, genreMap)
    }
  ]
  // Opretter en liste over scener, hvor hvert skema har genrer mappet til de respektive events.

  return (
    <div className='flex flex-col items-center justify-center min-h-screen gap-6'>
      {/* Wrapper til centrering af indhold og layout med minimum højde */}
      <h1 className='mt-12 text-4xl font-bold text-center text-white font-titan'>
        Festival program
      </h1>
      {/* Header med titel */}
      <Schedule stages={stages} bands={bands} />
      {/* Renderer Schedule-komponenten med data om scener og bands som props */}
    </div>
  )
}

function mapGenresToSchedule (schedule, genreMap) {
  // Funktion til at mappe genrer til hvert event i skemaet.
  const mappedSchedule = {}
  Object.keys(schedule).forEach(day => {
    mappedSchedule[day] = schedule[day].map(event => ({
      ...event,
      genre: genreMap[event.act?.toLowerCase().trim()] || 'Unknown'
      // Tilføjer genre til hvert event baseret på bandnavn fra `genreMap`.
      // Hvis bandet ikke findes, tildeles 'Unknown' som standardgenre.
    }))
  })
  return mappedSchedule
}
