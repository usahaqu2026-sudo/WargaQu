import React, { useState, useEffect, useRef } from 'react';
import { AndroidFrame } from './components/AndroidFrame';
import { WargaDashboard } from './components/warga/WargaDashboard';
import { EmptyModuleView } from './components/warga/EmptyModuleView';
import { UsahaQuView } from './components/usahaqu/UsahaQuView';
import { RtQuView } from './components/rtqu/RtQuView';
import { SiagaQuView } from './components/siagaqu/SiagaQuView';
import { ChatQuView } from './components/chatqu/ChatQuView';
import { MuamalahQuView } from './components/muamalahqu/MuamalahQuView';
import { AreaQuView } from './components/areaqu/AreaQuView';
import { BantuanView } from './components/bantuan/BantuanView';
import { LeluhurQuView } from './components/leluhurqu/LeluhurQuView';
import { LoginModal } from './components/auth/LoginModal';
import { AccountView } from './components/auth/AccountView';
import { AdminZeroTrustView } from './components/admin/AdminZeroTrustView';

import {
  TableItem,
  MenuItem,
  Order,
  Ingredient,
  RestaurantProfile,
  PrinterConfig
} from './types';
import { StorageService } from './services/storage';
import { AUTH_SYNC_EVENT, AuthAccount, AuthService } from './services/authService';
import { RtSiagaStorage } from './services/rtSiagaStorage';
import { ZeroTrustService } from './services/zeroTrustService';

type AppScreen = 'warga' | 'akun' | 'admin_zero_trust' | 'leluhurqu' | 'rtqu' | 'siagaqu' | 'chatqu' | 'muamalahqu' | 'areaqu' | 'usahaqu' | 'modularqu' | 'bantuan' | 'empty_module';

export default function App() {
  // Screen Navigation State
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('warga');
  const [selectedEmptyModule, setSelectedEmptyModule] = useState<string>('areaqu');
  const [usahaQuMode, setUsahaQuMode] = useState<'resto' | 'modular'>('resto');

  // Core POS Data States (Persisted for UsahaQu / Bakso Qu)
  const [tables, setTables] = useState<TableItem[]>([]);
  const [menuList, setMenuList] = useState<MenuItem[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [history, setHistory] = useState<Order[]>([]);
  const [activeOrders, setActiveOrders] = useState<Record<string, Order>>({});
  const [profile, setProfile] = useState<RestaurantProfile>(StorageService.getProfile());
  const [printerConfig, setPrinterConfig] = useState<PrinterConfig>(StorageService.getPrinterConfig());

  // Global Auth Identity (Email, Phone, Hidden Device ID)
  const [authAccount, setAuthAccount] = useState<AuthAccount | null>(() => AuthService.getAccount());
  const [loginModal, setLoginModal] = useState<{ open: boolean; reason?: string }>({ open: false });

  // Global Toast Notification State
  const [notification, setNotification] = useState<string | null>(null);

  // Initial Data Load & Hidden Device ID Init
  useEffect(() => {
    AuthService.getHiddenDeviceId(); // ensure persistent hidden device token exists
    const currentAcc = AuthService.getAccount();
    if (currentAcc) {
      RtSiagaStorage.syncAuthAccount(currentAcc);
      ZeroTrustService.registerOrTouchCurrentDevice(currentAcc.email, currentAcc.phone);
    }

    const handleAuthSync = () => {
      const nextAcc = AuthService.getAccount();
      setAuthAccount(nextAcc);
      if (nextAcc) {
        RtSiagaStorage.syncAuthAccount(nextAcc);
        ZeroTrustService.registerOrTouchCurrentDevice(nextAcc.email, nextAcc.phone);
        setProfile(prev => {
          const updated = { ...prev, phone: nextAcc.phone };
          StorageService.saveProfile(updated);
          return updated;
        });
      }
    };

    window.addEventListener(AUTH_SYNC_EVENT, handleAuthSync);

    setTables(StorageService.getTables());
    setMenuList(StorageService.getMenu());
    setIngredients(StorageService.getIngredients());
    setHistory(StorageService.getHistory());
    setActiveOrders(StorageService.getActiveOrders());
    const loadedProfile = StorageService.getProfile();
    setProfile(currentAcc ? { ...loadedProfile, phone: currentAcc.phone } : loadedProfile);
    if (currentAcc && loadedProfile.phone !== currentAcc.phone) {
      StorageService.saveProfile({ ...loadedProfile, phone: currentAcc.phone });
    }
    setPrinterConfig(StorageService.getPrinterConfig());

    return () => {
      window.removeEventListener(AUTH_SYNC_EVENT, handleAuthSync);
    };
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  const currentScreenRef = useRef(currentScreen);
  const lastBackPressRef = useRef(0);

  useEffect(() => {
    currentScreenRef.current = currentScreen;
  }, [currentScreen]);

  // Tangani tombol Back HP / Browser di tingkat aplikasi
  useEffect(() => {
    window.history.replaceState({ screen: 'warga' }, '', '#warga');

    const handleGlobalBack = () => {
      // Jika sedang berada di sub-screen selain warga, kembalikan ke beranda warga
      if (currentScreenRef.current !== 'warga') {
        setCurrentScreen('warga');
        window.history.pushState({ screen: 'warga' }, '', '#warga');
        return;
      }

      // Jika di layar utama (warga), cegah langsung keluar aplikasi secara tidak sengaja
      const now = Date.now();
      if (now - lastBackPressRef.current < 2000) {
        showNotification('Sampai jumpa!');
      } else {
        lastBackPressRef.current = now;
        showNotification('Tekan sekali lagi untuk keluar aplikasi');
        // Push state kembali agar tombol back berikutnya tetap tertangkap
        window.history.pushState({ screen: 'warga' }, '', '#warga');
      }
    };

    const onPopState = () => {
      handleGlobalBack();
    };

    window.addEventListener('popstate', onPopState);

    let capListener: any = null;
    import('@capacitor/app')
      .then(({ App: CapApp }) => {
        CapApp.addListener('backButton', () => {
          handleGlobalBack();
        })
          .then((l) => {
            capListener = l;
          })
          .catch(() => {});
      })
      .catch(() => {});

    return () => {
      window.removeEventListener('popstate', onPopState);
      if (capListener?.remove) {
        capListener.remove();
      }
    };
  }, []);

  const handleOpenLeluhurQu = () => {
    setCurrentScreen('leluhurqu');
    window.history.pushState({ screen: 'leluhurqu' }, '', '#leluhurqu');
    showNotification('Membuka LeluhurQu: Silsilah Trah Keluarga');
  };

  const handleOpenRtQu = () => {
    setCurrentScreen('rtqu');
    window.history.pushState({ screen: 'rtqu' }, '', '#rtqu');
  };

  const handleOpenSiagaQu = () => {
    setCurrentScreen('siagaqu');
    window.history.pushState({ screen: 'siagaqu' }, '', '#siagaqu');
  };

  const handleOpenUsahaQu = (mode: 'resto' | 'modular' = 'resto') => {
    setUsahaQuMode(mode);
    setCurrentScreen('usahaqu');
    window.history.pushState({ screen: 'usahaqu', mode }, '', '#usahaqu-' + mode);
    showNotification(
      mode === 'modular'
        ? 'Membuka UsahaQu: Mode POS Modular Voice AI ⚡'
        : 'Membuka UsahaQu: Mode Restoran Bakso Qu 🍲'
    );
  };

  const handleOpenModularQu = () => {
    handleOpenUsahaQu('modular');
  };

  const handleOpenBantuan = () => {
    setCurrentScreen('bantuan');
    window.history.pushState({ screen: 'bantuan' }, '', '#bantuan');
    showNotification('Membuka UsahaQu Smart Care & Pusat Bantuan');
  };

  const handleOpenChatQu = () => {
    setCurrentScreen('chatqu');
    window.history.pushState({ screen: 'chatqu' }, '', '#chatqu');
  };

  const handleOpenMuamalahQu = () => {
    setCurrentScreen('muamalahqu');
    window.history.pushState({ screen: 'muamalahqu' }, '', '#muamalahqu');
  };

  const handleOpenAreaQu = () => {
    setCurrentScreen('areaqu');
    window.history.pushState({ screen: 'areaqu' }, '', '#areaqu');
  };

  const handleOpenAdminZeroTrust = () => {
    setCurrentScreen('admin_zero_trust');
    window.history.pushState({ screen: 'admin_zero_trust' }, '', '#admin-zero-trust');
  };

  const handleOpenEmptyModule = (moduleId: string) => {
    if (moduleId === 'akun' || moduleId === 'setting') {
      setCurrentScreen('akun');
      window.history.pushState({ screen: 'akun' }, '', '#akun');
      return;
    }
    if (moduleId === 'admin_zero_trust') {
      handleOpenAdminZeroTrust();
      return;
    }
    if (moduleId === 'leluhurqu') {
      handleOpenLeluhurQu();
      return;
    }
    if (moduleId === 'chatqu') {
      handleOpenChatQu();
      return;
    }
    if (moduleId === 'muamalahqu') {
      handleOpenMuamalahQu();
      return;
    }
    if (moduleId === 'areaqu') {
      handleOpenAreaQu();
      return;
    }
    setSelectedEmptyModule(moduleId);
    setCurrentScreen('empty_module');
    window.history.pushState({ screen: 'empty_module', moduleId }, '', '#' + moduleId);
  };

  const handleOpenLogin = (reason?: string) => {
    setLoginModal({ open: true, reason });
  };

  const handleBackToWarga = () => {
    setCurrentScreen('warga');
    window.history.pushState({ screen: 'warga' }, '', '#warga');
  };

  const activeOrderCount = Object.keys(activeOrders).length;

  return (
    <AndroidFrame>
      {/* Pop-up Notification Toast across views */}
      {notification && (
        <div className="absolute top-12 left-4 right-4 z-50 bg-emerald-950/95 text-[#5eead4] px-4 py-2 rounded-2xl shadow-xl border border-emerald-500/40 text-xs font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top duration-200">
          <span>{notification}</span>
        </div>
      )}

      {/* Screen 1: WargaQu Mobile App Dashboard */}
      {currentScreen === 'warga' && (
        <WargaDashboard
          onOpenLeluhurQu={handleOpenLeluhurQu}
          onOpenRtQu={handleOpenRtQu}
          onOpenSiagaQu={handleOpenSiagaQu}
          onOpenUsahaQu={handleOpenUsahaQu}
          onOpenModularQu={handleOpenModularQu}
          onOpenBantuan={handleOpenBantuan}
          onOpenChatQu={handleOpenChatQu}
          onOpenMuamalahQu={handleOpenMuamalahQu}
          onOpenAreaQu={handleOpenAreaQu}
          onOpenEmptyModule={handleOpenEmptyModule}
          onOpenLogin={handleOpenLogin}
          activeOrderCount={activeOrderCount}
        />
      )}

      {/* Screen Akun & Setting Terpadu */}
      {currentScreen === 'akun' && (
        <AccountView
          onBack={handleBackToWarga}
          onOpenRtQu={handleOpenRtQu}
          onOpenSiagaQu={handleOpenSiagaQu}
          onOpenAdminZeroTrust={handleOpenAdminZeroTrust}
          showNotification={showNotification}
        />
      )}

      {/* Screen Panel Admin Zero Trust, Monetisasi & HP Hilang/Rusak */}
      {currentScreen === 'admin_zero_trust' && (
        <AdminZeroTrustView
          onBack={handleBackToWarga}
          showNotification={showNotification}
        />
      )}

      {/* Screen LeluhurQu: Modul LeluhurQu (Silsilah Trah Keluarga) */}
      {currentScreen === 'leluhurqu' && (
        <LeluhurQuView
          onBackToWarga={handleBackToWarga}
          showNotification={showNotification}
          onOpenChatQu={handleOpenChatQu}
        />
      )}

      {/* Screen 2: Modul RtQu (Pengurusan RT 03 / RW 05 & PaguyubanQu) */}
      {currentScreen === 'rtqu' && (
        <RtQuView
          onBackToMain={handleBackToWarga}
          onOpenUsahaQu={handleOpenUsahaQu}
          onOpenSiagaQu={handleOpenSiagaQu}
          showNotification={showNotification}
        />
      )}

      {/* Screen 3: Modul SiagaQu (Panic Button & Radar Darurat) */}
      {currentScreen === 'siagaqu' && (
        <SiagaQuView
          onBackToMain={handleBackToWarga}
          showNotification={showNotification}
          onOpenChatQu={handleOpenChatQu}
          onOpenRtQu={handleOpenRtQu}
          onOpenLogin={handleOpenLogin}
        />
      )}

      {/* Screen 4: Modul ChatQu (WhatsApp-style citizen coordination) */}
      {currentScreen === 'chatqu' && (
        <ChatQuView
          onBackToMain={handleBackToWarga}
          showNotification={showNotification}
          onOpenLogin={handleOpenLogin}
        />
      )}

      {/* Screen 5: Modul MuamalahQu (Marketplace Warga Shopee-style) */}
      {currentScreen === 'muamalahqu' && (
        <MuamalahQuView
          onBackToMain={handleBackToWarga}
          menuList={menuList}
          setMenuList={setMenuList}
          showNotification={showNotification}
          onOpenChatQu={handleOpenChatQu}
        />
      )}

      {/* Screen 6: Modul AreaQu (Peta OSM & Radar Kawasan Grab Driver-style) */}
      {currentScreen === 'areaqu' && (
        <AreaQuView
          onBackToMain={handleBackToWarga}
          onOpenSiagaQu={handleOpenSiagaQu}
          onOpenChatQu={handleOpenChatQu}
          onOpenUsahaQu={handleOpenUsahaQu}
          menuList={menuList}
          showNotification={showNotification}
        />
      )}

      {/* Screen 7: UsahaQu (Unified 2-in-1 POS: Resto Qu & Modular Voice AI) */}
      {currentScreen === 'usahaqu' && (
        <UsahaQuView
          onBackToWarga={handleBackToWarga}
          onOpenModularQu={handleOpenModularQu}
          onOpenBantuan={handleOpenBantuan}
          initialMode={usahaQuMode}
          tables={tables}
          setTables={setTables}
          menuList={menuList}
          setMenuList={setMenuList}
          ingredients={ingredients}
          setIngredients={setIngredients}
          history={history}
          setHistory={setHistory}
          activeOrders={activeOrders}
          setActiveOrders={setActiveOrders}
          profile={profile}
          setProfile={setProfile}
          printerConfig={printerConfig}
          setPrinterConfig={setPrinterConfig}
          showNotification={showNotification}
        />
      )}

      {/* Screen 8: Alias modularqu -> UsahaQu in Modular Mode */}
      {currentScreen === 'modularqu' && (
        <UsahaQuView
          onBackToWarga={handleBackToWarga}
          onOpenModularQu={handleOpenModularQu}
          onOpenBantuan={handleOpenBantuan}
          initialMode="modular"
          tables={tables}
          setTables={setTables}
          menuList={menuList}
          setMenuList={setMenuList}
          ingredients={ingredients}
          setIngredients={setIngredients}
          history={history}
          setHistory={setHistory}
          activeOrders={activeOrders}
          setActiveOrders={setActiveOrders}
          profile={profile}
          setProfile={setProfile}
          printerConfig={printerConfig}
          setPrinterConfig={setPrinterConfig}
          showNotification={showNotification}
        />
      )}

      {/* Screen 9: UsahaQu Smart Care & Pusat Bantuan */}
      {currentScreen === 'bantuan' && (
        <BantuanView
          onBackToWarga={handleBackToWarga}
          showNotification={showNotification}
        />
      )}

      {/* Screen 10: Empty Modules (QRIS, Aktivitas, etc.) */}
      {currentScreen === 'empty_module' && (
        <EmptyModuleView
          moduleId={selectedEmptyModule}
          onBack={handleBackToWarga}
          onOpenUsahaQu={handleOpenUsahaQu}
        />
      )}

      {/* Global Login Modal (Email + No HP + Hidden Device ID) */}
      <LoginModal
        isOpen={loginModal.open}
        reasonMessage={loginModal.reason}
        onClose={() => setLoginModal({ open: false })}
        onSuccess={() => setLoginModal({ open: false })}
        showNotification={showNotification}
      />
    </AndroidFrame>
  );
}
