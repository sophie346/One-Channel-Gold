'use client';

import { usePathname, useRouter } from 'next/navigation';
import { User, Shield, MapPin, Package, FileText, Heart, KeyRound } from 'lucide-react';

const NAV = [
  { to: '/account', label: 'Account Information', icon: User, end: true },
  { to: '/account/security', label: 'Sign-in & Security', icon: Shield },
  { to: '/addresses', label: 'Addresses', icon: MapPin },
  {
    to: '/my-orders',
    label: 'Orders',
    icon: Package,
    activePrefixes: ['/my-orders', '/orders-returns', '/orders-cancelled', '/orders/'],
  },
  { to: '/invoices', label: 'Invoices', icon: FileText },
  { to: '/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/forgot-password', label: 'Reset Password', icon: KeyRound },
] as const;

function pathIsActive(pathOnly: string, to: string, end?: boolean, prefixes?: readonly string[]) {
  if (prefixes?.length) {
    return prefixes.some((p) => pathOnly === p || pathOnly.startsWith(p));
  }
  return end ? pathOnly === to : pathOnly === to || pathOnly.startsWith(`${to}/`);
}

export function AccountLayout({
  title,
  subtitle,
  children,
  headerRight,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}) {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const pathOnly = pathname.split('?')[0];

  return (
    <div className="min-h-[60vh] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1500px] mx-auto">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#F7F4EC] uppercase">{title}</h1>
            {subtitle ? <p className="text-sm text-[#AEB4C0] mt-1">{subtitle}</p> : null}
          </div>
          {headerRight ? <div className="shrink-0">{headerRight}</div> : null}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <aside className="lg:col-span-3">
            <nav className="bg-[#171A21] rounded-2xl border border-white/10 p-2 sticky top-24">
              {NAV.map((item) => {
                const prefixes = 'activePrefixes' in item ? item.activePrefixes : undefined;
                const end = 'end' in item ? item.end : false;
                const isActive = pathIsActive(pathOnly, item.to, end, prefixes);
                const Icon = item.icon;
                return (
                  <button
                    key={item.to}
                    type="button"
                    onClick={() => router.push(item.to)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#C8A45D]/15 text-[#E3C27A]'
                        : 'text-[#AEB4C0] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </aside>
          <div className="lg:col-span-9">{children}</div>
        </div>
      </div>
    </div>
  );
}
