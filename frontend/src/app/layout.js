import './globals.css';

export const metadata = {
  title: 'EduMentor AI',
  description: 'Personalized AI Study Companion & Exam Prep Engine',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
