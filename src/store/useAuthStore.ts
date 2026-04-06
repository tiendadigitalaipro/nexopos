import { create } from 'zustand'

interface User {
  id: string
  name: string
  email: string
  role: string
  pin: string
}

interface LicenseInfo {
  id: string
  licenseKey: string
  businessName: string
  ownerName: string
  email: string
  isActive: boolean
  expiresAt: string | null
}

interface AuthState {
  user: User | null
  license: LicenseInfo | null
  isAuthenticated: boolean
  isLicenseValid: boolean
  setUser: (user: User | null) => void
  setLicense: (license: LicenseInfo | null) => void
  logout: () => void
  invalidateLicense: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  license: null,
  isAuthenticated: false,
  isLicenseValid: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLicense: (license) => set({ license, isLicenseValid: !!license?.isActive }),
  logout: () => set({ user: null, isAuthenticated: false }),
  invalidateLicense: () => set({ license: null, isLicenseValid: false, user: null, isAuthenticated: false }),
}))
