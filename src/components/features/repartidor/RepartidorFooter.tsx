"use client";

import { usePathname } from "next/navigation";
import { Home, History, LogOut, LucideProps } from "lucide-react";
import Link from "next/link";
import { logoutAction } from "@/src/lib/actions/auth";

// Reuse NavItem logic or create a simplified local version since we need a button for Logout
// For consistency, let's create a local item that can be a Link or Button

type FooterItemProps = {
  icon: React.ComponentType<LucideProps>;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  href?: string;
};

function FooterItem({ icon: Icon, label, isActive, onClick, href }: FooterItemProps) {
  const colorClass = isActive ? "text-green-500" : "text-gray-500";
  
  const content = (
    <div className={`flex flex-col items-center justify-center gap-1 w-16 ${colorClass}`}>
      <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
      <span className="text-[10px] font-medium">{label}</span>
      {isActive && <div className="h-1 w-1 rounded-full bg-green-500 mt-0.5" />}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return (
    <button onClick={onClick} className="focus:outline-none">
      {content}
    </button>
  );
}

export default function RepartidorFooter() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <nav className="flex items-center justify-around py-3">
        <FooterItem 
          label="Inicio" 
          icon={Home} 
          href="/repartidor/home" 
          isActive={pathname === "/repartidor/home"} 
        />
        <FooterItem 
          label="Historial" 
          icon={History} 
          href="/repartidor/historial" 
          isActive={pathname === "/repartidor/historial"} 
        />
        <FooterItem 
          label="Salir" 
          icon={LogOut} 
          onClick={handleLogout} 
        />
      </nav>
    </footer>
  );
}
