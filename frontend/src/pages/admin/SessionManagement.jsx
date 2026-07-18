import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Avatar, Button, Alert,
  IconButton, Tooltip, Tab, Tabs, CircularProgress,
} from '@mui/material';
import { Refresh as RefreshIcon, Cancel as TerminateIcon, History as HistoryIcon, Wifi as ActiveIcon } from '@mui/icons-material';
import { formatDateTime } from '../../utils/helpers';
import { getActiveSessions, getUserSessions, endSession, getAllUsers, getAllSessions } from '../../api/userService';
import SkeletonLoader from '../../components/shared/SkeletonLoader';
import ModalDialog from '../../components/shared/ModalDialog';

const formatDeviceInfo = (deviceInfo) => {
  if (!deviceInfo) return 'Unknown device';
  if (typeof deviceInfo === 'string') return deviceInfo;
  const ua = deviceInfo.userAgent || '';
  if (ua.includes('Chrome'))  return `Chrome / ${deviceInfo.platform || 'Unknown'}`;
  if (ua.includes('Safari'))  return `Safari / ${deviceInfo.platform || 'Unknown'}`;
  if (ua.includes('Firefox')) return `Firefox / ${deviceInfo.platform || 'Unknown'}`;
  return deviceInfo.platform || 'Unknown';
};

const formatDuration = (loginTime, logoutTime) => {
  if (!loginTime) return '—';
  const start = loginTime.toDate ? loginTime.toDate() : new Date(loginTime);
  const end   = logoutTime
    ? (logoutTime.toDate ? logoutTime.toDate() : new Date(logoutTime))
    : new Date();
  const diffMs  = end - start;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1)  return '< 1 min';
  if (diffMin < 60) return `${diffMin} min`;
  return `${Math.floor(diffMin / 60)}h ${diffMin % 60}m`;
};

const SessionManagement = () => {
  const [tab,            setTab]            = useState(0); // 0=Active, 1=History
  const [activeSessions, setActiveSessions] = useState([]);
  const [loginHistory,   setLoginHistory]   = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error,          setError]          = useState('');
  const [terminatingId,  setTerminatingId]  = useState(null);
  const [confirmDialog,  setConfirmDialog]  = useState({ open: false, sessionId: null });

  const loadActiveSessions = async () => {
    setLoading(true); setError('');
    try {
      const { data: active, error: activeErr } = await getActiveSessions();
      if (activeErr) throw new Error(activeErr);
      const mapped = (active || []).map((s) => ({
        id: s._id,
        uid: s.user_id?._id || s.user_id,
        displayName: s.user_id?.displayName || 'User',
        userEmail: s.user_id?.email || '',
        login_time: s.started_at,
        logout_time: s.ended_at,
        device_info: s.device_info,
        is_active: s.is_active,
      }));
      setActiveSessions(mapped);
    } catch (err) {
      setError('Failed to load active sessions: ' + err.message);
    }
    setLoading(false);
  };

  const loadLoginHistory = async () => {
    setHistoryLoading(true); setError('');
    try {
      const { data: sessions, error: sessErr } = await getAllSessions();
      if (sessErr) throw new Error(sessErr);
      const mapped = (sessions || []).map((s) => ({
        id: s._id,
        uid: s.user_id?._id || s.user_id,
        displayName: s.user_id?.displayName || 'User',
        userEmail: s.user_id?.email || '',
        login_time: s.started_at,
        logout_time: s.ended_at,
        device_info: s.device_info,
        is_active: s.is_active,
      }));

      const endedSessions = mapped
        .filter((s) => !s.is_active || s.logout_time)
        .sort((a, b) => {
          const aTime = a.login_time ? new Date(a.login_time) : new Date(0);
          const bTime = b.login_time ? new Date(b.login_time) : new Date(0);
          return bTime.getTime() - aTime.getTime();
        });

      setLoginHistory(endedSessions);
    } catch (err) {
      setError('Failed to load login history: ' + err.message);
    }
    setHistoryLoading(false);
  };

  useEffect(() => { loadActiveSessions(); }, []);

  const handleTabChange = (_, newTab) => {
    setTab(newTab);
    if (newTab === 1 && loginHistory.length === 0) {
      loadLoginHistory();
    }
  };

  const handleRefresh = () => {
    if (tab === 0) loadActiveSessions();
    else loadLoginHistory();
  };

  const openTerminateDialog = (sessionId) => setConfirmDialog({ open: true, sessionId });
  const closeTerminateDialog = () => setConfirmDialog({ open: false, sessionId: null });

  const handleTerminate = async () => {
    const { sessionId } = confirmDialog;
    closeTerminateDialog();
    setTerminatingId(sessionId);
    const { error: err } = await endSession(sessionId);
    if (!err) {
      setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } else {
      setError('Failed to terminate session: ' + err);
    }
    setTerminatingId(null);
  };

  const SessionTable = ({ sessions, isActive }) => (
    <Paper elevation={0} sx={{ borderRadius: '20px', overflow: 'hidden', mb: 2.5 }}>
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Login Time</TableCell>
              {!isActive && <TableCell>Logout Time</TableCell>}
              {!isActive && <TableCell>Duration</TableCell>}
              <TableCell>Device</TableCell>
              <TableCell>Status</TableCell>
              {isActive && <TableCell align="center">Action</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isActive ? 5 : 6} sx={{ textAlign: 'center', py: 6 }}>
                  <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>{isActive ? '😴' : '📋'}</Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    {isActive ? 'No active sessions right now' : 'No session history available'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 34, height: 34, bgcolor: '#EFF6FF', color: '#3B82F6', fontSize: '0.72rem', fontWeight: 900, border: '2px solid rgba(59,130,246,0.2)' }}>
                        {(session.displayName || session.uid || '?').slice(0, 2).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.8rem' }}>
                          {session.displayName || 'User'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.68rem' }}>
                          {session.userEmail || session.uid?.slice(0, 12) + '…'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{formatDateTime(session.login_time)}</Typography>
                  </TableCell>
                  {!isActive && (
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="text.secondary">
                        {session.logout_time ? formatDateTime(session.logout_time) : '—'}
                      </Typography>
                    </TableCell>
                  )}
                  {!isActive && (
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="text.secondary">
                        {formatDuration(session.login_time, session.logout_time)}
                      </Typography>
                    </TableCell>
                  )}
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">{formatDeviceInfo(session.device_info)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Box sx={{
                        width: 8, height: 8, borderRadius: '50%',
                        bgcolor: isActive ? '#22C55E' : '#94A3B8',
                        animation: isActive ? 'pulse 2s ease-in-out infinite' : 'none',
                      }} />
                      <Chip
                        label={isActive ? 'Active' : (session.logout_time ? 'Ended' : 'Active')}
                        size="small"
                        sx={{
                          fontWeight: 800, fontSize: '0.65rem',
                          bgcolor: isActive ? '#F0FFF4' : '#F9FAFB',
                          color:   isActive ? '#22C55E' : '#9CA3AF',
                        }}
                      />
                    </Box>
                  </TableCell>
                  {isActive && (
                    <TableCell align="center">
                      {terminatingId === session.id ? (
                        <CircularProgress size={16} sx={{ color: '#F5A623' }} />
                      ) : (
                        <Tooltip title="Force terminate session" arrow>
                          <IconButton size="small" onClick={() => openTerminateDialog(session.id)}
                            sx={{ color: '#EF4444', '&:hover': { bgcolor: '#FFF5F5' } }}>
                            <TerminateIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: '-0.01em' }}>Session Management 🛡️</Typography>
          <Typography variant="body1" color="text.secondary" fontWeight={500}>
            {tab === 0
              ? `${activeSessions.length} active session${activeSessions.length !== 1 ? 's' : ''}`
              : `${loginHistory.length} session records`}
          </Typography>
        </Box>
        <Button startIcon={<RefreshIcon />} onClick={handleRefresh} disabled={loading || historyLoading}
          variant="contained" color="secondary">
          Refresh
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Tabs */}
      <Paper elevation={0} sx={{ borderRadius: '16px', mb: 2.5, overflow: 'hidden' }}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          sx={{ borderBottom: '1.5px solid rgba(0,0,0,0.06)', px: 2 }}
          TabIndicatorProps={{ style: { background: '#F5A623', height: 3, borderRadius: 3 } }}
        >
          <Tab
            icon={<ActiveIcon sx={{ fontSize: 18 }} />} iconPosition="start"
            label="Active Sessions"
            sx={{ fontWeight: 800, fontSize: '0.85rem', textTransform: 'none', minHeight: 52 }}
          />
          <Tab
            icon={<HistoryIcon sx={{ fontSize: 18 }} />} iconPosition="start"
            label="Login History"
            sx={{ fontWeight: 800, fontSize: '0.85rem', textTransform: 'none', minHeight: 52 }}
          />
        </Tabs>
      </Paper>

      {/* Active Sessions Tab */}
      {tab === 0 && (
        <>
          {loading ? (
            <Paper elevation={0} sx={{ borderRadius: '20px', p: 3 }}>
              <SkeletonLoader variant="table" count={4} />
            </Paper>
          ) : (
            <>
              <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5 }}>
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 1,
                  px: 2, py: 1, borderRadius: '12px',
                  bgcolor: '#F0FFF4', border: '1.5px solid rgba(34,197,94,0.3)',
                }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#22C55E', boxShadow: '0 0 6px rgba(34,197,94,0.6)', animation: 'pulse 2s ease-in-out infinite' }} />
                  <Typography variant="body2" fontWeight={800} sx={{ color: '#15803D' }}>
                    {activeSessions.length} Active
                  </Typography>
                </Box>
              </Box>

              <SessionTable sessions={activeSessions} isActive />
            </>
          )}
        </>
      )}

      {/* Login History Tab */}
      {tab === 1 && (
        <>
          {historyLoading ? (
            <Paper elevation={0} sx={{ borderRadius: '20px', p: 3 }}>
              <SkeletonLoader variant="table" count={6} />
            </Paper>
          ) : (
            <SessionTable sessions={loginHistory} isActive={false} />
          )}
        </>
      )}

      {/* Info panel */}
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: '16px', bgcolor: '#FFFBF0', border: '1.5px solid rgba(245,166,35,0.25)' }}>
        <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 0.75, color: '#D97706' }}>📋 About Sessions</Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          Sessions are automatically created on login and closed on logout.
          The <strong>Login History</strong> tab shows all past sessions across users.
          Use the <strong>terminate</strong> button to force-close an active session.
        </Typography>
      </Paper>

      {/* Terminate Confirmation Dialog */}
      <ModalDialog
        open={confirmDialog.open}
        onClose={closeTerminateDialog}
        title="Terminate Session?"
        message="This will immediately end the user's active session. They will be logged out."
        type="warning"
        confirmText="Terminate"
        cancelText="Cancel"
        onConfirm={handleTerminate}
        onCancel={closeTerminateDialog}
      />
    </Box>
  );
};

export default SessionManagement;
