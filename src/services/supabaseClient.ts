import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;
let currentConfig = {
  url: '',
  anonKey: ''
};

export function getSupabaseClient(overrideUrl?: string, overrideKey?: string): SupabaseClient | null {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  const url = (overrideUrl || envUrl || '').trim();
  const anonKey = (overrideKey || envKey || '').trim();

  // If no URL or default placeholder is present, return null (offline mode)
  if (!url || !anonKey || url.includes('your-project-id') || url.includes('your-project.supabase.co')) {
    supabaseInstance = null;
    return null;
  }

  if (supabaseInstance && currentConfig.url === url && currentConfig.anonKey === anonKey) {
    return supabaseInstance;
  }

  try {
    supabaseInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
    currentConfig = { url, anonKey };
    return supabaseInstance;
  } catch (err) {
    console.error('Gagal menginisialisasi Supabase client:', err);
    supabaseInstance = null;
    return null;
  }
}

export async function testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
  try {
    const client = getSupabaseClient(url, key) || createClient(url, key, { auth: { persistSession: false } });
    // Coba query sederhana ke tabel contents
    const { error } = await client.from('contents').select('id').limit(1);
    if (error) {
      // Jika tabel belum dibuat tapi kredensial benar
      if (error.code === '42P01') {
        return {
          success: true,
          message: 'Terkoneksi ke Supabase, namun tabel belum dibuat. Harap jalankan script schema.sql di SQL Editor.'
        };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Koneksi ke Supabase Cloud berhasil & tabel terverifikasi!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Gagal menghubungi server Supabase.' };
  }
}
