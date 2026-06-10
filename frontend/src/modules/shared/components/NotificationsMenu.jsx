import React, { useState } from 'react';
import {
  Menu, MenuItem, Typography, Box, Badge, IconButton, Tooltip,
  List, ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, Divider, Button
} from '@mui/material';
import { Notifications, Description, Warning, Event, CheckCircle } from '@mui/icons-material';

const INITIAL_NOTIFICATIONS = [
  { id: 1, tipo: 'INFO', mensaje: 'Documento "Plan de Prácticas" aprobado.', fecha: 'Hace 2 horas', leido: false },
  { id: 2, tipo: 'ALERTA', mensaje: 'Nueva observación en "Informe Parcial 1".', fecha: 'Hace 5 horas', leido: false },
  { id: 3, tipo: 'RECORDATORIO', mensaje: 'Vencimiento de Informe Final en 3 días.', fecha: 'Ayer', leido: true }
];

export const NotificationsMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificaciones, setNotificaciones] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notificaciones.filter(n => !n.leido).length;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = (id) => {
    setNotificaciones(notificaciones.map(n => n.id === id ? { ...n, leido: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotificaciones(notificaciones.map(n => ({ ...n, leido: true })));
  };

  const getIcon = (tipo) => {
    switch (tipo) {
      case 'INFO': return <CheckCircle color="success" />;
      case 'ALERTA': return <Warning color="error" />;
      case 'RECORDATORIO': return <Event color="warning" />;
      default: return <Description color="primary" />;
    }
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
        slotProps={{ paper: { sx: { width: 350, maxHeight: 500, borderRadius: 2, mt: 1 } } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">Notificaciones</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllAsRead}>
              Marcar todo leído
            </Button>
          )}
        </Box>
        <Divider />
        <List disablePadding>
          {notificaciones.length === 0 ? (
            <MenuItem disabled>No hay notificaciones</MenuItem>
          ) : (
            notificaciones.map((notif) => (
              <React.Fragment key={notif.id}>
                <ListItem disablePadding sx={{ bgcolor: notif.leido ? 'transparent' : 'action.hover' }}>
                  <ListItemButton onClick={() => handleMarkAsRead(notif.id)}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'transparent' }}>
                        {getIcon(notif.tipo)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={notif.leido ? 'normal' : 'bold'}>
                          {notif.mensaje}
                        </Typography>
                      }
                      secondary={<Typography variant="caption" color="text.secondary">{notif.fecha}</Typography>}
                    />
                  </ListItemButton>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))
          )}
        </List>
        <Box sx={{ textAlign: 'center', p: 1 }}>
          <Button size="small" fullWidth>Ver todo el historial</Button>
        </Box>
      </Menu>
    </>
  );
};
