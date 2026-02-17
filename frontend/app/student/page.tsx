'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Html5Qrcode } from 'html5-qrcode';

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

      // Get GPS location
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

            setSuccess('Attendance marked successfully');
            setTimeout(() => setSuccess(''), 3000);
          } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to mark attendance');
            setTimeout(() => setError(''), 3000);
          } finally {
            setLoading(false);
          }
        },
        (err) => {
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
    } catch (err: any) {
      if (err instanceof SyntaxError) {
        setError('Invalid QR code');
        setTimeout(() => setError(''), 3000);
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Student Dashboard</h1>

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-center">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2 text-center">Scan QR Code to Mark Attendance</h2>
          <div id="qr-reader" className="border rounded overflow-hidden"></div>
        </div>

        {loading && (
          <p className="text-center text-gray-600">Processing...</p>
        )}
      </div>
    </div>
  );
}
