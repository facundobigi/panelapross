'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import dynamic from 'next/dynamic';

import {
  CircularProgress,
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Chip,
  Divider,
  AppBar,
  Toolbar,
  Button
} from '@mui/material';

import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// ✅ Import dinámico con tipos
const DynamicMap = dynamic<{ lat: number; lng: number }>(
  () => import('@/components/Map').then((m) => m.default),
  { ssr: false }
);

export default function DetalleVisitaPage() {
  const { id } = useParams();
  const router = useRouter();
  const [visita, setVisita] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisita = async () => {
      const docRef = doc(db, 'visitas_globales', String(id));
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();

        let ubicacion = null;
        if (typeof data.ubicacionInicio === 'string') {
          const match = data.ubicacionInicio.match(
            /Lat:\s*(-?\d+\.?\d*),\s*Lng:\s*(-?\d+\.?\d*)/
          );
          if (match) {
            ubicacion = {
              lat: parseFloat(match[1]),
              lng: parseFloat(match[2])
            };
          }
        }

        setVisita({
          ...data,
          idVisita: docSnap.id,
          ubicacionInicio: ubicacion
        });
      }
      setLoading(false);
    };

    fetchVisita();
  }, [id]);

  if (loading) {
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!visita) {
    return <Typography>No se encontró la visita</Typography>;
  }

  return (
    <Box sx={{ bgcolor: '#f9f9f9', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          bgcolor: '#fff',
          borderBottom: '1px solid #e0e0e0'
        }}
      >
        <Toolbar>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.back()}
            variant="outlined"
            sx={{
              color: '#009688',
              borderColor: '#009688',
              '&:hover': { bgcolor: '#e0f2f1' },
              mr: 2
            }}
          >
            Volver
          </Button>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Detalle de Visita
          </Typography>
          <Chip
            label={visita.estado}
            color={visita.estado === 'finalizada' ? 'success' : 'warning'}
            size="small"
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 12 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, mb: 2, boxShadow: 2, borderRadius: 3 }}>
              <Box display="flex" alignItems="center" mb={1}>
                <EventIcon sx={{ mr: 1, color: '#009688' }} />
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 500, color: '#00695c' }}
                >
                  Datos de la Visita
                </Typography>
              </Box>
              <Divider sx={{ mb: 1 }} />
              <Typography variant="body2">
                Inicio: {new Date(visita.fechaComienzo).toLocaleString()}
              </Typography>
              <Typography variant="body2">
                Fin: {new Date(visita.fechaFin).toLocaleString()}
              </Typography>
              <Typography variant="body2">Duración: {visita.duracion}</Typography>
            </Paper>

            <Paper sx={{ p: 2, mb: 2, boxShadow: 2, borderRadius: 3 }}>
              <Box display="flex" alignItems="center" mb={1}>
                <PersonIcon sx={{ mr: 1, color: '#009688' }} />
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 500, color: '#00695c' }}
                >
                  Afiliado
                </Typography>
              </Box>
              <Divider sx={{ mb: 1 }} />
              <Typography variant="body2">
                Nº Afiliación: {visita.numeroAfiliacion}
              </Typography>
              <Typography variant="body2">
                Nombre: {visita.nombreAfiliado}
              </Typography>
              <Typography variant="body2">
                Celular: {visita.celularAfiliado}
              </Typography>
            </Paper>

            <Paper sx={{ p: 2, boxShadow: 2, borderRadius: 3 }}>
              <Box display="flex" alignItems="center" mb={1}>
                <MedicalServicesIcon sx={{ mr: 1, color: '#009688' }} />
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 500, color: '#00695c' }}
                >
                  Responsable
                </Typography>
              </Box>
              <Divider sx={{ mb: 1 }} />
              <Typography variant="body2">
                Nombre: {visita.nombreResponsable}
              </Typography>
              <Typography variant="body2">
                Email: {visita.emailResponsable}
              </Typography>
              <Typography variant="body2">
                DNI: {visita.dniResponsable}
              </Typography>
              <Typography variant="body2">
                Matrícula: {visita.matriculaResponsable}
              </Typography>
              <Typography variant="body2">
                Servicio: {visita.tipoServicioPrestador}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, mb: 2, boxShadow: 2, borderRadius: 3 }}>
              <Box display="flex" alignItems="center" mb={1}>
                <BusinessIcon sx={{ mr: 1, color: '#009688' }} />
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 500, color: '#00695c' }}
                >
                  Empresa
                </Typography>
              </Box>
              <Divider sx={{ mb: 1 }} />
              <Typography variant="body2">
                CUIT: {visita.cuitEmpresaPrestadora}
              </Typography>
              <Typography variant="body2">
                Nombre: {visita.nombreEmpresaPrestadora}
              </Typography>
            </Paper>

            <Paper sx={{ p: 2, boxShadow: 2, borderRadius: 3 }}>
              <Box display="flex" alignItems="center" mb={1}>
                <LocationOnIcon sx={{ mr: 1, color: '#009688' }} />
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 500, color: '#00695c' }}
                >
                  Ubicación
                </Typography>
              </Box>
              <Divider sx={{ mb: 1 }} />
              {visita.ubicacionInicio?.lat && visita.ubicacionInicio?.lng ? (
                <Box
                  sx={{
                    height: 200,
                    borderRadius: 1,
                    overflow: 'hidden',
                    boxShadow: 1
                  }}
                >
                  <DynamicMap
                    lat={visita.ubicacionInicio.lat}
                    lng={visita.ubicacionInicio.lng}
                  />
                </Box>
              ) : (
                <Typography>No hay ubicación disponible</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
