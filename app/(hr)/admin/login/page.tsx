import AdminLoginForm from './AdminLoginForm';

export const metadata = {
  title: 'Admin Prijava | Padria Real Estate',
  description: 'Administratorska prijava za upravljanje nekretninama u Zadru.',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}
