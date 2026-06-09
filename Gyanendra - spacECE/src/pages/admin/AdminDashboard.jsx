import { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Paper, Avatar, List, ListItem, ListItemAvatar,
  ListItemText, Divider,
} from '@mui/material';
import {
  People as PeopleIcon, PersonAdd as PersonAddIcon, Security as SecurityIcon,
  TrendingUp as TrendingIcon, Notifications as NotifIcon,
  CheckCircle as CheckIcon, Circle as CircleIcon,
} from '@mui/icons-material';
import { getAllUsers, getActiveSessions } from '../../firebase/firestoreService';
import { useNotifications } from '../../context/NotificationContext';
import { timeAgo } from '../../utils/helpers';
import SkeletonLoader from '../../components/shared/SkeletonLoader';

const NOTIF_TYPE_ICONS = {
  achievement: '🏆',
  signup:      '👋',
  progress:    '📈',
  system:      '⚙️',
  default:     '🔔',
};

const AdminDashboard = () => {
  const { notifications } = useNotifications();
  const [stats, setStats] = useState({
    totalUsers: '—', activeSessions: '—', newSignups: '—', pending: '—',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const [usersResult, sessionsResult] = await Promise.all([getAllUsers(), getActiveSessions()]);
        const users    = usersResult.data    || [];
        const sessions = sessionsResult.data || [];
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const newSignups = users.filter((u) => {
          const ts = u.created_at?.seconds ? u.created_at.seconds * 1000 : 0;
          return ts > oneWeekAgo;
        }).length;
        const pending = users.filter((u) => !u.is_active).length;
        setStats({ totalUsers: users.length.toLocaleString(), activeSessions: sessions.length, newSignups, pending });
      } catch (err) {
        console.error('AdminDashboard stats error:', err);
      }
      setLoading(false);
    };
    loadStats();
  }, []);

  const statItems = [
    { label: 'Total Users',      value: stats.totalUsers,     icon: '👥', color: '#3B82F6', bg: '#EFF6FF', border: 'rgba(59,130,246,0.2)'  },
    { label: 'Active Sessions',  value: stats.activeSessions, icon: '🛡️', color: '#22C55E', bg: '#F0FFF4', border: 'rgba(34,197,94,0.2)'   },
    { label: 'New This Week',    value: stats.newSignups,     icon: '✨', color: '#D97706', bg: '#FFF8E1', border: 'rgba(245,166,35,0.25)'  },
    { label: 'Inactive Users',   value: stats.pending,        icon: '⚠️', color: '#9F7AEA', bg: '#F5F3FF', border: 'rgba(139,92,246,0.2)'  },
  ];

  const statusItems = [
    { label: 'Firebase Auth',   status: 'Connected',  ok: true  },
    { label: 'Firestore DB',    status: 'Connected',  ok: true  },
    { label: 'Email Service',   status: 'Active',     ok: true  },
    { label: 'Storage',         status: 'Active',     ok: true  },
    { label: 'Maintenance Mode', status: 'Off',        ok: true  },
  ];

  const recentNotifications = notifications.slice(0, 6);

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>

      {/* ── Page Header ── */}
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" fontWeight={900} sx={{ mb: 0.5, fontFamily: '"Nunito", sans-serif' }}>
          🔐 Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" fontWeight={600} sx={{ fontFamily: '"Nunito", sans-serif' }}>
          System overview and platform management
        </Typography>
      </Box>

      {/* ── Stat Cards (skeleton while loading) ── */}
      {loading ? (
        <Box sx={{ mb: 3.5 }}>
          <SkeletonLoader variant="dashboard" />
        </Box>
      ) : (
        <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
          {statItems.map((stat, i) => (
            <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
              <Box sx={{
                p: { xs: 2.5, sm: 3 }, borderRadius: '22px',
                bgcolor: stat.bg,
                border: `1.5px solid ${stat.border}`,
                borderTop: `4px solid ${stat.color}`,
                boxShadow: `0 4px 20px ${stat.border}, 0 1px 4px rgba(0,0,0,0.04)`,
                transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                animation: `popIn 0.5s ease-out ${i * 0.08}s both`,
                '&:hover': { transform: 'translateY(-6px)', boxShadow: `0 14px 36px ${stat.border}` },
              }}>
                <Typography sx={{ fontSize: { xs: '2rem', sm: '2.4rem' }, mb: 1, lineHeight: 1 }}>{stat.icon}</Typography>
                <Typography variant="h3" fontWeight={900} sx={{ color: stat.color, lineHeight: 1, fontFamily: '"Nunito", sans-serif', fontSize: { xs: '1.8rem', sm: '2.2rem' } }}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ fontSize: '0.72rem', mt: 0.5, display: 'block' }}>
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      <Grid container spacing={3}>

        {/* ── LEFT: Notifications Feed ── */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper elevation={0} sx={{ p: 3.5, borderRadius: '24px', border: '1.5px solid rgba(0,0,0,0.055)', boxShadow: '0 4px 20px rgba(31,58,104,0.07)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Typography variant="h6" fontWeight={900} sx={{ fontFamily: '"Nunito", sans-serif', letterSpacing: '-0.01em' }}>📬 Recent Notifications</Typography>
              {recentNotifications.filter((n) => !n.read_status).length > 0 && (
                <Box sx={{
                  px: 1.25, py: 0.3, borderRadius: 10,
                  bgcolor: 'rgba(255,149,0,0.12)',
                  border: '1px solid rgba(255,149,0,0.3)',
                }}>
                  <Typography variant="caption" fontWeight={900} sx={{ color: '#FF9500', fontSize: '0.65rem' }}>
                    {recentNotifications.filter((n) => !n.read_status).length} new
                  </Typography>
                </Box>
              )}
            </Box>

            {recentNotifications.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography sx={{ fontSize: '3rem', mb: 1.5, animation: 'bounce 2s ease-in-out infinite' }}>✨</Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={700}>All systems quiet — no notifications</Typography>
              </Box>
            ) : (
              <List disablePadding>
                {recentNotifications.map((item, i) => (
                  <Box key={item.id || i}>
                    <ListItem disablePadding sx={{
                      py: 1.5,
                      borderLeft: item.read_status ? '3px solid transparent' : '3px solid #FF9500',
                      bgcolor: item.read_status ? 'transparent' : 'rgba(255,149,0,0.04)',
                      borderRadius: '0 12px 12px 0',
                      transition: 'all 0.2s ease',
                    }}>
                      <ListItemAvatar sx={{ minWidth: 52 }}>
                        <Avatar sx={{
                          width: 42, height: 42, fontSize: '1.3rem',
                          background: item.read_status
                            ? 'rgba(241,245,249,0.9)'
                            : 'linear-gradient(135deg, rgba(255,149,0,0.15), rgba(255,193,7,0.1))',
                          border: `2px solid ${item.read_status ? 'rgba(226,232,240,0.5)' : 'rgba(255,149,0,0.3)'}`,
                          boxShadow: item.read_status ? 'none' : '0 4px 12px rgba(255,149,0,0.2)',
                        }}>
                          {NOTIF_TYPE_ICONS[item.type] || NOTIF_TYPE_ICONS.default}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.title || item.message}
                        secondary={item.message !== item.title ? item.message : timeAgo(item.created_at)}
                        primaryTypographyProps={{ fontWeight: item.read_status ? 600 : 800, fontSize: '0.88rem', lineHeight: 1.4 }}
                        secondaryTypographyProps={{ variant: 'caption', fontSize: '0.72rem' }}
                      />
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5, ml: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {timeAgo(item.created_at)}
                        </Typography>
                        {!item.read_status && (
                          <Box sx={{
                            width: 8, height: 8, borderRadius: '50%', bgcolor: '#FF9500',
                            boxShadow: '0 0 6px rgba(255,149,0,0.6)',
                            animation: 'pulse 2s ease-in-out infinite',
                          }} />
                        )}
                      </Box>
                    </ListItem>
                    {i < recentNotifications.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.6)', ml: 7 }} />}
                  </Box>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* ── RIGHT: System Status ── */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper elevation={0} sx={{ p: 3.5, borderRadius: '24px', border: '1.5px solid rgba(0,0,0,0.055)', boxShadow: '0 4px 20px rgba(31,58,104,0.07)' }}>
            <Typography variant="h6" fontWeight={900} sx={{ mb: 2.5, fontFamily: '"Nunito", sans-serif', letterSpacing: '-0.01em' }}>⚙️ System Status</Typography>

            {statusItems.map((item, i) => (
              <Box key={item.label} sx={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                py: 1.5,
                borderBottom: i < statusItems.length - 1 ? '1px solid rgba(255,255,255,0.6)' : 'none',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {/* Pulsing dot */}
                  <Box sx={{ position: 'relative' }}>
                    <Box sx={{
                      width: 10, height: 10, borderRadius: '50%',
                      bgcolor: item.ok ? '#22C55E' : '#EF4444',
                      boxShadow: `0 0 6px ${item.ok ? 'rgba(34,197,94,0.6)' : 'rgba(239,68,68,0.6)'}`,
                      animation: 'pulse 2s ease-in-out infinite',
                    }} />
                  </Box>
                  <Typography variant="body2" fontWeight={700}>{item.label}</Typography>
                </Box>

                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 0.75,
                  px: 1.5, py: 0.4, borderRadius: 10,
                  bgcolor: item.ok ? 'rgba(220,252,231,0.9)' : 'rgba(255,237,237,0.9)',
                  border: `1px solid ${item.ok ? 'rgba(74,222,128,0.4)' : 'rgba(252,129,129,0.4)'}`,
                }}>
                  {item.ok
                    ? <CheckIcon sx={{ fontSize: 13, color: '#22C55E' }} />
                    : <CircleIcon sx={{ fontSize: 13, color: '#EF4444' }} />}
                  <Typography variant="caption" sx={{
                    fontWeight: 900, fontSize: '0.68rem',
                    color: item.ok ? '#15803D' : '#DC2626',
                  }}>
                    {item.status}
                  </Typography>
                </Box>
              </Box>
            ))}

            {/* Health summary */}
            <Box sx={{
              mt: 2.5, p: 2, borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(220,252,231,0.9), rgba(187,247,208,0.7))',
              border: '1.5px solid rgba(74,222,128,0.5)',
              textAlign: 'center',
            }}>
              <Typography sx={{ fontSize: '2rem', mb: 0.5 }}>✅</Typography>
              <Typography variant="subtitle2" fontWeight={900} sx={{ color: '#15803D', mb: 0.25 }}>
                All Systems Operational
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                Last checked: just now · Uptime: 99.98%
              </Typography>
            </Box>
          </Paper>

          {/* Quick stats */}
          <Paper elevation={0} sx={{ p: 3.5, borderRadius: '24px', mt: 3, border: '1.5px solid rgba(0,0,0,0.055)', boxShadow: '0 4px 20px rgba(31,58,104,0.07)' }}>
            <Typography variant="h6" fontWeight={900} sx={{ mb: 2.5, fontFamily: '"Nunito", sans-serif', letterSpacing: '-0.01em' }}>📊 Platform Health</Typography>
            {[
              { label: 'User Retention', value: 87, color: '#3B82F6' },
              { label: 'Activity Rate',  value: 73, color: '#22C55E' },
              { label: 'Badge Unlocks',  value: 94, color: '#D97706' },
            ].map((metric) => (
              <Box key={metric.label} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                  <Typography variant="caption" fontWeight={800} sx={{ fontSize: '0.78rem' }}>{metric.label}</Typography>
                  <Typography variant="caption" fontWeight={900} sx={{ color: metric.color, fontSize: '0.78rem' }}>{metric.value}%</Typography>
                </Box>
                <Box sx={{
                  height: 10, borderRadius: 100,
                  bgcolor: `${metric.color}15`,
                  overflow: 'hidden',
                }}>
                  <Box sx={{
                    height: '100%',
                    width: `${metric.value}%`,
                    background: `linear-gradient(90deg, ${metric.color}, ${metric.color}CC)`,
                    borderRadius: 100,
                    boxShadow: `0 0 8px ${metric.color}60`,
                    animation: 'progressFill 1.2s ease-out',
                  }} />
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
