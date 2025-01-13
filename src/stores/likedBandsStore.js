// Importerer 'create' fra Zustand-biblioteket
import { create } from 'zustand'

// Opretter en Zustand store for at håndtere tilstanden af 'likedBands'
const useLikedBandsStore = create((set, get) => ({
  // Initial tilstand: en tom liste over bands, som brugeren har liket
  likedBands: [],

  // Funktion til at tilføje et band til listen over likede bands
  addBand: band => {
    // Opretter en opdateret liste ved at tilføje det nye band til den eksisterende liste
    const updatedBands = [...get().likedBands, band]

    // Opdaterer Zustand-storens tilstand med den nye liste
    set({ likedBands: updatedBands })

    // Gemmer den opdaterede liste i localStorage for at bevare data mellem sessions
    localStorage.setItem('likedBands', JSON.stringify(updatedBands))

    // Logger handlingen for debugging
    console.log('Added band:', band)
    console.log('Updated liked bands:', updatedBands)
  },

  // Funktion til at fjerne et band fra listen baseret på dets 'slug'
  removeBand: bandSlug => {
    // Filtrerer listen og ekskluderer bandet med det angivne 'slug'
    const updatedBands = get().likedBands.filter(b => b.slug !== bandSlug)

    // Opdaterer Zustand-storens tilstand med den nye liste
    set({ likedBands: updatedBands })

    // Opdaterer localStorage med den opdaterede liste
    localStorage.setItem('likedBands', JSON.stringify(updatedBands))

    // Logger handlingen for debugging
    console.log('Removed band:', bandSlug)
    console.log('Updated liked bands:', updatedBands)
  },

  // Funktion til at indlæse likede bands fra localStorage
  loadLikedBands: () => {
    // Henter gemte bands fra localStorage og falder tilbage til en tom liste, hvis der ikke er nogen data
    const savedBands = JSON.parse(localStorage.getItem('likedBands')) || []

    // Opdaterer Zustand-storens tilstand med de indlæste bands
    set({ likedBands: savedBands })

    // Logger handlingen for debugging
    console.log('Loaded liked bands from localStorage:', savedBands)
  },

  // Funktion til at få adgang til den aktuelle liste over likede bands
  getLikedBands: () => get().likedBands,

  // Funktion til at kontrollere, om et band er liket baseret på dets 'slug'
  isBandLiked: slug => get().likedBands.some(band => band.slug === slug)
}))

// Eksporterer store, så den kan bruges i andre dele af applikationen
export default useLikedBandsStore
