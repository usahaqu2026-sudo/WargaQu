import React, { useRef, useState } from 'react';
import {
  User,
  Layers,
  Database,
  SlidersHorizontal,
  Camera,
  Check,
  Trash2,
  Edit3,
  Plus,
  HeartHandshake,
  Download,
  Upload,
  FileSpreadsheet,
  Sparkles,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Eye,
  EyeOff,
  FolderPlus,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import {
  TrahCategory,
  LineageSide,
  PhotoShape,
  compressImageFile,
} from './LeluhurQuView';
import { EncryptedBackupPanel } from '../common/EncryptedBackupPanel';

export interface LeluhurAccountProfile {
  displayName: string;
  fullName: string;
  email: string;
  phone: string;
  domicile: string;
  kinshipRole: string;
  bio: string;
  avatarUrl: string;
  defaultPosterYear: string;
}

export interface LeluhurAppPreferences {
  defaultStartMenu: 'grid' | 'excel' | 'feed';
  photoShape: PhotoShape;
  showPillarBar: boolean;
}

interface LeluhurSettingsViewProps {
  accountProfile: LeluhurAccountProfile;
  onUpdateAccountProfile: (next: LeluhurAccountProfile) => void;
  preferences: LeluhurAppPreferences;
  onUpdatePreferences: (next: LeluhurAppPreferences) => void;
  trahList: TrahCategory[];
  activeTrahId: string;
  onSelectTrah: (trahId: string) => void;
  onUpdateTrah: (
    trahId: string,
    updates: Partial<Pick<TrahCategory, 'name' | 'description' | 'lineageSide'>>
  ) => void;
  onDeleteTrah: (trahId: string) => void;
  onOpenAddTrah: () => void;
  onOpenSpouseLink: () => void;
  onMoveActiveTrahToAyah: () => void;
  onExportCSV: () => void;
  onExportFullBackupJSON: () => void;
  onImportFullBackupJSON: (file: File) => void;
  onResetExampleSanta: () => void;
  trahPostsCount: number;
  savedDesignsCount: number;
  showNotification: (msg: string) => void;
}

type SettingsSectionTab = 'account' | 'trah' | 'backup' | 'preferences';

const LINEAGE_OPTIONS: Array<{ value: LineageSide; label: string; icon: string }> = [
  { value: 'ayah_user', label: 'Pilar 1: Trah Ayah (User)', icon: '👨' },
  { value: 'ibu_user', label: 'Pilar 2: Trah Ibu (User)', icon: '👩' },
  { value: 'ayah_pasangan', label: 'Pilar 3: Trah Ayah Pasangan', icon: '💍👨' },
  { value: 'ibu_pasangan', label: 'Pilar 4: Trah Ibu Pasangan', icon: '💍👩' },
  { value: 'umum', label: 'Trah Keluarga Umum / Tambahan', icon: '🌳' },
];

export const LeluhurSettingsView: React.FC<LeluhurSettingsViewProps> = ({
  accountProfile,
  onUpdateAccountProfile,
  preferences,
  onUpdatePreferences,
  trahList,
  activeTrahId,
  onSelectTrah,
  onUpdateTrah,
  onDeleteTrah,
  onOpenAddTrah,
  onOpenSpouseLink,
  onMoveActiveTrahToAyah,
  onExportCSV,
  onExportFullBackupJSON,
  onImportFullBackupJSON,
  onResetExampleSanta,
  trahPostsCount,
  savedDesignsCount,
  showNotification,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsSectionTab>('account');
  const [draftProfile, setDraftProfile] = useState<LeluhurAccountProfile>(accountProfile);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);

  // Edit Trah inline state
  const [editingTrahId, setEditingTrahId] = useState<string | null>(null);
  const [editTrahName, setEditTrahName] = useState<string>('');
  const [editTrahDesc, setEditTrahDesc] = useState<string>('');
  const [editTrahLineage, setEditTrahLineage] = useState<LineageSide>('umum');
  const [confirmDeleteTrahId, setConfirmDeleteTrahId] = useState<string | null>(null);
  const [confirmResetSanta, setConfirmResetSanta] = useState<boolean>(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  const totalMembers = trahList.reduce((sum, t) => sum + t.members.length, 0);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingAvatar(true);
      const result = await compressImageFile(file, 320, 0.82);
      const updated = { ...draftProfile, avatarUrl: result.dataUrl };
      setDraftProfile(updated);
      onUpdateAccountProfile(updated);
      showNotification(
        `Foto profil diperbarui (${result.originalSizeKb}KB ➔ ${result.compressedSizeKb}KB)!`
      );
    } catch {
      showNotification('Gagal memproses file foto. Pastikan file berupa gambar valid.');
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned: LeluhurAccountProfile = {
      ...draftProfile,
      displayName: draftProfile.displayName.trim() || 'Pengguna',
      fullName: draftProfile.fullName.trim() || draftProfile.displayName.trim() || 'Pengguna',
      email: draftProfile.email.trim(),
      phone: draftProfile.phone.trim(),
      domicile: draftProfile.domicile.trim(),
      kinshipRole: draftProfile.kinshipRole.trim() || 'Keluarga Inti',
      bio: draftProfile.bio.trim(),
      defaultPosterYear: draftProfile.defaultPosterYear.trim() || String(new Date().getFullYear()),
    };
    setDraftProfile(cleaned);
    onUpdateAccountProfile(cleaned);
    showNotification('Profil akun LeluhurQu berhasil disimpan!');
  };

  const startEditTrah = (t: TrahCategory) => {
    setEditingTrahId(t.id);
    setEditTrahName(t.name);
    setEditTrahDesc(t.description);
    setEditTrahLineage(t.lineageSide || 'umum');
    setConfirmDeleteTrahId(null);
  };

  const handleSaveTrahEdit = (trahId: string) => {
    if (!editTrahName.trim()) {
      showNotification('Nama trah tidak boleh kosong.');
      return;
    }
    onUpdateTrah(trahId, {
      name: editTrahName.trim().toUpperCase(),
      description: editTrahDesc.trim() || 'Keluarga Besar Silsilah Trah',
      lineageSide: editTrahLineage,
    });
    setEditingTrahId(null);
    showNotification('Informasi Trah berhasil diperbarui.');
  };

  const handleBackupFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onImportFullBackupJSON(file);
    e.target.value = '';
  };

  const shapePreviewClass =
    preferences.photoShape === 'circle'
      ? 'rounded-full'
      : preferences.photoShape === 'square'
      ? 'rounded-xl'
      : '[clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]';

  return (
    <div className="w-full max-w-4xl mx-auto pb-24 space-y-4 select-text">
      {/* Header Ringkasan Akun & Statistik */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-stone-900 text-white rounded-3xl p-4 sm:p-5 shadow-md border border-emerald-800/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {draftProfile.avatarUrl ? (
              <img
                src={draftProfile.avatarUrl}
                alt={draftProfile.displayName}
                className={`w-14 h-14 object-cover border-2 border-amber-300 shadow ${shapePreviewClass}`}
              />
            ) : (
              <div
                className={`w-14 h-14 bg-amber-400 text-stone-950 font-black text-lg flex items-center justify-center border-2 border-amber-200 shadow ${shapePreviewClass}`}
              >
                {(draftProfile.displayName || 'LQ').slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-base text-white">{accountProfile.displayName}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-800/90 text-emerald-200 border border-emerald-600/60">
                  {accountProfile.kinshipRole || 'Keluarga Inti'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-200 mt-0.5">
                {accountProfile.email || 'Belum ada email'}
                {accountProfile.domicile ? ` • ${accountProfile.domicile}` : ''}
              </p>
              <p className="text-[10px] text-stone-300 mt-0.5 line-clamp-1">
                Identitas ini otomatis dipakai di Medsos 4 Trah & keterangan cetak Grid.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center shrink-0">
            <div className="bg-black/25 border border-emerald-700/50 rounded-2xl px-3 py-2">
              <div className="text-sm font-black text-amber-300">{trahList.length}</div>
              <div className="text-[10px] text-emerald-200 font-semibold">Pilar Trah</div>
            </div>
            <div className="bg-black/25 border border-emerald-700/50 rounded-2xl px-3 py-2">
              <div className="text-sm font-black text-emerald-300">{totalMembers}</div>
              <div className="text-[10px] text-emerald-200 font-semibold">Anggota</div>
            </div>
            <div className="bg-black/25 border border-emerald-700/50 rounded-2xl px-3 py-2">
              <div className="text-sm font-black text-sky-300">{savedDesignsCount}</div>
              <div className="text-[10px] text-emerald-200 font-semibold">Desain Grid</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigasi Tab Setting */}
      <div className="bg-white rounded-2xl p-1.5 border border-stone-200 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        <button
          type="button"
          onClick={() => setActiveTab('account')}
          className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${
            activeTab === 'account'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Akun & Profil</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('trah')}
          className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${
            activeTab === 'trah'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>4 Pilar Trah</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('backup')}
          className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${
            activeTab === 'backup'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Data & Cadangan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${
            activeTab === 'preferences'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Preferensi UI</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: AKUN & PROFIL PENGGUNA                             */}
      {/* ========================================================= */}
      {activeTab === 'account' && (
        <form
          onSubmit={handleSaveProfile}
          className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h4 className="font-black text-sm text-stone-900">Profil Akun & Identitas Penyusun</h4>
              <p className="text-[11px] text-stone-500">
                Data disimpan lokal di perangkat Anda dan otomatis sinkron ke Medsos & Keterangan Grid.
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Lokal Aman</span>
            </span>
          </div>

          {/* Foto Profil */}
          <div className="flex flex-wrap items-center gap-4 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
            {draftProfile.avatarUrl ? (
              <img
                src={draftProfile.avatarUrl}
                alt="Avatar"
                className={`w-16 h-16 object-cover border-2 border-emerald-600 shadow-xs ${shapePreviewClass}`}
              />
            ) : (
              <div
                className={`w-16 h-16 bg-emerald-100 text-emerald-800 font-black text-lg flex items-center justify-center border-2 border-emerald-300 ${shapePreviewClass}`}
              >
                {(draftProfile.displayName || 'LQ').slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-stone-800">Foto Profil Akun</div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploadingAvatar}
                  onClick={() => avatarInputRef.current?.click()}
                  className="py-1.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{isUploadingAvatar ? 'Mengompres...' : 'Unggah Foto'}</span>
                </button>
                {draftProfile.avatarUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      const next = { ...draftProfile, avatarUrl: '' };
                      setDraftProfile(next);
                      onUpdateAccountProfile(next);
                      showNotification('Foto profil dihapus.');
                    }}
                    className="py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition"
                  >
                    Hapus Foto
                  </button>
                )}
              </div>
              <p className="text-[10px] text-stone-500">
                Foto otomatis dikompres agar ringan di penyimpanan lokal.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">
                Nama Panggilan / Tampilan (Medsos & Poster) *
              </label>
              <input
                type="text"
                required
                value={draftProfile.displayName}
                onChange={(e) => setDraftProfile({ ...draftProfile, displayName: e.target.value })}
                placeholder="Contoh: Ian"
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden font-bold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={draftProfile.fullName}
                onChange={(e) => setDraftProfile({ ...draftProfile, fullName: e.target.value })}
                placeholder="Contoh: Ian Pratama"
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1 flex items-center gap-1">
                <Mail className="w-3 h-3 text-stone-400" />
                <span>Email Akun</span>
              </label>
              <input
                type="email"
                value={draftProfile.email}
                onChange={(e) => setDraftProfile({ ...draftProfile, email: e.target.value })}
                placeholder="email@contoh.com"
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3 text-stone-400" />
                <span>No. HP / WhatsApp Keluarga</span>
              </label>
              <input
                type="tel"
                value={draftProfile.phone}
                onChange={(e) => setDraftProfile({ ...draftProfile, phone: e.target.value })}
                placeholder="08xxxxxxxxxx"
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-stone-400" />
                <span>Domisili / Kota Asal</span>
              </label>
              <input
                type="text"
                value={draftProfile.domicile}
                onChange={(e) => setDraftProfile({ ...draftProfile, domicile: e.target.value })}
                placeholder="Contoh: Bandung / Sukabumi"
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">
                Peran / Posisi di Keluarga
              </label>
              <input
                type="text"
                value={draftProfile.kinshipRole}
                onChange={(e) => setDraftProfile({ ...draftProfile, kinshipRole: e.target.value })}
                placeholder="Contoh: Anak ke-2 / Penyusun Silsilah"
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">
                Tahun Default Keterangan Cetak Grid
              </label>
              <input
                type="text"
                value={draftProfile.defaultPosterYear}
                onChange={(e) =>
                  setDraftProfile({ ...draftProfile, defaultPosterYear: e.target.value })
                }
                placeholder="2026"
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">
                Catatan Singkat / Bio Penyusun
              </label>
              <input
                type="text"
                value={draftProfile.bio}
                onChange={(e) => setDraftProfile({ ...draftProfile, bio: e.target.value })}
                placeholder="Pengelola silsilah keluarga besar"
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-stone-100 flex justify-end">
            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Profil Akun</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* TAB 2: MANAJEMEN 4 PILAR TRAH                             */}
      {/* ========================================================= */}
      {activeTab === 'trah' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <div>
              <h4 className="font-black text-sm text-stone-900">Manajemen Daftar & 4 Pilar Trah</h4>
              <p className="text-[11px] text-stone-500">
                Ubah nama trah, tetapkan kategori pilar, tautkan besan, atau bersihkan daftar trah dari sini.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={onOpenSpouseLink}
                className="py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Tautkan Pasangan (4 Pilar)</span>
              </button>
              <button
                type="button"
                onClick={onOpenAddTrah}
                className="py-1.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Tambah Trah</span>
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {trahList.length === 0 && (
              <div className="p-5 rounded-2xl border border-dashed border-stone-300 bg-stone-50 text-center space-y-2">
                <p className="text-xs font-bold text-stone-700">
                  Belum ada Trah di akun ini.
                </p>
                <p className="text-[11px] text-stone-500">
                  Akun baru tidak menampilkan Trah contoh secara otomatis. Klik Tambah Trah atau buka lewat undangan keluarga.
                </p>
              </div>
            )}
            {trahList.map((t) => {
              const isActive = t.id === activeTrahId;
              const isEditing = editingTrahId === t.id;
              const isConfirmDelete = confirmDeleteTrahId === t.id;
              const lineageMeta =
                LINEAGE_OPTIONS.find((opt) => opt.value === (t.lineageSide || 'umum')) ||
                LINEAGE_OPTIONS[4];

              return (
                <div
                  key={t.id}
                  className={`rounded-2xl border p-3.5 transition ${
                    isActive
                      ? 'bg-emerald-50/70 border-emerald-400 shadow-2xs'
                      : 'bg-stone-50/70 border-stone-200'
                  }`}
                >
                  {isEditing ? (
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-stone-600 block mb-0.5">
                            Nama Trah
                          </label>
                          <input
                            type="text"
                            value={editTrahName}
                            onChange={(e) => setEditTrahName(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg font-bold outline-hidden focus:border-emerald-600"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-stone-600 block mb-0.5">
                            Kategori Pilar
                          </label>
                          <select
                            value={editTrahLineage}
                            onChange={(e) => setEditTrahLineage(e.target.value as LineageSide)}
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg font-bold outline-hidden focus:border-emerald-600"
                          >
                            {LINEAGE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.icon} {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-stone-600 block mb-0.5">
                          Deskripsi Jalur Silsilah
                        </label>
                        <input
                          type="text"
                          value={editTrahDesc}
                          onChange={(e) => setEditTrahDesc(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg outline-hidden focus:border-emerald-600"
                        />
                      </div>
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingTrahId(null)}
                          className="py-1.5 px-3 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveTrahEdit(t.id)}
                          className="py-1.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Simpan Perubahan</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm">{lineageMeta.icon}</span>
                          <span className="font-black text-xs sm:text-sm text-stone-900 truncate">
                            {t.name}
                          </span>
                          {isActive && (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-700 text-white">
                              Aktif
                            </span>
                          )}
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-stone-200 text-stone-600">
                            {t.members.length} Anggota
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 line-clamp-1">{t.description}</p>
                        <p className="text-[10px] text-stone-500 font-semibold">{lineageMeta.label}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        {!isActive && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectTrah(t.id);
                              showNotification(`Trah aktif dialihkan ke ${t.name}`);
                            }}
                            className="py-1.5 px-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold"
                          >
                            Aktifkan
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => startEditTrah(t)}
                          className="py-1.5 px-2.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 text-[11px] font-bold flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Ubah</span>
                        </button>

                        {!isConfirmDelete && (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteTrahId(t.id)}
                            className="py-1.5 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                        )}

                        {isConfirmDelete && (
                          <div className="flex items-center gap-1 bg-rose-100 border border-rose-300 rounded-lg px-2 py-1">
                            <span className="text-[10px] font-bold text-rose-900">Hapus?</span>
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteTrah(t.id);
                                setConfirmDeleteTrahId(null);
                              }}
                              className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold"
                            >
                              Ya
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteTrahId(null)}
                              className="px-2 py-0.5 rounded bg-white text-stone-700 text-[10px] font-bold"
                            >
                              Batal
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-[11px] text-stone-500">
              Butuh menjadikan trah aktif sekarang sebagai Pilar Trah Ayah utama?
            </span>
            <button
              type="button"
              onClick={onMoveActiveTrahToAyah}
              className="py-1.5 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 font-bold text-xs transition"
            >
              👨 Jadikan Trah Aktif Ini Pilar Ayah
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: DATA, EKSPOR & CADANGAN (BACKUP / RESTORE)         */}
      {/* ========================================================= */}
      {activeTab === 'backup' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <h4 className="font-black text-sm text-stone-900">Ekspor Data, Cadangan JSON & Pemulihan</h4>
            <p className="text-[11px] text-stone-500">
              Simpan file cadangan berkala agar seluruh silsilah, foto, dan tata letak Grid tetap aman saat ganti perangkat.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Ekspor Excel CSV */}
            <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs">
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>Ekspor Tabel Silsilah (.CSV)</span>
              </div>
              <p className="text-[11px] text-stone-600">
                Unduh data anggota Trah aktif dalam format spreadsheet agar mudah dibuka di Excel / Google Sheets.
              </p>
              <button
                type="button"
                onClick={onExportCSV}
                className="w-full py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Excel (.csv) Trah Aktif</span>
              </button>
            </div>

            {/* Cadangan Lengkap JSON */}
            <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/60 space-y-2">
              <div className="flex items-center gap-2 text-amber-950 font-extrabold text-xs">
                <Database className="w-4 h-4 text-amber-700" />
                <span>Cadangan Lengkap Semua Trah (.JSON)</span>
              </div>
              <p className="text-[11px] text-stone-600">
                Mencakup {trahList.length} Trah ({totalMembers} anggota), {savedDesignsCount} desain kanvas Grid, {trahPostsCount} postingan Medsos, & profil akun.
              </p>
              <button
                type="button"
                onClick={onExportFullBackupJSON}
                className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Cadangan Lengkap (.json)</span>
              </button>
            </div>

            {/* Pulihkan JSON */}
            <div className="p-4 rounded-2xl border border-sky-200 bg-sky-50/60 space-y-2">
              <div className="flex items-center gap-2 text-sky-950 font-extrabold text-xs">
                <Upload className="w-4 h-4 text-sky-700" />
                <span>Pulihkan Cadangan (.JSON)</span>
              </div>
              <p className="text-[11px] text-stone-600">
                Impor kembali file cadangan <code className="font-mono">.json</code> yang pernah diunduh dari LeluhurQu.
              </p>
              <input
                ref={backupInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleBackupFileSelected}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => backupInputRef.current?.click()}
                className="w-full py-2 px-3 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Pilih File Cadangan (.json)</span>
              </button>
            </div>

            <EncryptedBackupPanel
              scope="leluhurqu"
              title="Cadangan Silsilah Terenkripsi Kata Sandi (.wqbak)"
              description="Amankan seluruh data Trah, foto & desain poster dengan enkripsi AES-256-GCM sebelum diunggah ke Google Drive atau dibagikan."
              showNotification={showNotification}
              onRestored={() => window.location.reload()}
            />

            {/* Muat Ulang Contoh Trah Santa */}
            <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50 space-y-2">
              <div className="flex items-center gap-2 text-stone-900 font-extrabold text-xs">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Muat Ulang Contoh Trah Santa</span>
              </div>
              <p className="text-[11px] text-stone-600">
                Kembalikan data contoh bawaan pada Pilar Trah Ayah (Uyut Santa ➔ Abah madgani ➔ Bapak Samud).
              </p>
              {!confirmResetSanta ? (
                <button
                  type="button"
                  onClick={() => setConfirmResetSanta(true)}
                  className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-900 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Muat Ulang Data Contoh Santa</span>
                </button>
              ) : (
                <div className="p-2 rounded-xl bg-amber-100 border border-amber-300 space-y-1.5">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-amber-950">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>Pilar Trah Ayah akan diisi ulang dengan contoh Santa. Lanjutkan?</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        onResetExampleSanta();
                        setConfirmResetSanta(false);
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold"
                    >
                      Ya, Muat Ulang
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmResetSanta(false)}
                      className="py-1.5 px-3 rounded-lg bg-white text-stone-700 text-[11px] font-bold border border-stone-300"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: PREFERENSI TAMPILAN & ORGANISASI MENU              */}
      {/* ========================================================= */}
      {activeTab === 'preferences' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <h4 className="font-black text-sm text-stone-900">Preferensi Tampilan & Navigasi</h4>
            <p className="text-[11px] text-stone-500">
              Sesuaikan tampilan awal, bentuk bingkai foto biodata, dan kepadatan layar kerja.
            </p>
          </div>

          {/* Menu Awal */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-stone-800 block">
              Menu Utama Saat LeluhurQu Dibuka
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'grid' as const, label: 'Kanvas Grid' },
                { id: 'excel' as const, label: 'Tabel Excel' },
                { id: 'feed' as const, label: 'Medsos 4 Trah' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onUpdatePreferences({ ...preferences, defaultStartMenu: opt.id });
                    showNotification(`Menu awal diatur ke ${opt.label}`);
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                    preferences.defaultStartMenu === opt.id
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bentuk Foto Biodata */}
          <div className="space-y-1.5 pt-2 border-t border-stone-100">
            <label className="text-xs font-extrabold text-stone-800 block">
              Bentuk Bingkai Foto pada Detail Biodata Anggota
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'hexagon' as PhotoShape, label: 'Segi Enam (Hexagon)' },
                { id: 'circle' as PhotoShape, label: 'Bulat (Lingkaran)' },
                { id: 'square' as PhotoShape, label: 'Kotak (Rounded)' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onUpdatePreferences({ ...preferences, photoShape: opt.id });
                    showNotification(`Bingkai foto biodata diatur ke ${opt.label}`);
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                    preferences.photoShape === opt.id
                      ? 'bg-amber-400 text-stone-950 border-amber-500 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Bar 4 Pilar di Atas Layar */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-extrabold text-stone-800">
                Tampilkan Bar Cepat 4 Pilar Trah di Atas Layar
              </div>
              <p className="text-[11px] text-stone-500">
                Matikan jika ingin area kanvas Grid & Tabel lebih luas (ganti Trah tetap tersedia di Sidebar & Pengaturan).
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const nextVal = !preferences.showPillarBar;
                onUpdatePreferences({ ...preferences, showPillarBar: nextVal });
                showNotification(
                  nextVal ? 'Bar 4 Pilar ditampilkan di atas layar' : 'Bar 4 Pilar disembunyikan agar kanvas lebih lega'
                );
              }}
              className={`py-1.5 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 border shrink-0 transition ${
                preferences.showPillarBar
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-stone-100 text-stone-700 border-stone-300'
              }`}
            >
              {preferences.showPillarBar ? (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Aktif</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Sembunyi</span>
                </>
              )}
            </button>
          </div>

          {/* Ringkasan Pemisahan Sidebar vs Setting */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5 text-[11px] text-stone-600">
            <div className="font-extrabold text-stone-800 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-emerald-700" />
              <span>Tata Kelola Fitur Sidebar vs Pengaturan:</span>
            </div>
            <p>
              • <strong>Sidebar Kiri (Aksi Harian):</strong> Cari anggota, Isi Cepat (Koma), Tautkan Pasangan, Undangan Medsos, Cetak, dan pindah cepat antar Pilar Trah.
            </p>
            <p>
              • <strong>Menu Pengaturan (Administrasi & Sistem):</strong> Profil akun penyusun, ubah/hapus daftar Trah, ekspor Excel & cadangan JSON, pemulihan data, reset contoh, dan preferensi tampilan.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
