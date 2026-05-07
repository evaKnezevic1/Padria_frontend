import AdminRedirect from './AdminRedirect';

export const metadata = {
  title: 'Admin | Padria Real Estate',
  description: 'Administratorski pristup za upravljanje nekretninama.',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminRedirect />;
}
