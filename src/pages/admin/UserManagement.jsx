import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, TextField, InputAdornment,
  Select, MenuItem, Avatar, Button, Switch, Dialog, DialogTitle,
  DialogContent, DialogActions, FormControl, InputLabel, TablePagination,
  Alert, CircularProgress,
} from '@mui/material';
import { Search as SearchIcon, Visibility as ViewIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { getInitials, formatDate } from '../../utils/helpers';
import { getAllUsers, activateUser, deactivateUser, changeUserRole } from '../../firebase/firestoreService';
import SkeletonLoader from '../../components/shared/SkeletonLoader';

const ROLE_CHIPS = {
  parent:  { bg: '#F0FFF4', color: '#22C55E', border: 'rgba(34,197,94,0.3)'  },
  teacher: { bg: '#EFF6FF', color: '#3B82F6', border: 'rgba(59,130,246,0.3)' },
  admin:   { bg: '#F5F3FF', color: '#8B5CF6', border: 'rgba(139,92,246,0.3)' },
  child:   { bg: '#FFF8E1', color: '#F5A623', border: 'rgba(245,166,35,0.3)' },
};

const UserManagement = () => {
  const [users,         setUsers]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error,         setError]         = useState('');
  const [search,        setSearch]        = useState('');
  const [roleFilter,    setRoleFilter]    = useState('all');
  const [detailDialog,  setDetailDialog]  = useState(null);
  const [page,          setPage]          = useState(0);
  const [rowsPerPage,   setRowsPerPage]   = useState(10);

  const loadUsers = async () => {
    setLoading(true); setError('');
    const { data, error: err } = await getAllUsers();
    if (err) setError('Failed to load users: ' + err);
    else setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const filteredUsers = users.filter((u) => {
    const name = u.displayName || u.email || '';
    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) || (u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleToggleActive = async (user) => {
    setActionLoading(user.id);
    const fn = user.is_active ? deactivateUser : activateUser;
    const result = await fn(user.id);
    if (!result.error) setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
    else setError('Action failed: ' + result.error);
    setActionLoading(null);
  };

  const handleChangeRole = async (uid, newRole) => {
    setActionLoading(uid);
    const result = await changeUserRole(uid, newRole);
    if (!result.error) setUsers((prev) => prev.map((u) => u.id === uid ? { ...u, role: newRole } : u));
    else setError('Role change failed: ' + result.error);
    setActionLoading(null);
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: '-0.01em' }}>User Management 👥</Typography>
          <Typography variant="body1" color="text.secondary" fontWeight={500}>
            {loading ? 'Loading...' : `${filteredUsers.length} user${filteredUsers.length !== 1 ? 's' : ''} found`}
          </Typography>
        </Box>
        <Button
          startIcon={<RefreshIcon />} onClick={loadUsers} disabled={loading}
          variant="contained" color="secondary"
        >
          Refresh
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Search & Filter */}
      <Paper elevation={0} sx={{ p: 2, mb: 2.5, borderRadius: '16px' }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search by name or email…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small" sx={{ flex: 1, minWidth: 200 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#9CA3AF' }} /></InputAdornment> }}
          />
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Role</InputLabel>
            <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} label="Role">
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="parent">Parent</MenuItem>
              <MenuItem value="teacher">Teacher</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Table */}
      <Paper elevation={0} sx={{ borderRadius: '20px', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ p: 3 }}>
            <SkeletonLoader variant="table" count={6} />
          </Box>
        ) : (
          <>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Joined</TableCell>
                    <TableCell align="center">View</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6 }}>
                        <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>🔍</Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                          {search || roleFilter !== 'all' ? 'No users match your search.' : 'No users found in the database.'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => {
                      const rc = ROLE_CHIPS[user.role] || ROLE_CHIPS.parent;
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar sx={{
                                width: 36, height: 36, fontWeight: 900, fontSize: '0.8rem',
                                bgcolor: rc.color, color: 'white',
                                border: `2px solid ${rc.border}`,
                              }}>
                                {getInitials(user.displayName || user.email)}
                              </Avatar>
                              <Typography variant="body2" fontWeight={700}>{user.displayName || '—'}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={user.role || 'parent'} size="small" variant="standard"
                              disabled={actionLoading === user.id}
                              onChange={(e) => handleChangeRole(user.id, e.target.value)}
                              sx={{ fontSize: '0.82rem', fontWeight: 700 }}
                            >
                              <MenuItem value="parent">Parent</MenuItem>
                              <MenuItem value="teacher">Teacher</MenuItem>
                              <MenuItem value="admin">Admin</MenuItem>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Switch
                                checked={!!user.is_active} size="small"
                                disabled={actionLoading === user.id}
                                onChange={() => handleToggleActive(user)}
                              />
                              <Chip
                                label={user.is_active ? 'Active' : 'Inactive'} size="small"
                                sx={{
                                  fontWeight: 800, fontSize: '0.65rem',
                                  bgcolor: user.is_active ? '#F0FFF4' : '#FFF5F5',
                                  color:   user.is_active ? '#22C55E' : '#E53E3E',
                                }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                              {formatDate(user.created_at)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            {actionLoading === user.id ? (
                              <CircularProgress size={16} sx={{ color: '#F5A623' }} />
                            ) : (
                              <IconButton size="small" onClick={() => setDetailDialog(user)}
                                sx={{ color: '#6B7280', '&:hover': { color: '#F5A623', bgcolor: '#FFF8E1' } }}>
                                <ViewIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div" count={filteredUsers.length} page={page}
              onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            />
          </>
        )}
      </Paper>

      {/* Detail Dialog */}
      <Dialog open={!!detailDialog} onClose={() => setDetailDialog(null)} maxWidth="sm" fullWidth>
        {detailDialog && (
          <>
            <DialogTitle sx={{ fontWeight: 900 }}>👤 User Details</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
                <Avatar sx={{
                  width: 64, height: 64, fontWeight: 900, fontSize: '1.4rem',
                  background: 'linear-gradient(135deg, #F5A623 0%, #FFC107 100%)',
                  border: '3px solid white', boxShadow: '0 4px 16px rgba(245,166,35,0.35)',
                }}>
                  {getInitials(detailDialog.displayName || detailDialog.email)}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={900}>{detailDialog.displayName || '—'}</Typography>
                  <Typography variant="body2" color="text.secondary">{detailDialog.email}</Typography>
                </Box>
              </Box>
              {[
                { label: 'UID',    value: detailDialog.id || detailDialog.uid },
                { label: 'Role',   value: detailDialog.role },
                { label: 'Status', value: detailDialog.is_active ? '✅ Active' : '❌ Inactive' },
                { label: 'Joined', value: formatDate(detailDialog.created_at) || '—' },
              ].map((item) => (
                <Box key={item.label} sx={{
                  display: 'flex', justifyContent: 'space-between', py: 1.25,
                  borderBottom: '1px solid rgba(0,0,0,0.06)',
                }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>{item.label}</Typography>
                  <Typography variant="body2" fontWeight={700}>{item.value}</Typography>
                </Box>
              ))}
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setDetailDialog(null)} variant="contained" color="secondary">Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default UserManagement;
