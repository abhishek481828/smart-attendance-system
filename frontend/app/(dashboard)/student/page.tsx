'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Html5Qrcode } from 'html5-qrcode';
import { Card, Alert, Badge, Spinner } from '@/components';

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      router.push('/login');
      return;
    }

    if (mountedRef.current) return;
    mountedRef.current = true;

    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode('qr-reader');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          handleScan,
          () => {}
        );
        setScanning(true);
      } catch (err) {
        console.error('Scanner error:', err);
        setError('Failed to start camera. Please check permissions.');
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [router]);

  const handleScan = async (decodedText: string) => {
    if (loading) return;

    try {
      const payload = JSON.parse(decodedText);

      if (!payload.sessionId || !payload.token) {
        setError('Invalid QR code');
        setTimeout(() => setError(''), 3000);
        return;
      }

      setLoading(true);
      setSuccess('');
      setError('');

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            await api.post('/attendance/mark', {
              sessionId: payload.sessionId,
              token: payload.token,
              latitude,
              longitude,
            });

            setSuccess('Attendance marked successfully!');
            setTimeout(() => setSuccess(''), 3000);
          } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to mark attendance');
            setTimeout(() => setError(''), 3000);
          } finally {
            setLoading(false);
          }
        },
        () => {
          setError('Location required to mark attendance');
          setTimeout(() => setError(''), 3000);
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid QR code');
        setTimeout(() => setError(''), 3000);
      }
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Mark Attendance</h1>
        <p className="text-slate-400 mt-1 text-sm">Point your camera at the QR code</p>
      </div>

      {success && (
        <Alert variant="success" className="mb-4">{success}</Alert>
      )}

      {error && (
        <Alert variant="error" className="mb-4" onDismiss={() => setError('')}>{error}</Alert>
      )}

      <Card glass padding="none">
        <div className="p-2">
          <div id="qr-reader" className="rounded-lg overflow-hidden" />
        </div>
        {loading && (
          <div className="border-t border-white/10 px-4 py-3 flex items-center justify-center gap-2">
            <Spinner size="sm" />
            <span className="text-sm text-slate-400">Processing attendance...</span>
          </div>
        )}
      </Card>

      <div className="mt-4 text-center">
        <Badge variant={scanning ? 'success' : 'warning'} dot>
          {scanning ? 'Camera Active' : 'Starting Camera...'}
        </Badge>
      </div>
    </div>
  );
}
