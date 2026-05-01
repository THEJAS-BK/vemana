import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation
} from 'react-router-dom';
import {
  LayoutDashboard,
  ReceiptText,
  BarChart3,
  Settings,
  LifeBuoy,
  LogOut,
  Search,
  Bell,
  HelpCircle,
  Menu,
  ChevronRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

// Views
import Dashboard from './views/Dashboard';
import Transactions from './views/Transactions';
import TransactionDetail from './views/TransactionDetail';
import Analytics from './views/Analytics';
import AdminPanel from './views/AdminPanel';
import Login from './views/Login';
import VerifyTransaction from './views/VerifyTransaction';
import NotificationBell from './components/NotificationBell';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/transactions', label: 'Transactions', icon: ReceiptText },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/admin', label: 'Admin Panel', icon: Settings },
];

function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 border-r border-white/5 bg-black/40 backdrop-blur-xl sticky left-0 top-0 py-8 z-50">
      <div className="px-8 mb-10 group cursor-default">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-fuchsia-500 rounded-lg flex items-center justify-center text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-widest uppercase">Aethera</h2>
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold mt-0.5">Fund Oversight</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-4 py-3 rounded-xl transition-all duration-300 group relative",
                isActive
                  ? "bg-white/10 text-white font-semibold shadow-inner ring-1 ring-white/10"
                  : "text-white/40 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn("mr-3 size-4.5 transition-colors", isActive ? "text-indigo-400" : "group-hover:text-white")} />
              <span className="text-xs tracking-wider font-medium uppercase">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pt-6 mt-auto">
        <a href="#" className="flex items-center px-4 py-3 text-white/40 hover:bg-white/5 hover:text-white transition-all group rounded-xl">
          <LifeBuoy className="mr-3 size-4.5" />
          <span className="text-xs font-semibold uppercase tracking-wider">Support</span>
        </a>
        <button
          onClick={() => window.location.href = '/login'}
          className="w-full flex items-center px-4 py-3 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all group rounded-xl"
        >
          <LogOut className="mr-3 size-4.5" />
          <span className="text-xs font-semibold uppercase tracking-wider">Logout</span>
        </button>
      </div>
    </aside>
  );
}

function Header() {
  const location = useLocation();
  const getPageTitle = () => {
    const item = NAV_ITEMS.find(n => location.pathname.startsWith(n.path));
    return item ? item.label : 'Portal';
  };

  return (
    <header className="flex justify-between items-center px-10 py-6 w-full sticky top-0 z-40 bg-black/20 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 text-white/60 hover:bg-white/10 rounded-xl">
          <Menu size={20} />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-white/90">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-8">
        <div className="hidden lg:flex items-center bg-white/5 border border-white/5 rounded-full px-5 py-2 focus-within:ring-2 focus-within:ring-indigo-500/40 focus-within:border-indigo-500/40 transition-all backdrop-blur-sm">
          <Search className="text-white/30 size-4 mr-3" />
          <input
            type="text"
            placeholder="Search network data..."
            className="bg-transparent border-none focus:ring-0 text-sm w-48 text-white placeholder:text-white/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell />
          <button className="p-2.5 text-white/40 hover:bg-white/10 rounded-full transition-colors">
            <HelpCircle size={18} />
          </button>
        </div>

        <div className="h-6 w-px bg-white/10 hidden sm:block" />

        <div className="flex items-center gap-4 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white leading-tight">Admin Principal</p>
            <p className="text-[9px] text-white/30 uppercase font-bold tracking-[0.1em]">Node Oversight</p>
          </div>
          <div className="w-10 h-10 rounded-xl border border-white/10 p-0.5 shadow-lg group-hover:border-indigo-500/50 transition-all">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=80&h=80"
              alt="User"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface selection:bg-indigo-500/30 overflow-hidden relative">
      {/* Background Atmospheric Elements */}
      <div className="absolute top-[-100px] right-[-100px] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-150px] left-[-50px] w-[500px] h-[500px] bg-fuchsia-600/5 rounded-full blur-[100px] pointer-events-none" />

      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 z-10">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="p-10 max-w-container-max mx-auto w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes Mockup */}
        <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
        <Route path="/transactions" element={<MainLayout><Transactions /></MainLayout>} />
        <Route path="/transactions/:id" element={<MainLayout><TransactionDetail /></MainLayout>} />
        <Route path="/verify/:txId" element={<VerifyTransaction />} />
        <Route path="/analytics" element={<MainLayout><Analytics /></MainLayout>} />
        <Route path="/admin" element={<MainLayout><AdminPanel /></MainLayout>} />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
