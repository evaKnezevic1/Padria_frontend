import TestPageClient from './TestPageClient';

export const metadata = {
  title: 'Backend Test | Padria Real Estate',
  description: 'Backend connectivity test page.',
  robots: { index: false, follow: false },
};

export default function TestPage() {
  return <TestPageClient />;
}
