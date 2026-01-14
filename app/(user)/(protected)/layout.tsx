import AuthGuard from './Provider';

export default function ByomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="protected-layout-container">
         {children}
      </div>
    </AuthGuard>
  );
}