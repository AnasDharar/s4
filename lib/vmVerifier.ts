import { isIP } from 'node:net';

export interface VmVerificationResult {
  success: boolean;
  error?: string;
}

function isPublicIpv4(ip: string) {
  const [a, b] = ip.split('.').map(Number);
  if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
  if (a === 100 && b >= 64 && b <= 127) return false;
  if (a === 169 && b === 254) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && (b === 0 || b === 168)) return false;
  if (a === 198 && (b === 18 || b === 19)) return false;
  if (a === 203 && b === 0) return false;
  return true;
}

function isPublicIp(ip: string) {
  const family = isIP(ip);
  if (family === 4) return isPublicIpv4(ip);
  if (family !== 6) return false;

  const value = ip.toLowerCase();
  return value !== '::' && value !== '::1' && !value.startsWith('fc') && !value.startsWith('fd') && !value.startsWith('fe8') && !value.startsWith('fe9') && !value.startsWith('fea') && !value.startsWith('feb') && !value.startsWith('ff');
}

export async function verifyVmDeployment(rawIp: string): Promise<VmVerificationResult> {
  const ip = rawIp.trim();
  if (!isIP(ip)) return { success: false, error: 'Enter a valid IP address.' };
  if (!isPublicIp(ip)) return { success: false, error: 'Enter a public VM IP address.' };

  const host = isIP(ip) === 6 ? `[${ip}]` : ip;
  try {
    const response = await fetch(`http://${host}`, {
      headers: { Accept: 'text/html' },
      redirect: 'manual',
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return { success: false, error: 'The VM page could not be verified.' };
    const html = await response.text();
    return html.toLowerCase().includes('nginx')
      ? { success: true }
      : { success: false, error: 'The VM page could not be verified.' };
  } catch {
    return { success: false, error: 'The VM page could not be verified.' };
  }
}
