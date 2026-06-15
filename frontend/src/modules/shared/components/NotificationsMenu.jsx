import React, { useState, useEffect } from 'react';
import {
  Menu, MenuItem, Typography, Box, Badge, IconButton, Tooltip,
  List, ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, Divider, Button, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, IconButton as MuiIconButton
} from '@mui/material';
import { Notifications, Description, Warning, Event, CheckCircle, Close, History, Delete } from '@mui/icons-material';
import { notificacionesApi } from '../../../api/notificacionesApi';
import { useNavigate } from 'react-router-dom';

export const NotificationsMenu = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificaciones, setNotificaciones] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificacionesApi.getAll();
      if (res.data && res.data.data) {
        setNotificaciones(res.data.data);
      }
      const countRes = await notificacionesApi.getCountNotRead();
      if (countRes.data && countRes.data.data !== undefined) {
        setUnreadCount(countRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Actualiza cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificacionesApi.markAsRead(id);
      setNotificaciones(notificaciones.map(n => n.id === id ? { ...n, leida: true, fechaLectura: new Date() } : n));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificacionesApi.markAllAsRead();
      setNotificaciones(notificaciones.map(n => ({ ...n, leida: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificacionesApi.delete(id);
      setNotificaciones(notificaciones.filter(n => n.id !== id));
      const wasUnread = notificaciones.find(n => n.id === id && !n.leida);
      if (wasUnread) setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const openDetail = (notif) => {
    setSelectedNotif(notif);
    setDetailOpen(true);
    handleClose();
    if (!notif.leida) {
      handleMarkAsRead(notif.id);
    }
  };

  const getIcon = (tipo) => {
    switch (tipo) {
      case 'INFO':
      case 'EXITO':
        return <CheckCircle color="success" />;
      case 'ALERTA':
      case 'ERROR':
        return <Warning color="error" />;
      case 'RECORDATORIO':
        return <Event color="warning" />;
      default:
        return <Description color="primary" />;
    }
  };

  const getTipoLabel = (tipo) => {
    switch (tipo) {
      case 'INFO': return 'Información';
      case 'ALERTA': return 'Alerta';
      case 'RECORDATORIO': return 'Recordatorio';
      case 'EXITO': return 'Éxito';
      case 'ERROR': return 'Error';
      case 'DOCUMENTO': return 'Documento';
      case 'EXPEDIENTE': return 'Expediente';
      case 'REVISION': return 'Revisión';
      case 'COMITE': return 'Comité';
      default: return 'General';
    }
  };

  const getChipColor = (tipo) => {
    switch (tipo) {
      case 'INFO':
      case 'EXITO':
        return 'success';
      case 'ALERTA':
      case 'ERROR':
        return 'error';
      case 'RECORDATORIO':
        return 'warning';
      case 'DOCUMENTO':
      case 'EXPEDIENTE':
      case 'REVISION':
      case 'COMITE':
        return 'primary';
      default:
        return 'default';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES');
  };

  return (
    <>
      <Tooltip title="Notificaciones">
        <IconButton
          onClick={handleClick}
          sx={{ color: 'text.primary' }}
          aria-label="Ver notificaciones"
        >
          <Badge badgeContent={unreadCount} color="error">
            <Notifications />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 380, maxHeight: 550, borderRadius: 2, mt: 1 } } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" fontWeight="bold">Notificaciones</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllAsRead}>
              Marcar todo leído
            </Button>
          )}
        </Box>
        <Divider />
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <List disablePadding sx={{ maxHeight: 400, overflow: 'auto' }}>
            {notificaciones.length === 0 ? (
              <MenuItem disabled sx={{ py: 3, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  No hay notificaciones
                </Typography>
              </MenuItem>
            ) : (
              notificaciones.map((notif) => (
                <React.Fragment key={notif.id}>
                  <ListItem disablePadding sx={{ bgcolor: !notif.leida ? 'action.hover' : 'transparent' }}>
                    <ListItemButton onClick={() => openDetail(notif)} sx={{ px: 2, py: 1.5 }}>
                      <ListItemAvatar sx={{ minWidth: 40 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'transparent' }}>
                          {getIcon(notif.tipoNotificacion)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" fontWeight={!notif.leida ? 'bold' : 'normal'}>
                              {notif.titulo}
                            </Typography>
                            <Tooltip title="Eliminar">
                              <MuiIconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(notif.id);
                                }}
                                sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                              >
                                <Delete fontSize="inherit" />
                              </MuiIconButton>
                            </Tooltip>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}
                            >
                              {notif.mensaje}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatRelativeTime(notif.fechaEnvio)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))
            )}
          </List>
        )}
        <Divider />
        <Box sx={{ p: 1 }}>
          <Button
            size="small"
            fullWidth
            startIcon={<History />}
            onClick={() => {
              handleClose();
              navigate('/notificaciones'); // TODO: Create history page later
            }}
          >
            Ver historial completo
          </Button>
        </Box>
      </Menu>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedNotif && getIcon(selectedNotif.tipoNotificacion)}
            <Typography variant="h6">{selectedNotif?.titulo}</Typography>
          </Box>
          <IconButton onClick={() => setDetailOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedNotif && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={getTipoLabel(selectedNotif.tipoNotificacion)}
                  color={getChipColor(selectedNotif.tipoNotificacion)}
                  size="small"
                />
                {!selectedNotif.leida ? (
                  <Chip label="No leída" color="warning" size="small" />
                ) : (
                  <Chip label="Leída" variant="outlined" size="small" />
                )}
              </Box>
              <Typography variant="body1">{selectedNotif.mensaje}</Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(selectedNotif.fechaEnvio)}
                {selectedNotif.fechaLectura && (
                  <Box component="span" sx={{ ml: 2 }}>
                    Leída: {formatDate(selectedNotif.fechaLectura)}
                  </Box>
                )}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Cerrar</Button>
          {selectedNotif && (
            <Button
              color="error"
              startIcon={<Delete />}
              onClick={() => {
                handleDelete(selectedNotif.id);
                setDetailOpen(false);
              }}
            >
              Eliminar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};
