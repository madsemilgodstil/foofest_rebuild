import { getSchedule, getBands } from '@/lib/database'
// Importerer funktioner til at hente skemaer (schedule) og bands fra databasen.

import ArtistList from '@/components/artistList/ArtistList'
// Importerer ArtistList-komponenten, der bruges til at vise en liste over kunstnere.

export default async function ArtistPage () {
  // Definerer en asynkron funktion, der fungerer som en side i Next.js.

  const [midgard, vanaheim, jotunheim, bands] = await Promise.all([
    getSchedule('Midgard'),
    getSchedule('Vanaheim'),
    getSchedule('Jotunheim'),
    getBands()
  ])
  // Henter data parallelt for at optimere ydeevnen:
  // - Skemaer for scenerne 'Midgard', 'Vanaheim' og 'Jotunheim' via `getSchedule`.
  // - Listen over bands via `getBands`.

  const genreMap = bands.reduce((acc, band) => {
    acc[band.name.toLowerCase().trim()] = band.genre // Mapper hvert bands navn (lowercase og trimmet) til deres genre.
    return acc
  }, {})
  // Opretter en map (key-value-par), hvor bandets navn er nøgle, og genren er værdien.
  // Dette gør det nemt at slå genrer op baseret på bandnavne.

  const mapGenresToSchedule = schedule => {
    const mappedSchedule = {}
    Object.keys(schedule).forEach(day => {
      mappedSchedule[day] = schedule[day].map(event => ({
        ...event,
        genre: genreMap[event.act?.toLowerCase().trim()] || 'Unknown'
        // Tildeler en genre til hvert event baseret på bandnavnet.
        // Hvis bandet ikke findes i `genreMap`, tildeles genren 'Unknown'.
      }))
    })
    return mappedSchedule
  }
  // Funktion til at opdatere skemaet med genreoplysninger for hvert event.
  // Mapper genrer til hver dag i skemaet.

  const stages = [
    { name: 'Midgard', stageSchedule: mapGenresToSchedule(midgard) },
    { name: 'Vanaheim', stageSchedule: mapGenresToSchedule(vanaheim) },
    { name: 'Jotunheim', stageSchedule: mapGenresToSchedule(jotunheim) }
  ]
  // Opretter en liste over scener med deres respektive skemaer.
  // Hvert skema indeholder nu genrer, der er mappet fra bandnavne.

  return (
    <div className='px-10'>
      {/* Wrapper til layout med padding */}
      <div className='flex flex-col items-center justify-center my-12'>
        {/* Centreret header med tekst */}
        <h1 className='text-4xl font-bold text-center text-white font-titan'>
          All Artists
        </h1>
      </div>
      <ArtistList stages={stages} bands={bands} />
      {/* Renders ArtistList-komponenten med `stages` og `bands` som props. */}
    </div>
  )
}
