'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useAuthStore } from '@/store/useAuthStore'
import { Shield, Key, Building, User, Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function LicensePanel() {
  const { setLicense } = useAuthStore()
  const [licenseKey, setLicenseKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [licenseInfo, setLicenseInfo] = useState<any>(null)

  const handleValidate = async () => {
    if (!licenseKey.trim()) {
      setError('Please enter a license key')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validate', licenseKey: licenseKey.trim() }),
      })

      const data = await res.json()

      if (data.valid) {
        setLicenseInfo(data.license)
        setLicense({
          id: data.license.id,
          licenseKey: data.license.licenseKey,
          businessName: data.license.businessName,
          ownerName: data.license.ownerName,
          email: data.license.email,
          isActive: data.license.isActive,
          expiresAt: data.license.expiresAt,
        })
        toast.success('License validated successfully!')
      } else {
        setError(data.error || 'Invalid license key')
        setLicenseInfo(null)
      }
    } catch {
      setError('Failed to validate license. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00458f] to-[#005cbb] mb-4 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-[#0d1c2e] tracking-tight">PRECISION POS</h1>
          <p className="text-sm text-[#727784] mt-1 uppercase tracking-widest font-medium">Professional Point of Sale System</p>
        </div>

        {/* License Card */}
        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#eff4ff] flex items-center justify-center">
                <Key className="w-5 h-5 text-[#00458f]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0d1c2e] uppercase tracking-wider">License Activation</h2>
                <p className="text-xs text-[#727784]">Enter your license key to continue</p>
              </div>
            </div>

            {/* License Key Input */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#727784] uppercase tracking-wider mb-2">
                  License Key
                </label>
                <Input
                  value={licenseKey}
                  onChange={(e) => { setLicenseKey(e.target.value); setError('') }}
                  placeholder="PRECISION-2024-XXXX"
                  className="h-12 text-base font-mono tracking-wider bg-[#eff4ff] border-0 focus-visible:ring-[#00458f]"
                  onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-[#ba1a1a] bg-[#ffdad6] p-3 rounded-lg">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              <Button
                onClick={handleValidate}
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-[#00458f] to-[#005cbb] text-white font-bold uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all touch-manipulation text-base"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Shield className="w-5 h-5 mr-2" />
                )}
                Validate & Activate
              </Button>
            </div>

            {/* License Info */}
            {licenseInfo && (
              <div className="mt-6 p-4 rounded-xl bg-[#f8f9ff] border border-[#d5e3fc]/50">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-[#006c47]" />
                  <span className="text-sm font-bold text-[#006c47] uppercase tracking-wider">License Active</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="w-4 h-4 text-[#727784]" />
                    <span className="text-[#727784]">Business:</span>
                    <span className="font-semibold text-[#0d1c2e]">{licenseInfo.businessName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-[#727784]" />
                    <span className="text-[#727784]">Owner:</span>
                    <span className="font-semibold text-[#0d1c2e]">{licenseInfo.ownerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-[#727784]" />
                    <span className="text-[#727784]">Email:</span>
                    <span className="font-semibold text-[#0d1c2e]">{licenseInfo.email}</span>
                  </div>
                  {licenseInfo.expiresAt && (
                    <div className="text-xs text-[#727784] mt-2">
                      Expires: {new Date(licenseInfo.expiresAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Demo hint */}
            <div className="mt-4 text-center">
              <p className="text-xs text-[#727784]">
                Demo key: <code className="bg-[#eff4ff] px-2 py-0.5 rounded font-mono text-[#00458f]">PRECISION-2024-PRO</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
