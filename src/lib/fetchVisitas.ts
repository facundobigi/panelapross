import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/firebase';

export async function fetchVisitas() {
  const visitasRef = collection(db, 'visitas_globales');

  const usuario = sessionStorage.getItem('usuario');
  const cuit = sessionStorage.getItem('cuit');

  let q;

  if (usuario === 'aprossaud') {
    // ve todas las visitas
    q = query(
      visitasRef,
      orderBy('fechaComienzo', 'desc'),
      limit(50)
    );
  } else {
    // ve solo las visitas de su empresa
    q = query(
      visitasRef,
      where('cuitEmpresaPrestadora', '==', cuit),
      orderBy('fechaComienzo', 'desc'),
      limit(50)
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
