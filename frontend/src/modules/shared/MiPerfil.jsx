import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Avatar, Divider, Chip } from '@mui/material';
import { Person as PersonIcon, Email as EmailIcon, Badge as BadgeIcon, AdminPanelSettings as RoleIcon } from '@mui/icons-material';
import { useAuth } from '../../auth/AuthContext';
import { motion } from 'framer-motion';

export const MiPerfil = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Box p={3} component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Typography variant="h4" fontWeight="700" color="primary.main" gutterBottom>
        Mi Perfil
      </Typography>

      <Grid container spacing={4} mt={2}>
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ borderRadius: 3, textAlign: 'center', p: 4, height: '100%' }}>
            <Avatar 
              sx={{ width: 120, height: 120, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: '3rem' }}
            >
              {user.nombre?.charAt(0) || <PersonIcon fontSize="large" />}
            </Avatar>
            <Typography variant="h5" fontWeight="600" gutterBottom>
              {user.nombre}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {user.email}
            </Typography>
            <Box mt={2}>
              {user.roles?.map(role => (
                <Chip 
                  key={role} 
                  label={role.replace('ROLE_', '').replace('_', ' ')} 
                  color="secondary" 
                  size="small" 
                  sx={{ m: 0.5, fontWeight: 'bold' }} 
                />
              ))}
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card elevation={2} sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="600" mb={3}>
                Información de la Cuenta
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="flex-start" mb={3}>
                    <BadgeIcon color="primary" sx={{ mr: 2, mt: 0.5 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Nombre Completo</Typography>
                      <Typography variant="body1" fontWeight="500">{user.nombre}</Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="flex-start" mb={3}>
                    <EmailIcon color="primary" sx={{ mr: 2, mt: 0.5 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Correo Electrónico</Typography>
                      <Typography variant="body1" fontWeight="500">{user.email}</Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="flex-start" mb={3}>
                    <RoleIcon color="primary" sx={{ mr: 2, mt: 0.5 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Roles Asignados</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {user.roles?.map(r => r.replace('ROLE_', '').replace('_', ' ')).join(', ')}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MiPerfil;
