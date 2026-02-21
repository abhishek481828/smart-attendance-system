'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import QRCode from 'react-qr-code';
import { Card, Input, Button, Alert, Badge, Table, Modal } from '@/components';

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
  const [showEndModal, setShowEndModal] = useState(false);
  const qrTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchClasses = useCallback(async () => {
    try {
      setError('');
      const response = await api.get('/classes');
      setClasses(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch classes');
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchClasses();
  }, [fetchClasses, router]);

  useEffect(() => {
    return () => {
      if (qrTimerRef.current) {
        clearTimeout(qrTimerRef.current);
      }
    };
  }, []);

  const fetchQRToken = useCallback(async (sessionId: string) => {
    try {
      const response = await api.get(`/sessions/${sessionId}/qr`);
      setQrToken(response.data.token);
      qrTimerRef.current = setTimeout(() => fetchQRToken(sessionId), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch QR token');
    }
  }, []);

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

  const endSession = async () => {
    if (!activeSession) return;

    try {
      setLoading(true);
      setError('');
      if (qrTimerRef.current) {
        clearTimeout(qrTimerRef.current);
        qrTimerRef.current = null;
      }
      await api.post('/sessions/end', { sessionId: activeSession.id });
      setActiveSession(null);
      setQrToken(null);
      setAttendance([]);
      setShowEndModal(false);
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

  const attendanceColumns = [
    { key: 'studentEmail', header: 'Student Email' },
    {
      key: 'markedAt',
      header: 'Marked At',
      render: (row: AttendanceRecord) => new Date(row.markedAt).toLocaleString(),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {error && (
        <Alert variant="error" onDismiss={() => setError('')} className="mb-6">
          {error}
        </Alert>
      )}

      {activeSession ? (
        <>
          {/* Active Session Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Active Session</h1>
              <p className="text-slate-400 mt-1">{activeSession.className}</p>
            </div>
            <Badge variant="success" dot>Live</Badge>
          </div>

          {/* QR Code & Controls Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* QR Code Card */}
            <Card glass padding="md">
              <h2 className="text-lg font-semibold text-slate-100 mb-2">QR Code</h2>
              <p className="text-sm text-slate-400 mb-6">Auto-refreshes every 5 seconds</p>
              {qrToken && (
                <div className="flex justify-center">
                  <div className="bg-white p-6 rounded-xl">
                    <QRCode
                      value={JSON.stringify({ sessionId: activeSession.id, token: qrToken })}
                      size={220}
                      level="H"
                      bgColor="#ffffff"
                      fgColor="#000000"
                    />
                  </div>
                </div>
              )}
            </Card>

            {/* Session Controls Card */}
            <Card glass padding="md">
              <h2 className="text-lg font-semibold text-slate-100 mb-4">Session Controls</h2>
              <div className="space-y-4">
                <Input
                  label="QR Token (for testing)"
                  value={qrToken || ''}
                  readOnly
                  className="font-mono text-xs"
                />
                <div className="flex gap-3">
                  <Button onClick={fetchAttendance} variant="secondary" className="flex-1">
                    Refresh Attendance
                  </Button>
                  <Button onClick={() => setShowEndModal(true)} variant="danger" className="flex-1">
                    End Session
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Attendance Table */}
          <Card glass padding="md">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-semibold text-slate-100">Attendance</h2>
              <Badge variant="accent">{attendance.length}</Badge>
            </div>
            <Table
              columns={attendanceColumns}
              data={attendance}
              emptyMessage="No attendance records yet. Students will appear here as they scan."
            />
          </Card>

          {/* End Session Modal */}
          <Modal
            isOpen={showEndModal}
            onClose={() => setShowEndModal(false)}
            title="End Session?"
            footer={
              <>
                <Button variant="ghost" onClick={() => setShowEndModal(false)}>
                  Cancel
                </Button>
                <Button variant="danger" loading={loading} onClick={endSession}>
                  End Session
                </Button>
              </>
            }
          >
            <p className="text-slate-400">
              This will stop the QR code and finalize attendance for this session. This action cannot be undone.
            </p>
          </Modal>
        </>
      ) : (
        <>
          {/* Dashboard Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-100">Teacher Dashboard</h1>
            <p className="text-slate-400 mt-1">Manage your classes and attendance sessions</p>
          </div>

          {/* Create Class */}
          <Card glass padding="md" className="mb-8">
            <h2 className="text-lg font-semibold text-slate-100 mb-4">Create New Class</h2>
            <form onSubmit={createClass} className="flex gap-3">
              <div className="flex-1">
                <Input
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="Enter class name"
                  disabled={loading}
                />
              </div>
              <Button type="submit" loading={loading}>
                Create
              </Button>
            </form>
          </Card>

          {/* Class List */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-100">My Classes</h2>
          </div>
          {classes.length === 0 ? (
            <Card glass padding="lg">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-slate-400">No classes yet. Create one above to get started.</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((cls) => (
                <Card key={cls.id} glass padding="md" className="hover:border-accent/30 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-slate-100">{cls.name}</h3>
                    <Badge variant="default">Class</Badge>
                  </div>
                  <p className="text-sm text-slate-500 mb-4">
                    Created {new Date(cls.createdAt).toLocaleDateString()}
                  </p>
                  <Button
                    onClick={() => startSession(cls.id, cls.name)}
                    disabled={loading}
                    fullWidth
                    size="sm"
                  >
                    Start Session
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
