'use client' // Angiver, at komponenten kører på klient-siden i Next.js.

// Importerer nødvendige hooks og komponenter.
import { useState } from 'react'
import {
  Menubar, // Overordnet menubjælke.
  MenubarContent, // Indholdet i menupunkterne.
  MenubarItem, // Enkelte menupunkter.
  MenubarMenu, // Indpakker menupunkter.
  MenubarTrigger // Triggermekanisme til at åbne menupunkter.
} from '@/components/ui/menubar'

import UserSettings from '@/components/usersettings/UserSettings' // Komponent til brugerindstillinger.
import ArtistList from '@/components/artistList/ArtistList' // Komponent til visning af liste over kunstnere.
import { getSchedule, getBands } from '@/lib/database' // Funktioner til at hente data fra databasen.

export default function LoginPage () {
  // Tilstandshåndtering.
  const [activeComponent, setActiveComponent] = useState('UserSettings') // Styrer, hvilken komponent der vises.
  const [isLoggedIn, setIsLoggedIn] = useState(true) // Styrer brugerens loginstatus.
  const [stages, setStages] = useState([]) // Holder data om scener og deres skemaer.

  // Funktion til at hente og strukturere data om likede kunstnere.
  const fetchLikedArtists = async () => {
    try {
      // Henter skemaer og bands parallelt.
      const [midgard, vanaheim, jotunheim, allBands] = await Promise.all([
        getSchedule('Midgard'), // Henter skema for scenen "Midgard".
        getSchedule('Vanaheim'), // Henter skema for scenen "Vanaheim".
        getSchedule('Jotunheim'), // Henter skema for scenen "Jotunheim".
        getBands() // Henter listen over bands.
      ])

      // Mapper bands til deres genrer for hurtig opslag.
      const genreMap = allBands.reduce((acc, band) => {
        acc[band.name.toLowerCase().trim()] = band.genre // Gør bandets navn til nøgle.
        return acc
      }, {})

      // Tilføjer genrer til skemaet baseret på bandets navn.
      const mapGenresToSchedule = schedule => {
        if (!schedule) {
          return {}
        }
        const mappedSchedule = {}
        Object.keys(schedule).forEach(day => {
          mappedSchedule[day] = schedule[day]?.map(event => ({
            ...event,
            genre: genreMap[event.act?.toLowerCase().trim()] || 'Unknown' // Hvis genren ikke findes, sættes "Unknown".
          }))
        })
        return mappedSchedule
      }

      // Samler data om scener med deres opdaterede skemaer.
      const stageData = [
        { name: 'Midgard', stageSchedule: mapGenresToSchedule(midgard) },
        { name: 'Vanaheim', stageSchedule: mapGenresToSchedule(vanaheim) },
        { name: 'Jotunheim', stageSchedule: mapGenresToSchedule(jotunheim) }
      ]
      setStages(stageData) // Opdaterer tilstanden med de bearbejdede data.
    } catch (error) {
      console.error('Error fetching liked artists:', error) // Logger fejl, hvis noget går galt.
    }
  }

  // Funktion til at vælge og vise den korrekte komponent baseret på `activeComponent`.
  const renderComponent = () => {
    switch (activeComponent) {
      case 'UserSettings': // Viser brugerindstillinger.
        return <UserSettings />
      case 'LikedArtists': // Viser listen over likede kunstnere.
        return (
          <div className='px-10'>
            <div className='flex flex-col items-center justify-center my-12'>
              <h1 className='text-4xl font-bold text-center text-white font-titan'>
                Liked Artists
              </h1>
            </div>
            <ArtistList stages={stages} bands={[]} onlyLiked />
          </div>
        )
      default: // Hvis der ikke er nogen matchende komponent.
        return null
    }
  }

  // Returnerer UI'et.
  return (
    <>
      <div className='flex justify-center mt-6'>
        <Menubar>
          <MenubarMenu>
            {/* Trigger til hovedmenuen */}
            <MenubarTrigger>My Information</MenubarTrigger>
            <MenubarContent>
              {/* Menuvalg til at vise brugerindstillinger */}
              <MenubarItem
                onClick={() => setActiveComponent('UserSettings')} // Skifter til "UserSettings".
                className='text-primary'
              >
                User Settings
              </MenubarItem>
              {isLoggedIn && ( // Tjekker, om brugeren er logget ind.
                <MenubarItem
                  onClick={() => {
                    setActiveComponent('LikedArtists') // Skifter til "LikedArtists".
                    fetchLikedArtists() // Henter data om likede kunstnere.
                  }}
                  className='text-primary'
                >
                  Liked Artists
                </MenubarItem>
              )}
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
      <section>
        {/* Viser den valgte komponent */}
        <div>{renderComponent()}</div>
      </section>
    </>
  )
}
