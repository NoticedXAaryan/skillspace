'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { Loader2 } from 'lucide-react';

export default function TwoFactorPage() {
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleEnable2FA() {
    setLoading(true);
    const { data, error } = await authClient.twoFactor.enable({
      password: "user-password-here", // Typically needs re-auth or similar, omitted for brevity
    });
    
    if (data?.totpURI) {
      setQrCode(data.totpURI); // Render with QRCode react component
    }
    setLoading(false);
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-xl mx-auto rounded-xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-4">Set up Two-Factor Authentication</h1>
        <p className="text-muted-foreground mb-6">Enhance your account security by enabling two-factor authentication.</p>
        
        {qrCode ? (
          <div className="text-center">
            <div className="bg-white p-4 inline-block mb-4 rounded-md">
              {/* Display QR code here */}
              <p className="text-black font-mono break-all">{qrCode}</p>
            </div>
            <p className="text-sm mb-4">Scan the QR code with your authenticator app.</p>
            <Button onClick={() => router.push('/profile')}>Done</Button>
          </div>
        ) : (
          <Button onClick={handleEnable2FA} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enable 2FA
          </Button>
        )}
      </div>
    </main>
  );
}
