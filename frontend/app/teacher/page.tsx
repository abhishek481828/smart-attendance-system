'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import QRCode from 'react-qr-code';

interface Class {
  id: string;
  name: string;
  createdAt: string;
}

interface Session {
  id: string;
  classId: string;
  className: string;
  startTime: string;
}

interface AttendanceRecord {
  studentId: string;
  studentEmail: string;
  markedAt: string;
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [newClassName, setNewClassName] = useState('');
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setError('');
      const response = await api.get('/classes');
      setClasses(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch classes');
    }
  };

  const createClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    try {
      setLoading(true);
      setError('');
      await api.post('/classes', { name: newClassName });
      setNewClassName('');
      await fetchClasses();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (classId: string, className: string) => {
    try {
      setLoading(true);
      setError('');
      const response = await api.post('/sessions/start', { classId });
      setActiveSession({
        id: response.data.id,
        classId,
        className,
        startTime: response.data.startTime,
      });
      await fetchQRToken(response.data.id);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const fetchQRToken = async (sessionId: string) => {
    try {
      const response = await api.get(`/sessions/${sessionId}/qr`);
      setQrToken(response.data.token);
      setTimeout(() => fetchQRToken(sessionId), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch QR token');
    }
  };

  const endSession = async () => {
    if (!activeSession) return;

    try {
      setLoading(true);
      setError('');
      await api.post('/sessions/end', { sessionId: activeSession.id });
      setActiveSession(null);
      setQrToken(null);
      setAttendance([]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to end session');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    if (!activeSession) return;

    try {
      setError('');
      const response = await api.get(`/attendance/session/${activeSession.id}`);
      setAttendance(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch attendance');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Teacher Dashboard</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {activeSession ? (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Active Session: {activeSession.className}</h2>
            
            {qrToken && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">QR Code (Updates every 5 seconds)</h3>
                <div className="bg-white p-4 inline-block border">
                  <QRCode 
                    value={JSON.stringify({ sessionId: activeSession.id, token: qrToken })} 
                    size={256} 
                    level="H" 
                  />
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium mb-1">QR Token (For Testing)</p>
                  <input
                    type="text"
                    value={qrToken}
                    readOnly
                    className="w-full max-w-md px-3 py-2 border rounded bg-gray-50 text-sm"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-4 mb-6">
              <button
                onClick={fetchAttendance}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Refresh Attendance
              </button>
              <button
                onClick={endSession}
                disabled={loading}
                className="bg-red-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
              >
                {loading ? 'Ending...' : 'End Session'}
              </button>
            </div>

            {attendance.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Attendance ({attendance.length})</h3>
                <table className="w-full border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-4 py-2 text-left">Student Email</th>
                      <th className="border px-4 py-2 text-left">Marked At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((record) => (
                      <tr key={record.studentId}>
                        <td className="border px-4 py-2">{record.studentEmail}</td>
                        <td className="border px-4 py-2">
                          {new Date(record.markedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Create New Class</h2>
              <form onSubmit={createClass} className="flex gap-4">
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="Enter class name"
                  className="flex-1 px-4 py-2 border rounded"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded disabled:bg-gray-400"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">My Classes</h2>
              {classes.length === 0 ? (
                <p className="text-gray-500">No classes yet. Create one above.</p>
              ) : (
                <div className="space-y-4">
                  {classes.map((cls) => (
                    <div key={cls.id} className="flex justify-between items-center border-b pb-4">
                      <div>
                        <h3 className="font-semibold">{cls.name}</h3>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(cls.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => startSession(cls.id, cls.name)}
                        disabled={loading}
                        className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
                      >
                        {loading ? 'Starting...' : 'Start Session'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
