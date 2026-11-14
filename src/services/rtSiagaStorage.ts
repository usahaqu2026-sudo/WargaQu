import { AuthAccount } from './authService';

export type OrgType = 'RT' | 'Paguyuban' | 'Organisasi';
export type SiagaActivationStatus = 'pending' | 'active' | 'suspended';

export interface PaguyubanProfile {
  orgType: OrgType;
  customBrandName?: string;
  orgName: string;
  areaName: string;
  monthlyDuesAmount: number;
  duesBreakdown: {
    keamanan: number;
    sampah: number;
    kas: number;
  };
  year: number;
  pengurusPin: string;
}

export interface CoordinatorMember {
  id: string;
  role: string;
  division: string;
  name: string;
  phone: string;
  canVerifySiaga: boolean;
}

export interface MonthlyPaymentRecord {
  paid: boolean;
  paidAt?: string;
  method?: string;
  amount: number;
}

export type ClaimStatus = 'unclaimed' | 'invited' | 'claimed';

export interface WargaMember {
  id: string;
  wargaId: string;
  name: string;
  block: string;
  email?: string;
  phone: string;
  deviceId?: string; // hidden device token
  residentType: 'Tetap' | 'Kontrak';
  isCurrentUser?: boolean;
  claimStatus?: ClaimStatus;
  claimCode?: string;
  invitedAt?: string;
  claimedAt?: string;
  priorArrears?: number;
  priorArrearsNote?: string;
  siagaStatus: SiagaActivationStatus;
  siagaRequested?: boolean;
  siagaVerifiedBy?: string;
  siagaVerifiedAt?: string;
  suspendReason?: string;
  falseAlarmCount: number;
  monthlyPayments: Record<string, MonthlyPaymentRecord>;
}

export interface HistoricalArchiveYear {
  id: string;
  year: number;
  totalIncome: number;
  totalExpense: number;
  endingBalance: number;
  note: string;
  source: 'Manual' | 'Impor Excel';
}

export type InvitationEventType =
  | 'Rapat Warga'
  | 'Kerja Bakti'
  | 'Acara Lingkungan'
  | 'Rapat Pengurus';

export type InvitationRsvpStatus = 'hadir' | 'wakil' | 'izin';

export interface InvitationRsvpEntry {
  memberId: string;
  name: string;
  block: string;
  status: InvitationRsvpStatus;
  note?: string;
}

export interface CommunityInvitation {
  id: string;
  eventType: InvitationEventType;
  title: string;
  dateTime: string;
  location: string;
  targetAudience: string;
  agenda: string;
  senderName: string;
  createdAt: string;
  rsvps: Record<string, InvitationRsvpEntry>;
}

export type KasCategory =
  | 'Iuran Warga'
  | 'Donasi / Kas'
  | 'Gaji Keamanan'
  | 'Petugas Sampah'
  | 'Listrik & Pos Ronda'
  | 'Perbaikan Fasilitas';

export interface KasTransaction {
  id: string;
  type: 'masuk' | 'keluar';
  category: KasCategory;
  title: string;
  amount: number;
  date: string;
  recordedBy: string;
}

export interface SiagaAuditLog {
  id: string;
  timestamp: string;
  date: string;
  category: string;
  mode: 'Simulasi' | 'REAL';
  scope?: 'umum_rt' | 'pribadi_hp' | 'keluarga' | 'perusahaan';
  reporterId: string;
  reporterName: string;
  reporterBlock: string;
  reporterEmail?: string;
  reporterPhone?: string;
  reporterDeviceId?: string; // hidden internal device token
  location: string;
  transcript: string;
  auditStatus: 'pending' | 'valid' | 'prank';
}

export type ForumCategory = 'jadwal' | 'aspirasi' | 'polling' | 'info';
export type AspirationStatus = 'Menunggu' | 'Diproses' | 'Selesai';

export interface ForumComment {
  id: string;
  author: string;
  authorBlock: string;
  text: string;
  time: string;
}

export interface ForumPollOption {
  id: string;
  label: string;
  voterIds: string[];
}

export interface ForumPost {
  id: string;
  category: ForumCategory;
  title: string;
  content: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
  scheduleDate?: string;
  scheduleLocation?: string;
  attendeeIds?: string[];
  aspirationStatus?: AspirationStatus;
  upvoterIds: string[];
  pollOptions?: ForumPollOption[];
  comments: ForumComment[];
}

export interface GuestReport {
  id: string;
  hostName: string;
  hostBlock: string;
  guestName: string;
  relation: string;
  duration: string;
  createdAt: string;
}

export const MONTHS_12: Array<{ key: string; short: string; full: string }> = [
  { key: '01', short: 'Jan', full: 'Januari' },
  { key: '02', short: 'Feb', full: 'Februari' },
  { key: '03', short: 'Mar', full: 'Maret' },
  { key: '04', short: 'Apr', full: 'April' },
  { key: '05', short: 'Mei', full: 'Mei' },
  { key: '06', short: 'Jun', full: 'Juni' },
  { key: '07', short: 'Jul', full: 'Juli' },
  { key: '08', short: 'Agu', full: 'Agustus' },
  { key: '09', short: 'Sep', full: 'September' },
  { key: '10', short: 'Okt', full: 'Oktober' },
  { key: '11', short: 'Nov', full: 'November' },
  { key: '12', short: 'Des', full: 'Desember' },
];

const STORAGE_KEYS = {
  PROFILE: 'wargaqu_rt_profile_v2',
  COORDINATORS: 'wargaqu_rt_coordinators_v2',
  MEMBERS: 'wargaqu_rt_members_v2',
  TRANSACTIONS: 'wargaqu_rt_kas_v2',
  AUDIT_LOGS: 'wargaqu_rt_siaga_audit_v2',
  FORUM_POSTS: 'wargaqu_rt_forum_v1',
  GUEST_REPORTS: 'wargaqu_rt_guests_v1',
  ARCHIVES: 'wargaqu_rt_archives_v1',
  INVITATIONS: 'wargaqu_rt_invitations_v1',
};

const DEFAULT_ARCHIVES: HistoricalArchiveYear[] = [
  {
    id: 'arc-2024',
    year: 2024,
    totalIncome: 24800000,
    totalExpense: 18450000,
    endingBalance: 9650000,
    note: 'Rekap tutup buku tahun 2024 (perbaikan selokan & pos ronda)',
    source: 'Manual',
  },
  {
    id: 'arc-2025',
    year: 2025,
    totalIncome: 26400000,
    totalExpense: 23630000,
    endingBalance: 12420000,
    note: 'Saldo akhir 31 Des 2025 dipindahkan sebagai Saldo Awal 2026',
    source: 'Manual',
  },
];

const DEFAULT_INVITATIONS: CommunityInvitation[] = [
  {
    id: 'inv-1',
    eventType: 'Rapat Warga',
    title: 'Rapat Koordinasi Tutup Buku & Anggaran 2026',
    dateTime: 'Sabtu, 14 Nov 2026 · 19:30 WIB',
    location: 'Balai Warga RT 03',
    targetAudience: 'Seluruh Kepala Keluarga (Blok A - C)',
    agenda: '1. Laporan Kas & Arsip 2025  2. Penetapan Iuran 2026  3. Aktivasi SiagaQu',
    senderName: 'Bpk. Bambang Sutrisno (Ketua)',
    createdAt: 'Hari ini · 09:00',
    rsvps: {
      'warga-bambang': {
        memberId: 'warga-bambang',
        name: 'Bambang Sutrisno',
        block: 'Blok A No. 01',
        status: 'hadir',
      },
      'warga-sri': {
        memberId: 'warga-sri',
        name: 'Sri Wahyuni',
        block: 'Blok B No. 04',
        status: 'hadir',
      },
    },
  },
  {
    id: 'inv-2',
    eventType: 'Kerja Bakti',
    title: 'Undangan Kerja Bakti & Bersih Saluran Air',
    dateTime: 'Minggu, 15 Nov 2026 · 07:30 WIB',
    location: 'Sepanjang Gang Blok A - Blok C',
    targetAudience: 'Perwakilan 1 orang tiap rumah',
    agenda: 'Pembersihan gorong-gorong antisipasi musim hujan dan perapian ranting pohon.',
    senderName: 'Bpk. Joko Purnomo (Koord. Kebersihan)',
    createdAt: 'Kemarin · 16:20',
    rsvps: {
      'warga-bambang': {
        memberId: 'warga-bambang',
        name: 'Bambang Sutrisno',
        block: 'Blok A No. 01',
        status: 'hadir',
      },
    },
  },
];

const DEFAULT_FORUM_POSTS: ForumPost[] = [
  {
    id: 'post-1',
    category: 'jadwal',
    title: 'Kerja Bakti Saluran Air & Pemangkasan Dahan Blok A-C',
    content: 'Mohon kehadiran minimal 1 perwakilan rumah membawa alat kebersihan seadanya. Konsumsi teh hangat & kue disediakan di Balai Warga.',
    authorName: 'Bpk. Bambang Sutrisno',
    authorRole: 'Ketua',
    createdAt: 'Hari ini · 08:15',
    scheduleDate: 'Minggu, 07:30 WIB',
    scheduleLocation: 'Balai Warga & Selokan Blok A-C',
    attendeeIds: ['warga-bambang', 'warga-sri'],
    upvoterIds: ['warga-bambang', 'warga-sri'],
    comments: [
      {
        id: 'c-1',
        author: 'Ibu Sri Wahyuni',
        authorBlock: 'Blok B No. 04',
        text: 'Siap, konsumsi gorengan dan air mineral sudah kami koordinasikan.',
        time: '08:40',
      },
    ],
  },
  {
    id: 'post-2',
    category: 'jadwal',
    title: 'Jadwal Ronda Siskamling Pekan Ini (22:00 - 04:00 WIB)',
    content: 'Senin: Bpk. Bambang & Hendriana | Selasa: Bpk. Dedi, Joko & Anton | Rabu: Bpk. Agus, Wawan & Rudi. Harap lapor di pos jika berhalangan.',
    authorName: 'Bpk. Dedi Suryadi',
    authorRole: 'Koordinator Keamanan',
    createdAt: 'Kemarin · 19:00',
    scheduleDate: 'Setiap Malam · 22:00 WIB',
    scheduleLocation: 'Pos Ronda Utama',
    attendeeIds: ['warga-bambang'],
    upvoterIds: ['warga-bambang'],
    comments: [],
  },
  {
    id: 'post-3',
    category: 'aspirasi',
    title: 'Lampu Penerangan Jalan Gang Blok B Mati 2 Titik',
    content: 'Lampu tiang dekat rumah Blok B No. 07 dan pojok taman bermain mati sejak dua malam lalu sehingga agak gelap saat malam.',
    authorName: 'Hendriana',
    authorRole: 'Warga Blok A No. 12',
    createdAt: '2 hari lalu',
    aspirationStatus: 'Diproses',
    upvoterIds: ['warga-hendriana', 'warga-sri', 'warga-bambang'],
    comments: [
      {
        id: 'c-2',
        author: 'Bpk. Joko Purnomo',
        authorBlock: 'Koordinator Kebersihan',
        text: 'Sudah dicek, bohlam LED pengganti sudah dibeli dari kas dan dipasang sore ini.',
        time: 'Kemarin',
      },
    ],
  },
  {
    id: 'post-4',
    category: 'polling',
    title: 'Musyawarah: Tambah 2 Unit CCTV di Portal Selatan?',
    content: 'Estimasi biaya Rp 1.400.000 diambil dari saldo kas warga tanpa menaikkan iuran bulanan. Bagaimana pendapat warga?',
    authorName: 'Pengurus Lingkungan',
    authorRole: 'Musyawarah Warga',
    createdAt: '3 hari lalu',
    upvoterIds: ['warga-bambang'],
    pollOptions: [
      { id: 'opt-1', label: 'Setuju, pasang bulan ini', voterIds: ['warga-bambang', 'warga-sri'] },
      { id: 'opt-2', label: 'Tunda, bahas saat rapat warga', voterIds: [] },
    ],
    comments: [],
  },
];

export const RT_SYNC_EVENT = 'wargaqu-rt-siaga-sync';

function buildInitialPayments(paidThroughMonth: number, amount: number): Record<string, MonthlyPaymentRecord> {
  const map: Record<string, MonthlyPaymentRecord> = {};
  MONTHS_12.forEach((m, index) => {
    const monthNum = index + 1;
    if (monthNum <= paidThroughMonth) {
      map[m.key] = {
        paid: true,
        paidAt: `05 ${m.short} 2026`,
        method: 'QRIS RT-Pay',
        amount,
      };
    } else {
      map[m.key] = {
        paid: false,
        amount,
      };
    }
  });
  return map;
}

const DEFAULT_PROFILE: PaguyubanProfile = {
  orgType: 'RT',
  orgName: 'RT 03 / RW 05',
  areaName: 'Perumahan Harmoni Sukamaju',
  monthlyDuesAmount: 50000,
  duesBreakdown: {
    keamanan: 25000,
    sampah: 15000,
    kas: 10000,
  },
  year: 2026,
  pengurusPin: '0305',
};

const DEFAULT_COORDINATORS: CoordinatorMember[] = [
  {
    id: 'coord-1',
    role: 'Ketua RT / Paguyuban',
    division: 'Pimpinan & Pengesahan',
    name: 'Bpk. Bambang Sutrisno',
    phone: '0812-3456-7890',
    canVerifySiaga: true,
  },
  {
    id: 'coord-2',
    role: 'Koordinator Keamanan & SiagaQu',
    division: 'Siskamling & Verifikasi Darurat',
    name: 'Bpk. Dedi Suryadi',
    phone: '0819-7788-9900',
    canVerifySiaga: true,
  },
  {
    id: 'coord-3',
    role: 'Bendahara',
    division: 'Iuran & Transparansi Kas',
    name: 'Ibu Sri Wahyuni',
    phone: '0821-4455-6677',
    canVerifySiaga: false,
  },
  {
    id: 'coord-4',
    role: 'Sekretaris',
    division: 'Administrasi & Surat Warga',
    name: 'Bpk. Agus Permana',
    phone: '0813-8899-1122',
    canVerifySiaga: false,
  },
  {
    id: 'coord-5',
    role: 'Koordinator Kebersihan',
    division: 'Sampah & Lingkungan',
    name: 'Bpk. Joko Purnomo',
    phone: '0857-1234-5678',
    canVerifySiaga: false,
  },
];

const DEFAULT_MEMBERS: WargaMember[] = [
  {
    id: 'warga-hendriana',
    wargaId: 'WQ-RT03-012',
    name: 'Hendriana',
    block: 'Blok A No. 12',
    phone: '0812-8800-1212',
    residentType: 'Tetap',
    isCurrentUser: true,
    claimStatus: 'claimed',
    claimCode: 'RT03-A12-1212',
    claimedAt: '05 Jan 2026',
    siagaStatus: 'pending',
    siagaRequested: false,
    falseAlarmCount: 0,
    monthlyPayments: buildInitialPayments(9, 50000), // Jan-Sep paid, Okt-Des unpaid
  },
  {
    id: 'warga-bambang',
    wargaId: 'WQ-RT03-001',
    name: 'Bambang Sutrisno',
    block: 'Blok A No. 01',
    phone: '0812-3456-7890',
    residentType: 'Tetap',
    claimStatus: 'claimed',
    claimCode: 'RT03-A01-7890',
    claimedAt: '02 Jan 2026',
    siagaStatus: 'active',
    siagaVerifiedBy: 'Koordinator Keamanan',
    siagaVerifiedAt: '10 Jan 2026',
    falseAlarmCount: 0,
    monthlyPayments: buildInitialPayments(10, 50000),
  },
  {
    id: 'warga-sri',
    wargaId: 'WQ-RT03-005',
    name: 'Sri Wahyuni',
    block: 'Blok B No. 04',
    phone: '0821-4455-6677',
    residentType: 'Tetap',
    claimStatus: 'claimed',
    claimCode: 'RT03-B04-6677',
    claimedAt: '03 Jan 2026',
    siagaStatus: 'active',
    siagaVerifiedBy: 'Ketua RT 03',
    siagaVerifiedAt: '12 Jan 2026',
    falseAlarmCount: 0,
    monthlyPayments: buildInitialPayments(10, 50000),
  },
  {
    id: 'warga-agus-excel',
    wargaId: 'WQ-RT03-015',
    name: 'Agus Wijaya',
    block: 'Blok B No. 09',
    phone: '0813-2244-5588',
    residentType: 'Tetap',
    claimStatus: 'unclaimed',
    claimCode: 'RT03-B09-5588',
    priorArrears: 100000,
    priorArrearsNote: 'Sisa iuran Nov-Des 2025',
    siagaStatus: 'pending',
    siagaRequested: false,
    falseAlarmCount: 0,
    monthlyPayments: buildInitialPayments(8, 50000),
  },
  {
    id: 'warga-ratna-excel',
    wargaId: 'WQ-RT03-017',
    name: 'Ratna Dewi',
    block: 'Blok C No. 03',
    phone: '0852-9090-3344',
    residentType: 'Kontrak',
    claimStatus: 'invited',
    claimCode: 'RT03-C03-3344',
    invitedAt: '10 Nov 2026',
    siagaStatus: 'pending',
    siagaRequested: false,
    falseAlarmCount: 0,
    monthlyPayments: buildInitialPayments(10, 50000),
  },
  {
    id: 'warga-rudi',
    wargaId: 'WQ-RT03-019',
    name: 'Rudi Hartono',
    block: 'Blok C No. 08',
    phone: '0856-7711-2233',
    residentType: 'Kontrak',
    claimStatus: 'claimed',
    claimCode: 'RT03-C08-2233',
    claimedAt: '15 Jan 2026',
    siagaStatus: 'suspended',
    suspendReason: 'Laporan palsu sirine darurat (28 Okt)',
    falseAlarmCount: 2,
    monthlyPayments: buildInitialPayments(7, 50000),
  },
];

const DEFAULT_TRANSACTIONS: KasTransaction[] = [
  {
    id: 'kas-1',
    type: 'masuk',
    category: 'Iuran Warga',
    title: 'Iuran Kebersihan & Keamanan (46 KK Okt)',
    amount: 2300000,
    date: '05 Okt 2026',
    recordedBy: 'Ibu Sri Wahyuni (Bendahara)',
  },
  {
    id: 'kas-2',
    type: 'keluar',
    category: 'Gaji Keamanan',
    title: 'Gaji 2 Petugas Keamanan / Satpam Malam',
    amount: 1400000,
    date: '06 Okt 2026',
    recordedBy: 'Ibu Sri Wahyuni (Bendahara)',
  },
  {
    id: 'kas-3',
    type: 'keluar',
    category: 'Petugas Sampah',
    title: 'Honor Petugas Angkut Sampah Lingkungan',
    amount: 650000,
    date: '08 Okt 2026',
    recordedBy: 'Ibu Sri Wahyuni (Bendahara)',
  },
  {
    id: 'kas-4',
    type: 'keluar',
    category: 'Listrik & Pos Ronda',
    title: 'Token Listrik Pos Ronda & Lampu Gang',
    amount: 220000,
    date: '12 Okt 2026',
    recordedBy: 'Bpk. Dedi Suryadi',
  },
  {
    id: 'kas-5',
    type: 'masuk',
    category: 'Donasi / Kas',
    title: 'Saldo Kas Awal Tahun & Donasi Warga',
    amount: 12420000,
    date: '01 Okt 2026',
    recordedBy: 'Ibu Sri Wahyuni (Bendahara)',
  },
];

const DEFAULT_AUDIT_LOGS: SiagaAuditLog[] = [
  {
    id: 'LOG-INIT',
    timestamp: '19:45',
    date: '28 Okt',
    category: 'Maling / Kejahatan',
    mode: 'Simulasi',
    reporterId: 'warga-hendriana',
    reporterName: 'Hendriana',
    reporterBlock: 'Blok A No. 12',
    location: 'RT 03 / RW 05 - Blok A No. 12',
    transcript: '"Simulasi respon pos ronda terkoordinasi lancar di pos utama RT 03."',
    auditStatus: 'valid',
  },
];

function emitSync() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(RT_SYNC_EVENT));
  }
}

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw) as T;
    }
  } catch {
    // ignore storage parse failure
  }
  return fallback;
}

function safeWrite<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    emitSync();
  } catch {
    // ignore storage write failure
  }
}

export const RtSiagaStorage = {
  getProfile(): PaguyubanProfile {
    return safeRead(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
  },
  saveProfile(profile: PaguyubanProfile) {
    safeWrite(STORAGE_KEYS.PROFILE, profile);
  },

  getCoordinators(): CoordinatorMember[] {
    return safeRead(STORAGE_KEYS.COORDINATORS, DEFAULT_COORDINATORS);
  },
  saveCoordinators(coords: CoordinatorMember[]) {
    safeWrite(STORAGE_KEYS.COORDINATORS, coords);
  },

  getMembers(): WargaMember[] {
    const raw = safeRead(STORAGE_KEYS.MEMBERS, DEFAULT_MEMBERS);
    return raw.map((m, idx) => ({
      ...m,
      claimStatus: m.claimStatus || 'claimed',
      claimCode:
        m.claimCode ||
        `WQ-${String(idx + 1).padStart(2, '0')}-${(m.phone.replace(/\D/g, '').slice(-4) || '0000')}`,
    }));
  },
  saveMembers(members: WargaMember[]) {
    safeWrite(STORAGE_KEYS.MEMBERS, members);
  },

  getCurrentMember(): WargaMember {
    const members = this.getMembers();
    return members.find(m => m.isCurrentUser) || members[0];
  },

  switchCurrentUser(memberId: string) {
    const members = this.getMembers().map(m => ({
      ...m,
      isCurrentUser: m.id === memberId,
    }));
    this.saveMembers(members);
  },

  syncAuthAccount(account: AuthAccount | null) {
    if (!account) return;
    const cleanEmail = account.email.trim().toLowerCase();
    const cleanPhoneDigits = account.phone.replace(/\D/g, '');
    const members = this.getMembers();

    const matchedByCred = members.find(m => {
      const mEmail = (m.email || '').trim().toLowerCase();
      const mDigits = m.phone.replace(/\D/g, '');
      const emailMatches = mEmail && mEmail === cleanEmail;
      const phoneMatches =
        cleanPhoneDigits.length >= 6 &&
        mDigits.length >= 6 &&
        mDigits.slice(-8) === cleanPhoneDigits.slice(-8);
      return Boolean(emailMatches || phoneMatches);
    });

    const targetId = matchedByCred?.id || (members.find(m => m.isCurrentUser) || members[0])?.id;
    const updated = members.map(m => {
      if (m.id !== targetId) {
        return { ...m, isCurrentUser: false };
      }
      return {
        ...m,
        isCurrentUser: true,
        email: cleanEmail,
        phone: account.phone.trim(),
        deviceId: account.deviceId,
        claimStatus: m.claimStatus || ('claimed' as const),
      };
    });
    this.saveMembers(updated);
  },

  getTransactions(): KasTransaction[] {
    return safeRead(STORAGE_KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS);
  },
  saveTransactions(txs: KasTransaction[]) {
    safeWrite(STORAGE_KEYS.TRANSACTIONS, txs);
  },

  getAuditLogs(): SiagaAuditLog[] {
    return safeRead(STORAGE_KEYS.AUDIT_LOGS, DEFAULT_AUDIT_LOGS);
  },
  saveAuditLogs(logs: SiagaAuditLog[]) {
    safeWrite(STORAGE_KEYS.AUDIT_LOGS, logs);
  },

  payMemberMonth(memberId: string, monthKey: string, method: string = 'QRIS RT-Pay') {
    const profile = this.getProfile();
    const members = this.getMembers();
    const target = members.find(m => m.id === memberId);
    if (!target) return;

    const monthLabel = MONTHS_12.find(m => m.key === monthKey)?.short || monthKey;
    const todayLabel = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const updatedMembers = members.map(m => {
      if (m.id !== memberId) return m;
      return {
        ...m,
        monthlyPayments: {
          ...m.monthlyPayments,
          [monthKey]: {
            paid: true,
            paidAt: todayLabel,
            method,
            amount: profile.monthlyDuesAmount,
          },
        },
      };
    });

    const newTx: KasTransaction = {
      id: `kas-${Date.now()}`,
      type: 'masuk',
      category: 'Iuran Warga',
      title: `Iuran ${monthLabel} ${profile.year} - ${target.name} (${target.block})`,
      amount: profile.monthlyDuesAmount,
      date: todayLabel,
      recordedBy: method,
    };

    this.saveMembers(updatedMembers);
    this.saveTransactions([newTx, ...this.getTransactions()]);
  },

  payMemberMultipleMonths(memberId: string, monthKeys: string[], method: string = 'QRIS RT-Pay') {
    const profile = this.getProfile();
    const members = this.getMembers();
    const target = members.find(m => m.id === memberId);
    if (!target || monthKeys.length === 0) return;

    const todayLabel = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const updatedMembers = members.map(m => {
      if (m.id !== memberId) return m;
      const nextPayments = { ...m.monthlyPayments };
      monthKeys.forEach(mk => {
        nextPayments[mk] = {
          paid: true,
          paidAt: todayLabel,
          method,
          amount: profile.monthlyDuesAmount,
        };
      });
      return { ...m, monthlyPayments: nextPayments };
    });

    const monthNames = monthKeys
      .map(mk => MONTHS_12.find(m => m.key === mk)?.short || mk)
      .join(', ');
    const totalAmount = profile.monthlyDuesAmount * monthKeys.length;

    const newTx: KasTransaction = {
      id: `kas-${Date.now()}`,
      type: 'masuk',
      category: 'Iuran Warga',
      title: `Iuran (${monthNames}) ${profile.year} - ${target.name} (${target.block})`,
      amount: totalAmount,
      date: todayLabel,
      recordedBy: method,
    };

    this.saveMembers(updatedMembers);
    this.saveTransactions([newTx, ...this.getTransactions()]);
  },

  getForumPosts(): ForumPost[] {
    return safeRead(STORAGE_KEYS.FORUM_POSTS, DEFAULT_FORUM_POSTS);
  },
  saveForumPosts(posts: ForumPost[]) {
    safeWrite(STORAGE_KEYS.FORUM_POSTS, posts);
  },
  addForumPost(post: Omit<ForumPost, 'id' | 'createdAt' | 'upvoterIds' | 'comments'>) {
    const newPost: ForumPost = {
      ...post,
      id: `post-${Date.now()}`,
      createdAt: 'Baru saja',
      upvoterIds: [],
      comments: [],
    };
    this.saveForumPosts([newPost, ...this.getForumPosts()]);
  },
  toggleForumUpvote(postId: string, memberId: string) {
    const updated = this.getForumPosts().map(p => {
      if (p.id !== postId) return p;
      const exists = p.upvoterIds.includes(memberId);
      return {
        ...p,
        upvoterIds: exists
          ? p.upvoterIds.filter(id => id !== memberId)
          : [...p.upvoterIds, memberId],
      };
    });
    this.saveForumPosts(updated);
  },
  toggleForumAttendance(postId: string, memberId: string) {
    const updated = this.getForumPosts().map(p => {
      if (p.id !== postId) return p;
      const current = p.attendeeIds || [];
      const exists = current.includes(memberId);
      return {
        ...p,
        attendeeIds: exists
          ? current.filter(id => id !== memberId)
          : [...current, memberId],
      };
    });
    this.saveForumPosts(updated);
  },
  voteForumPoll(postId: string, optionId: string, memberId: string) {
    const updated = this.getForumPosts().map(p => {
      if (p.id !== postId || !p.pollOptions) return p;
      return {
        ...p,
        pollOptions: p.pollOptions.map(opt => {
          const cleaned = opt.voterIds.filter(id => id !== memberId);
          return opt.id === optionId
            ? { ...opt, voterIds: [...cleaned, memberId] }
            : { ...opt, voterIds: cleaned };
        }),
      };
    });
    this.saveForumPosts(updated);
  },
  addForumComment(postId: string, comment: Omit<ForumComment, 'id' | 'time'>) {
    const updated = this.getForumPosts().map(p => {
      if (p.id !== postId) return p;
      const newComment: ForumComment = {
        ...comment,
        id: `c-${Date.now()}`,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      return { ...p, comments: [...p.comments, newComment] };
    });
    this.saveForumPosts(updated);
  },
  updateAspirationStatus(postId: string, status: AspirationStatus) {
    const updated = this.getForumPosts().map(p =>
      p.id === postId ? { ...p, aspirationStatus: status } : p
    );
    this.saveForumPosts(updated);
  },

  getGuestReports(): GuestReport[] {
    return safeRead(STORAGE_KEYS.GUEST_REPORTS, []);
  },
  addGuestReport(report: Omit<GuestReport, 'id' | 'createdAt'>) {
    const next: GuestReport = {
      ...report,
      id: `gst-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    safeWrite(STORAGE_KEYS.GUEST_REPORTS, [next, ...this.getGuestReports()]);
  },

  requestSiagaActivation(memberId: string) {
    const members = this.getMembers();
    const updated = members.map(m =>
      m.id === memberId ? { ...m, siagaRequested: true } : m
    );
    this.saveMembers(updated);
  },

  setMemberSiagaStatus(
    memberId: string,
    status: SiagaActivationStatus,
    verifierName: string,
    reason?: string
  ) {
    const members = this.getMembers();
    const todayLabel = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const updated = members.map(m => {
      if (m.id !== memberId) return m;
      return {
        ...m,
        siagaStatus: status,
        siagaRequested: false,
        siagaVerifiedBy: status === 'active' ? verifierName : m.siagaVerifiedBy,
        siagaVerifiedAt: status === 'active' ? todayLabel : m.siagaVerifiedAt,
        suspendReason: status === 'suspended' ? reason || 'Penyalahgunaan / laporan palsu' : undefined,
        falseAlarmCount: status === 'suspended' ? m.falseAlarmCount + 1 : m.falseAlarmCount,
      };
    });
    this.saveMembers(updated);
  },

  addTransaction(tx: Omit<KasTransaction, 'id'>) {
    const newTx: KasTransaction = {
      ...tx,
      id: `kas-${Date.now()}`,
    };
    this.saveTransactions([newTx, ...this.getTransactions()]);
  },

  addSiagaAuditLog(log: Omit<SiagaAuditLog, 'auditStatus'>) {
    const logs = this.getAuditLogs();
    const nextLog: SiagaAuditLog = {
      ...log,
      auditStatus: log.mode === 'REAL' ? 'pending' : 'valid',
    };
    this.saveAuditLogs([nextLog, ...logs]);
  },

  markAuditLogAsPrank(logId: string, verifierName: string) {
    const logs = this.getAuditLogs();
    const targetLog = logs.find(l => l.id === logId);
    const updatedLogs = logs.map(l =>
      l.id === logId ? { ...l, auditStatus: 'prank' as const } : l
    );
    this.saveAuditLogs(updatedLogs);

    if (targetLog?.reporterId) {
      this.setMemberSiagaStatus(
        targetLog.reporterId,
        'suspended',
        verifierName,
        `Alarm palsu (${targetLog.category}, ${targetLog.date} ${targetLog.timestamp})`
      );
    }
  },

  // --- Historical Archives (2020-2025) & Lembaran Baru 2026 ---
  getArchives(): HistoricalArchiveYear[] {
    return safeRead(STORAGE_KEYS.ARCHIVES, DEFAULT_ARCHIVES).sort((a, b) => b.year - a.year);
  },
  saveArchives(archives: HistoricalArchiveYear[]) {
    safeWrite(STORAGE_KEYS.ARCHIVES, archives);
  },
  addArchive(archive: Omit<HistoricalArchiveYear, 'id'>) {
    const next: HistoricalArchiveYear = {
      ...archive,
      id: `arc-${archive.year}-${Date.now()}`,
    };
    const existing = this.getArchives().filter(a => a.year !== archive.year);
    this.saveArchives([next, ...existing]);
  },
  deleteArchive(id: string) {
    this.saveArchives(this.getArchives().filter(a => a.id !== id));
  },

  // --- Invitations & RSVP ---
  getInvitations(): CommunityInvitation[] {
    return safeRead(STORAGE_KEYS.INVITATIONS, DEFAULT_INVITATIONS);
  },
  saveInvitations(invs: CommunityInvitation[]) {
    safeWrite(STORAGE_KEYS.INVITATIONS, invs);
  },
  addInvitation(inv: Omit<CommunityInvitation, 'id' | 'createdAt' | 'rsvps'>) {
    const next: CommunityInvitation = {
      ...inv,
      id: `inv-${Date.now()}`,
      createdAt: 'Baru saja',
      rsvps: {},
    };
    this.saveInvitations([next, ...this.getInvitations()]);
  },
  setInvitationRsvp(
    invitationId: string,
    member: WargaMember,
    status: InvitationRsvpStatus,
    note?: string
  ) {
    const updated = this.getInvitations().map(inv => {
      if (inv.id !== invitationId) return inv;
      return {
        ...inv,
        rsvps: {
          ...inv.rsvps,
          [member.id]: {
            memberId: member.id,
            name: member.name,
            block: member.block,
            status,
            note,
          },
        },
      };
    });
    this.saveInvitations(updated);
  },

  // --- Pre-registered Warga Invite & Claim System ---
  generateClaimCode(orgName: string, block: string, phone: string): string {
    const orgPrefix = orgName.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase() || 'WQ';
    const blockCode = block.replace(/[^A-Za-z0-9]/g, '').slice(-3).toUpperCase() || 'WRG';
    const phoneDigits = phone.replace(/\D/g, '').slice(-4) || String(Math.floor(1000 + Math.random() * 9000));
    return `${orgPrefix}-${blockCode}-${phoneDigits}`;
  },

  markMemberInvited(memberId: string) {
    const profile = this.getProfile();
    const todayLabel = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const updated = this.getMembers().map(m => {
      if (m.id !== memberId) return m;
      return {
        ...m,
        claimCode: m.claimCode || this.generateClaimCode(profile.orgName, m.block, m.phone),
        claimStatus: m.claimStatus === 'claimed' ? ('claimed' as const) : ('invited' as const),
        invitedAt: todayLabel,
      };
    });
    this.saveMembers(updated);
  },

  claimMemberProfile(
    claimCodeInput: string,
    phoneLast4Input: string
  ): { ok: boolean; message: string; member?: WargaMember } {
    const normalizedCode = claimCodeInput.trim().toUpperCase();
    const normalizedDigits = phoneLast4Input.replace(/\D/g, '');
    if (!normalizedCode) {
      return { ok: false, message: 'Masukkan Kode Klaim dari undangan pengurus.' };
    }

    const members = this.getMembers();
    const match = members.find(m => (m.claimCode || '').toUpperCase() === normalizedCode);
    if (!match) {
      return { ok: false, message: 'Kode Klaim tidak ditemukan. Periksa kembali pesan undangan.' };
    }

    const memberPhoneDigits = match.phone.replace(/\D/g, '');
    if (memberPhoneDigits.length >= 4) {
      const expectedLast4 = memberPhoneDigits.slice(-4);
      if (normalizedDigits !== expectedLast4) {
        return {
          ok: false,
          message: '4 digit terakhir No HP tidak cocok dengan data yang didaftarkan pengurus.',
        };
      }
    }

    const todayLabel = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const updated = members.map(m => ({
      ...m,
      isCurrentUser: m.id === match.id,
      claimStatus: m.id === match.id ? ('claimed' as const) : m.claimStatus,
      claimedAt: m.id === match.id ? todayLabel : m.claimedAt,
    }));

    this.saveMembers(updated);
    const claimedMember = updated.find(m => m.id === match.id);
    return {
      ok: true,
      message: `Selamat datang ${match.name} (${match.block})! Profil & kartu iuran 2026 berhasil diklaim.`,
      member: claimedMember,
    };
  },

  // --- Smart Excel Import & Lembaran Baru 2026 ---
  applySmartExcelImport(params: {
    mode: 'merge' | 'fresh_2026';
    openingBalance?: number;
    openingBalanceNote?: string;
    importedMembers: Array<{
      name: string;
      block: string;
      phone: string;
      residentType: 'Tetap' | 'Kontrak';
      paidMonthsCount: number;
      priorArrears?: number;
      priorArrearsNote?: string;
    }>;
    importedArchives?: Array<{
      year: number;
      totalIncome: number;
      totalExpense: number;
      endingBalance: number;
      note: string;
    }>;
  }) {
    const profile = this.getProfile();
    const todayLabel = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const existingMembers = this.getMembers();
    const currentActive = existingMembers.find(m => m.isCurrentUser) || existingMembers[0];

    const newMembers: WargaMember[] = params.importedMembers.map((row, idx) => {
      const seq = existingMembers.length + idx + 1;
      const phoneClean = row.phone.trim() || '-';
      return {
        id: `warga-xls-${Date.now()}-${idx}`,
        wargaId: `WQ-${profile.year}-${String(seq).padStart(3, '0')}`,
        name: row.name.trim(),
        block: row.block.trim() || `Unit ${seq}`,
        phone: phoneClean,
        residentType: row.residentType,
        isCurrentUser: false,
        claimStatus: 'unclaimed',
        claimCode: this.generateClaimCode(profile.orgName, row.block || String(seq), phoneClean),
        priorArrears: row.priorArrears || 0,
        priorArrearsNote: row.priorArrearsNote,
        siagaStatus: 'pending',
        siagaRequested: false,
        falseAlarmCount: 0,
        monthlyPayments: buildInitialPayments(
          Math.max(0, Math.min(12, row.paidMonthsCount || 0)),
          profile.monthlyDuesAmount
        ),
      };
    });

    if (params.mode === 'fresh_2026') {
      // Preserve current active operator account + add imported pre-registered residents
      const keptCurrent: WargaMember = {
        ...currentActive,
        isCurrentUser: true,
        claimStatus: 'claimed',
        monthlyPayments: buildInitialPayments(0, profile.monthlyDuesAmount),
      };
      this.saveMembers([keptCurrent, ...newMembers]);

      const openingTx: KasTransaction = {
        id: `kas-open-${Date.now()}`,
        type: 'masuk',
        category: 'Donasi / Kas',
        title: params.openingBalanceNote?.trim() || `Saldo Awal Lembaran Baru ${profile.year}`,
        amount: Math.max(0, params.openingBalance || 0),
        date: todayLabel,
        recordedBy: 'Tutup Buku / Impor Excel',
      };
      this.saveTransactions(openingTx.amount > 0 ? [openingTx] : []);
    } else {
      // Merge mode: avoid duplicate name+block
      const existingKeys = new Set(
        existingMembers.map(m => `${m.name.toLowerCase()}::${m.block.toLowerCase()}`)
      );
      const uniqueNew = newMembers.filter(
        m => !existingKeys.has(`${m.name.toLowerCase()}::${m.block.toLowerCase()}`)
      );
      this.saveMembers([...existingMembers, ...uniqueNew]);

      if (params.openingBalance && params.openingBalance > 0) {
        const tx: KasTransaction = {
          id: `kas-imp-${Date.now()}`,
          type: 'masuk',
          category: 'Donasi / Kas',
          title: params.openingBalanceNote?.trim() || 'Penyesuaian Saldo dari Impor Excel',
          amount: params.openingBalance,
          date: todayLabel,
          recordedBy: 'Impor Excel Pengurus',
        };
        this.saveTransactions([tx, ...this.getTransactions()]);
      }
    }

    if (params.importedArchives && params.importedArchives.length > 0) {
      const currentArchives = params.mode === 'fresh_2026' ? [] : this.getArchives();
      const mapByYear = new Map<number, HistoricalArchiveYear>();
      currentArchives.forEach(a => mapByYear.set(a.year, a));
      params.importedArchives.forEach(a => {
        mapByYear.set(a.year, {
          id: `arc-xls-${a.year}`,
          year: a.year,
          totalIncome: a.totalIncome,
          totalExpense: a.totalExpense,
          endingBalance: a.endingBalance,
          note: a.note || `Rekap impor Excel tahun ${a.year}`,
          source: 'Impor Excel',
        });
      });
      this.saveArchives(Array.from(mapByYear.values()));
    }
  },

  startFreshYear2026(openingBalance: number, note: string) {
    const profile = this.getProfile();
    const todayLabel = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const resetMembers = this.getMembers().map(m => ({
      ...m,
      monthlyPayments: buildInitialPayments(0, profile.monthlyDuesAmount),
    }));
    this.saveMembers(resetMembers);

    const txs: KasTransaction[] =
      openingBalance > 0
        ? [
            {
              id: `kas-fresh-${Date.now()}`,
              type: 'masuk',
              category: 'Donasi / Kas',
              title: note.trim() || `Saldo Awal Pindahan ke Lembaran Baru ${profile.year}`,
              amount: openingBalance,
              date: todayLabel,
              recordedBy: 'Pengurus (Tutup Buku)',
            },
          ]
        : [];
    this.saveTransactions(txs);
  },
};
