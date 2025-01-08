import { create } from 'zustand'

const useLikedBandsStore = create((set, get) => ({
  likedBands: [],

  // Tilføj band til liked liste
  addBand: band => {
    const updatedBands = [...get().likedBands, band]
    set({ likedBands: updatedBands })
    localStorage.setItem('likedBands', JSON.stringify(updatedBands))
    console.log('Added band:', band)
    console.log('Updated liked bands:', updatedBands)
  },

  // Fjern band fra liked liste
  removeBand: bandSlug => {
    const updatedBands = get().likedBands.filter(b => b.slug !== bandSlug)
    set({ likedBands: updatedBands })
    localStorage.setItem('likedBands', JSON.stringify(updatedBands))
    console.log('Removed band:', bandSlug)
    console.log('Updated liked bands:', updatedBands)
  },

  // Indlæs bands fra localStorage
  loadLikedBands: () => {
    const savedBands = JSON.parse(localStorage.getItem('likedBands')) || []
    set({ likedBands: savedBands })
    console.log('Loaded liked bands from localStorage:', savedBands)
  },

  // Get only liked bands
  getLikedBands: () => get().likedBands,

  // Check if a band is liked by its slug
  isBandLiked: slug => get().likedBands.some(band => band.slug === slug)
}))

export default useLikedBandsStore
