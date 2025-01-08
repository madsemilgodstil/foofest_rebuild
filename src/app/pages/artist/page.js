import { getSchedule, getBands } from '@/lib/database'

import ArtistList from '@/components/artistList/ArtistList'

export default async function ArtistPage () {
  const [midgard, vanaheim, jotunheim, bands] = await Promise.all([
    getSchedule('Midgard'),
    getSchedule('Vanaheim'),
    getSchedule('Jotunheim'),
    getBands()
  ])

  const genreMap = bands.reduce((acc, band) => {
    acc[band.name.toLowerCase().trim()] = band.genre // Brug lowercase og trim
    return acc
  }, {})

  const mapGenresToSchedule = schedule => {
    const mappedSchedule = {}
    Object.keys(schedule).forEach(day => {
      mappedSchedule[day] = schedule[day].map(event => ({
        ...event,
        genre: genreMap[event.act?.toLowerCase().trim()] || 'Unknown'
      }))
    })
    return mappedSchedule
  }

  const stages = [
    { name: 'Midgard', stageSchedule: mapGenresToSchedule(midgard) },
    { name: 'Vanaheim', stageSchedule: mapGenresToSchedule(vanaheim) },
    { name: 'Jotunheim', stageSchedule: mapGenresToSchedule(jotunheim) }
  ]

  return (
    <div className='px-10'>
      <div className='flex flex-col items-center justify-center my-12'>
        <h1 className='text-4xl font-bold text-center text-white font-titan'>
          All Artists
        </h1>
      </div>
      <ArtistList stages={stages} bands={bands} />
    </div>
  )
}
