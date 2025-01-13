'use client' // Angiver, at denne komponent kører på klient-siden (Next.js).

// Importerer nødvendige hooks og komponenter.
import { useState, useEffect } from 'react'
import Tickets from '@/components/ticket/Ticket' // Komponent til valg af billetter.
import Camping from '@/components/camping/Camping' // Komponent til valg af campingplads.
import Payment from '@/components/payment/Payment' // Komponent til betalingshåndtering.
import Basket from '@/components/basket/Basket' // Komponent, der viser indholdet af kurven.
import Info from '@/components/info/Info' // Komponent til visning af reservationsoplysninger.
import useBookingStore from '@/stores/useBookingStore' // Zustand store til booking-relateret tilstand.
import Progress from '@/components/progress/Progress' // Komponent til visning af bookingprocesens fremskridt.

const Booking = () => {
  // Lokal tilstand for den aktuelle visning.
  const [currentView, setCurrentView] = useState('tickets') // Styrer, hvilken sektion der vises.

  // Henter nødvendige funktioner og værdier fra `useBookingStore`.
  const {
    resetBooking, // Nulstiller hele bookingen.
    resetBasket, // Tømmer kurven.
    timer, // Viser den resterende tid for reservationen.
    timerActive, // Indikerer, om timeren er aktiv.
    decrementTimer, // Reducerer timerens værdi.
    stopTimer // Stopper timeren.
  } = useBookingStore()

  // Bruges til at nulstille kurven og stoppe timeren, når komponenten renderes.
  useEffect(() => {
    resetBasket() // Tømmer kurven.
    stopTimer() // Stopper eventuelle igangværende timere.
  }, [resetBasket, stopTimer])

  // Håndterer timeren, hvis den er aktiv.
  useEffect(() => {
    if (timerActive) {
      const interval = setInterval(() => {
        decrementTimer() // Reducerer timerens værdi med 1 sekund.
      }, 1000)

      return () => clearInterval(interval) // Rydder intervallet, når komponenten unmountes eller `timerActive` ændres.
    }
  }, [timerActive, decrementTimer])

  // Overvåger, om tiden er udløbet, og nulstiller bookingen, hvis timeren når 0.
  useEffect(() => {
    if (timer === 0 && timerActive) {
      alert('Din reservation er udløbet.') // Viser en advarsel.
      resetBooking() // Nulstiller bookingen.
      setCurrentView('tickets') // Går tilbage til billetvalg.
    }
  }, [timer, timerActive, resetBooking])

  // Håndterer "næste"-knappen i camping-sektionen.
  const handleCampingNext = async () => {
    const { campingSelection, createReservation, getTotalTents } =
      useBookingStore.getState() // Henter nuværende tilstand fra `useBookingStore`.
    const { area } = campingSelection // Henter det valgte campingområde.
    const totalTents = getTotalTents() // Henter det samlede antal telte.

    try {
      const reservationId = await createReservation(area, totalTents) // Opretter reservationen.
      if (reservationId) {
        console.log('Reservation oprettet:', reservationId)
        setCurrentView('info') // Skifter til info-sektionen.
      } else {
        alert('Kunne ikke oprette reservation. Prøv igen.') // Fejlhåndtering.
      }
    } catch (error) {
      console.error('Fejl under oprettelse af reservation:', error)
      alert('Noget gik galt. Prøv igen.')
    }
  }

  // Returnerer komponentens UI.
  return (
    <>
      {/* Timeren vises kun, hvis den er aktiv. */}
      {timerActive && (
        <div className='sticky top-0 z-20 py-2 mb-8 text-center bg-black border-t border-b text-primary border-primary'>
          Reservation expires in: {Math.floor(timer / 60)}:
          {String(timer % 60).padStart(2, '0')}{' '}
          {/* Viser minutter og sekunder. */}
        </div>
      )}

      <div className='max-w-5xl px-4 mx-auto mb-16'>
        <h1 className='mt-12 text-4xl font-bold text-center text-white font-titan'>
          Booking
        </h1>
        <Progress currentStep={currentView} />{' '}
        {/* Viser bookingprocessens fremskridt. */}
        <div className='flex flex-col md:grid md:grid-cols-[65%_30%] lg:justify-between gap-4'>
          {/* Sektionen for de forskellige visninger. */}
          <div className='ticket-selection'>
            {currentView === 'tickets' && (
              <Tickets onNext={() => setCurrentView('camping')} /> // Går til camping-sektionen.
            )}

            {currentView === 'camping' && (
              <Camping
                onNext={handleCampingNext} // Håndterer overgang til næste trin.
                onBack={() => setCurrentView('tickets')} // Går tilbage til billetvalg.
              />
            )}

            {currentView === 'info' && (
              <Info
                onNext={() => setCurrentView('payment')} // Går til betalingssektionen.
                onBack={() => setCurrentView('tickets')} // Går tilbage til billetvalg.
                setCurrentView={setCurrentView}
              />
            )}

            {currentView === 'payment' && (
              <Payment
                onBack={() => setCurrentView('info')} // Går tilbage til info-sektionen.
                setCurrentView={setCurrentView}
              />
            )}

            {currentView === 'purchased' && (
              <div>
                <h2 className='mb-4 text-2xl font-bold text-primary'>
                  Payment completed! Thank you for your order.
                </h2>
                <p className='mb-4 text-white'>
                  Reservation ID:{' '}
                  <span className='font-semibold'>
                    {useBookingStore.getState().reservationId}
                  </span>
                </p>
                <p className='mb-4'>
                  You can review your purchased items in the cart. Additionally,
                  a confirmation email with all your order details has been sent
                  to you.
                </p>
                <p>
                  Thank you for choosing us, and we hope you enjoy your
                  experience!
                </p>
              </div>
            )}
          </div>

          {/* Kurv-sektionen. */}
          <div className='basket-wrapper'>
            <Basket />
          </div>
        </div>
      </div>
    </>
  )
}

export default Booking
