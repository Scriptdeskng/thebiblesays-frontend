import GuestGuard from './Provider';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuestGuard>
      <div className="w-full">
           {children}
      </div>
    </GuestGuard>
  );
}