'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [recordarme, setRecordarme] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedUsuario = localStorage.getItem('savedUsuario');
    const savedPassword = localStorage.getItem('savedPassword');
    if (savedUsuario && savedPassword) {
      setUsuario(savedUsuario);
      setPassword(savedPassword);
      setRecordarme(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailReal = `${usuario}@gmail.com`;

    try {
      const userCred = await signInWithEmailAndPassword(auth, emailReal, password);
      const user = userCred.user;

      if (recordarme) {
        localStorage.setItem('savedUsuario', usuario);
        localStorage.setItem('savedPassword', password);
      } else {
        localStorage.removeItem('savedUsuario');
        localStorage.removeItem('savedPassword');
      }

      const adminRef = doc(db, 'admins', user.uid);
      const adminSnap = await getDoc(adminRef);

      if (adminSnap.exists()) {
        const adminData = adminSnap.data();

        sessionStorage.setItem('usuario', usuario);
        sessionStorage.setItem('cuit', adminData.cuit || '');

        router.push('/dashboard');
      } else {
        setError('No estás autorizado para acceder al panel.');
        await signOut(auth);
      }

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: 'url("/bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          zIndex: 1
        }
      }}
    >
      <Paper
        elevation={8}
        sx={{
          maxWidth: 600,
          width: '100%',
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: '#fafafa',
          boxShadow: '0px 8px 24px rgba(0,0,0,0.1)',
          zIndex: 2
        }}
      >
        <Box
          sx={{
            bgcolor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 1.5
          }}
        >
          <Image
            src="/favicon.ico.png"
            alt="Apross"
            width={90}
            height={90}
            style={{ objectFit: 'contain', marginBottom: '4px' }}
          />

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: '0.85rem',
              mt: -0.2,
              letterSpacing: 1,
              fontWeight: 500
            }}
          >
            ID - auditoria
          </Typography>
        </Box>

        <Box sx={{ p: 3 }}>
          <form onSubmit={handleLogin}>
            <TextField
              label="Usuario"
              fullWidth
              size="small"
              margin="dense"
              InputProps={{ sx: { height: 40 } }}
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
            />

            <TextField
              label="Contraseña"
              type="password"
              fullWidth
              size="small"
              margin="dense"
              InputProps={{ sx: { height: 40 } }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={recordarme}
                  onChange={(e) => setRecordarme(e.target.checked)}
                  color="primary"
                />
              }
              label="Recordarme"
              sx={{ mt: 1 }}
            />

            {error && (
              <Typography color="error" variant="body2" mt={1}>
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 2,
                bgcolor: '#009688',
                fontWeight: 500,
                letterSpacing: 1,
                boxShadow: 1,
                height: 42,
                '&:hover': { bgcolor: '#00796B', boxShadow: 2 }
              }}
            >
              Iniciar sesión
            </Button>
          </form>
        </Box>
      </Paper>
    </Box>
  );
}
