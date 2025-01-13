'use client'

import { useState } from 'react'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger
} from '@/components/ui/menubar'

import UserSettings from '@/components/usersettings/UserSettings'
import ArtistList from '@/components/artistList/ArtistList'
import { getSchedule, getBands } from '@/lib/database'

export default function LoginPage () {
  const [activeComponent, setActiveComponent] = useState('UserSettings')
  const [isLoggedIn, setIsLoggedIn] = useState(true)
  const [stages, setStages] = useState([])

  const fetchLikedArtists = async () => {
    try {
      const [midgard, vanaheim, jotunheim, allBands] = await Promise.all([
        getSchedule('Midgard'),
        getSchedule('Vanaheim'),
        getSchedule('Jotunheim'),
        getBands()
      ])

      const genreMap = allBands.reduce((acc, band) => {
        acc[band.name.toLowerCase().trim()] = band.genre
        return acc
      }, {})

      const mapGenresToSchedule = schedule => {
        if (!schedule) {
          return {}
        }
        const mappedSchedule = {}
        Object.keys(schedule).forEach(day => {
          mappedSchedule[day] = schedule[day]?.map(event => ({
            ...event,
            genre: genreMap[event.act?.toLowerCase().trim()] || 'Unknown'
          }))
        })
        return mappedSchedule
      }

      const stageData = [
        { name: 'Midgard', stageSchedule: mapGenresToSchedule(midgard) },
        { name: 'Vanaheim', stageSchedule: mapGenresToSchedule(vanaheim) },
        { name: 'Jotunheim', stageSchedule: mapGenresToSchedule(jotunheim) }
      ]
      setStages(stageData)
    } catch (error) {}
  }

  const renderComponent = () => {
    switch (activeComponent) {
      case 'UserSettings':
        return <UserSettings />
      case 'LikedArtists':
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
      default:
        return null
    }
  }

  return (
    <>
      <div className='flex justify-center mt-6'>
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>My Information</MenubarTrigger>
            <MenubarContent>
              <MenubarItem
                onClick={() => setActiveComponent('UserSettings')}
                className='text-primary'
              >
                User Settings
              </MenubarItem>
              {isLoggedIn && (
                <MenubarItem
                  onClick={() => {
                    setActiveComponent('LikedArtists')
                    fetchLikedArtists()
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
        <div>{renderComponent()}</div>
      </section>
    </>
  )
}
