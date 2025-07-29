'use client';

import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';


import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';


import { db, auth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Box,
  IconButton,
  Drawer,
  Snackbar,
  MenuItem,
  TablePagination
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LogoutIcon from '@mui/icons-material/Logout';
import Image from 'next/image';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { fetchVisitas } from '@/lib/fetchVisitas';

const drawerWidth = 240;

const tiposServicio = [
  'Médico',
  'Enfermería',
  'Cuidado',
  'Kinesiología',
  'Psiquiatría',
  'Psicología',
  'Fonoaudiología',
  'Estimulación temprana'
];

interface Visita {
  idVisita: string;
  numeroAfiliacion: string;
  nombreAfiliado: string;
  dniResponsable: string;
  matriculaResponsable: string;
  fechaComienzo: string;
  tipoServicioPrestador: string;
}

export default function DashboardPage() {
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ visita: '', afiliado: '', nombreAfiliado: '', dni: '', matricula: '', desde: '', hasta: '', tipoServicio: '', cuitEmpresa: '' });
  const [usuario, setUsuario] = useState<string | null>(null);
const [isAprossAud, setIsAprossAud] = useState(false);
useEffect(() => {
  const user = sessionStorage.getItem('usuario');
  setUsuario(user);
  setIsAprossAud(user === 'aprossaud');
}, []);


  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(10);

const handleChangePage = (event: unknown, newPage: number) => {
  setPage(newPage);
};

const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
  setRowsPerPage(parseInt(event.target.value, 10));
  setPage(0);
};

  const router = useRouter();
 
  const PAGE_SIZE = 10;
  const lastDocsRef = useRef<QueryDocumentSnapshot<DocumentData>[]>([]);
const currentPageRef = useRef(0);






  const fetchVisitas = async (pageIndex: number) => {
  setLoading(true);

  try {
    const usuario = sessionStorage.getItem('usuario');
    const cuit = sessionStorage.getItem('cuit');

    const col = collection(db, 'visitas_globales');
    const constraints = [];

    // Filtrado por CUIT
    if (usuario !== 'aprossaud') {
      constraints.push(where('cuitEmpresaPrestadora', '==', cuit));
    } else if (filtros.cuitEmpresa) {
      constraints.push(where('cuitEmpresaPrestadora', '==', filtros.cuitEmpresa));
    }

    // Filtros exactos
    if (filtros.visita) constraints.push(where('idVisita', '==', filtros.visita));
    if (filtros.afiliado) constraints.push(where('numeroAfiliacion', '==', filtros.afiliado));
    if (filtros.nombreAfiliado) constraints.push(where('nombreAfiliado', '==', filtros.nombreAfiliado));
    if (filtros.dni) constraints.push(where('dniResponsable', '==', filtros.dni));
    if (filtros.matricula) constraints.push(where('matriculaResponsable', '==', filtros.matricula));
    if (filtros.tipoServicio) constraints.push(where('tipoServicioPrestador', '==', filtros.tipoServicio));
    if (filtros.desde) constraints.push(where('fechaComienzo', '>=', filtros.desde));
    if (filtros.hasta) {
      const hastaDate = new Date(filtros.hasta);
      hastaDate.setDate(hastaDate.getDate() + 1);
      const hastaStr = hastaDate.toISOString().slice(0, 10);
      constraints.push(where('fechaComienzo', '<', hastaStr));
    }

    constraints.push(orderBy('fechaComienzo', 'desc'));

    // Paginación real
    if (pageIndex > 0 && lastDocsRef.current[pageIndex - 1]) {
      constraints.push(startAfter(lastDocsRef.current[pageIndex - 1]));
    }
    constraints.push(limit(PAGE_SIZE));

    const q = query(col, ...constraints);
    const snapshot = await getDocs(q);

    const data: Visita[] = snapshot.docs.map(doc => ({
      idVisita: doc.data().idVisita,
      numeroAfiliacion: doc.data().numeroAfiliacion,
      nombreAfiliado: doc.data().nombreAfiliado,
      dniResponsable: doc.data().dniResponsable,
      matriculaResponsable: doc.data().matriculaResponsable,
      fechaComienzo: doc.data().fechaComienzo,
      tipoServicioPrestador: doc.data().tipoServicioPrestador,
    }));

    setVisitas(data);
    console.log("Visitas cargadas:", data.length);

    if (snapshot.docs.length > 0) {
      lastDocsRef.current[pageIndex] = snapshot.docs[snapshot.docs.length - 1];
    }

    currentPageRef.current = pageIndex;

  } catch (err: any) {
    console.error('Error fetching visitas:', err);
  } finally {
    setLoading(false);
  }
};












  useEffect(() => {
  const user = sessionStorage.getItem('usuario');
  setUsuario(user);
  setIsAprossAud(user === 'aprossaud');

  const filtrosGuardados = sessionStorage.getItem('filtrosDashboard');

  if (filtrosGuardados) {
    const filtrosParsed = JSON.parse(filtrosGuardados);
    setFiltros(filtrosParsed);
    fetchVisitas(0);
  } else {
    fetchVisitas(0);
  }
}, []);



  const exportToExcel = async () => {
  setLoading(true);
  try {
    const usuario = sessionStorage.getItem('usuario');
    const cuit = sessionStorage.getItem('cuit');

    const col = collection(db, 'visitas_globales');
    const constraints = [];

    if (usuario !== 'aprossaud') {
      constraints.push(where('cuitEmpresaPrestadora', '==', cuit));
    } else if (filtros.cuitEmpresa) {
      constraints.push(where('cuitEmpresaPrestadora', '==', filtros.cuitEmpresa));
    }

    // … resto del código



    if (filtros.visita) constraints.push(where('idVisita', '==', filtros.visita));
    if (filtros.afiliado) constraints.push(where('numeroAfiliacion', '==', filtros.afiliado));
    if (filtros.dni) constraints.push(where('dniResponsable', '==', filtros.dni));
    if (filtros.matricula) constraints.push(where('matriculaResponsable', '==', filtros.matricula));
    if (filtros.nombreAfiliado) constraints.push(where('nombreAfiliado', '==', filtros.nombreAfiliado));
    if (filtros.tipoServicio) constraints.push(where('tipoServicioPrestador', '==', filtros.tipoServicio));
    if (filtros.desde) constraints.push(where('fechaComienzo', '>=', filtros.desde));
    if (filtros.hasta) {
  const hastaDate = new Date(filtros.hasta);
  hastaDate.setDate(hastaDate.getDate() + 1);
  const hastaStr = hastaDate.toISOString().slice(0, 10);
  constraints.push(where('fechaComienzo', '<', hastaStr));
}


    constraints.push(orderBy('fechaComienzo', 'desc'));

    const q = query(col, ...constraints);
    const snapshot = await getDocs(q);

    const dataForExcel = snapshot.docs.map(doc => {
      const v = doc.data();
      return {
        'ID Visita': v.idVisita,
        'Estado': v.estado || '',
        'Fecha Inicio': v.fechaComienzo ? new Date(v.fechaComienzo).toLocaleString() : '',
        'Fecha Fin': v.fechaFin ? new Date(v.fechaFin).toLocaleString() : '',
        'Duración': v.duracion || '',
        'Nº Afiliación': v.numeroAfiliacion || '',
        'Nombre Afiliado': v.nombreAfiliado || '',
        'Nombre Responsable': v.nombreResponsable || '',
        'Tipo Servicio': v.tipoServicioPrestador || '',
        'DNI Responsable': v.dniResponsable || '',
        'Matrícula Responsable': v.matriculaResponsable || '',
        'Email Responsable': v.emailResponsable || '',
        'Nombre Empresa': v.nombreEmpresaPrestadora || '',
        'CUIT Empresa': v.cuitEmpresaPrestadora || '',
        'Celular Afiliado': v.celularAfiliado || '',
        'Ubicación Inicio': v.ubicacionInicio || ''
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Visitas');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, `visitas_${new Date().toISOString().slice(0, 10)}.xlsx`);

    setSnackbarOpen(true);
  } catch (error) {
    console.error('Error exportando Excel:', error);
  } finally {
    setLoading(false);
  }
};



  const handleLogout = async () => {
  try {
    sessionStorage.removeItem('filtrosDashboard'); // 🧼 Borra filtros al cerrar sesión
    await signOut(auth);
    router.push('/');
  } catch (err) {
    console.error('Error al cerrar sesión:', err);
  }
};

if (usuario === null) {
  return <CircularProgress sx={{ mt: 4, display: 'block', mx: 'auto' }} />;
}

  return (

    

    <Box sx={{ display: 'flex', bgcolor: '#f9f9f9', minHeight: '100vh' }}>

      <AppBar position="fixed" color="inherit" elevation={0} sx={{ bgcolor: '#fff', borderBottom: '1px solid #e0e0e0', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box />
          <IconButton edge="end" color="inherit" aria-label="logout" onClick={handleLogout}>
            <LogoutIcon sx={{ color: '#009688' }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#fff',
            pt: 8
          }
        }}>
        <Box sx={{ justifyContent: 'center', py: 2, display: 'flex' }}>
          <Image src="/favicon.ico.png" alt="Apross" width={160} height={80} />
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: 12,
          mx: 'auto',
          px: 3,
          maxWidth: '1024px',
          width: '100%'
        }}>
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: 2 }}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#e0f2f1', borderRadius: 1 }}>
              <Typography sx={{ fontWeight: 500, color: '#00695c' }}>Filtros</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}><TextField fullWidth label="Nº Visita" size="small" value={filtros.visita} onChange={e => setFiltros(f => ({ ...f, visita: e.target.value }))} /></Grid>
                <Grid item xs={12} md={6}><TextField fullWidth label="Nº Afiliación" size="small" value={filtros.afiliado} onChange={e => setFiltros(f => ({ ...f, afiliado: e.target.value }))} /></Grid>
                <Grid item xs={12} md={6}><TextField fullWidth label="Nombre Afiliado" size="small" value={filtros.nombreAfiliado} onChange={e => setFiltros(f => ({ ...f, nombreAfiliado: e.target.value }))} /></Grid>
                <Grid item xs={12} md={6}><TextField fullWidth label="DNI Responsable" size="small" value={filtros.dni} onChange={e => setFiltros(f => ({ ...f, dni: e.target.value }))} /></Grid>
                <Grid item xs={12} md={6}><TextField fullWidth label="Matrícula Responsable" size="small" value={filtros.matricula} onChange={e => setFiltros(f => ({ ...f, matricula: e.target.value }))} /></Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="Tipo de Servicio"
                    size="small"
                    value={filtros.tipoServicio}
                    onChange={e => setFiltros(f => ({ ...f, tipoServicio: e.target.value }))}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {tiposServicio.map(tipo => (
                      <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}><TextField fullWidth label="Desde" type="date" InputLabelProps={{ shrink: true }} size="small" value={filtros.desde} onChange={e => setFiltros(f => ({ ...f, desde: e.target.value }))} /></Grid>
                <Grid item xs={12} md={6}><TextField fullWidth label="Hasta" type="date" InputLabelProps={{ shrink: true }} size="small" value={filtros.hasta} onChange={e => setFiltros(f => ({ ...f, hasta: e.target.value }))} /></Grid>
                {isAprossAud && (
  <Grid item xs={12} md={6}>
    <TextField
      fullWidth
      label="CUIT Empresa"
      size="small"
      value={filtros.cuitEmpresa}
      onChange={e => setFiltros(f => ({ ...f, cuitEmpresa: e.target.value }))}
    />
  </Grid>
)}

              </Grid>
              <Box mt={3} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
  variant="contained"
  sx={{ bgcolor: '#009688', '&:hover': { bgcolor: '#00796B' } }}
  onClick={() => {
    // 🧠 Guardar filtros en sessionStorage
    sessionStorage.setItem('filtrosDashboard', JSON.stringify(filtros));
    
    lastDocsRef.current = [];
    currentPageRef.current = 0;
    fetchVisitas(0);
  }}
>
  Filtrar
</Button>



                <Button variant="outlined" sx={{ color: '#009688', borderColor: '#009688', '&:hover': { bgcolor: '#e0f2f1' } }} onClick={exportToExcel}>Exportar Excel</Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Paper>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
        ) : visitas.length === 0 ? (
          <Typography variant="body1" align="center" mt={4}>No se encontraron visitas con los filtros seleccionados.</Typography>
        ) : (
          <TableContainer component={Paper} sx={{ boxShadow: 2, mb: 4 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#e0f2f1' }}>
                <TableRow>
                  {['N° de Visita', 'N° de Afiliación', 'Nombre Afiliado', 'DNI Responsable', 'Matrícula Responsable', 'Tipo Servicio', 'Fecha', 'Acciones'].map(header => (
                    <TableCell key={header} sx={{ fontWeight: 600, color: '#00695c' }}>{header}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
  {visitas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((visita, index) => (

                  <TableRow key={visita.idVisita} sx={{ backgroundColor: index % 2 === 0 ? '#fafafa' : 'white', '&:hover': { backgroundColor: '#f1f1f1' } }}>
                    <TableCell>{visita.idVisita}</TableCell>
                    <TableCell>{visita.numeroAfiliacion}</TableCell>
                    <TableCell>{visita.nombreAfiliado}</TableCell>
                    <TableCell>{visita.dniResponsable}</TableCell>
                    <TableCell>{visita.matriculaResponsable}</TableCell>
                    <TableCell>{visita.tipoServicioPrestador}</TableCell>
                    <TableCell>{new Date(visita.fechaComienzo).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" sx={{ color: '#009688', borderColor: '#009688', '&:hover': { bgcolor: '#e0f2f1' } }} href={`/dashboard/${visita.idVisita}`}>Ver detalle</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

<Box mt={2} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
  <Button
    variant="outlined"
    sx={{ color: '#009688', borderColor: '#009688', '&:hover': { bgcolor: '#e0f2f1' } }}
    onClick={() => {
      if (currentPageRef.current > 0) {
        // 💡 eliminamos lastDocs de páginas posteriores
        lastDocsRef.current = lastDocsRef.current.slice(0, currentPageRef.current);
        fetchVisitas(currentPageRef.current - 1);
      }
    }}
    disabled={currentPageRef.current === 0}
  >
    ⬅ Anterior
  </Button>

  <Button
    variant="contained"
    sx={{ bgcolor: '#009688', '&:hover': { bgcolor: '#00796B' } }}
    onClick={() => {
      fetchVisitas(currentPageRef.current + 1);
    }}
    disabled={visitas.length < PAGE_SIZE}
  >
    Siguiente ➡
  </Button>
</Box>




</TableContainer>

        )}

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          message="Archivo exportado correctamente"
        />
      </Box>
    </Box>
  );
}
