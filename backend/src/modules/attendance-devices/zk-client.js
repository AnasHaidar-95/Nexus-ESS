import Zk from 'node-zklib';

const DEFAULT_TIMEOUT = 5000;
const DEFAULT_ATTEMPTS = 1;

export const createZkClient = (ipAddress, port, timeout = DEFAULT_TIMEOUT, attempts = DEFAULT_ATTEMPTS) => {
  return new Zk(ipAddress, Number(port), timeout, attempts);
};

export const testConnection = async (ipAddress, port) => {
  const zk = createZkClient(ipAddress, port);
  try {
    await zk.createSocket();
    const info = zk.getInfo();
    zk.disconnect();
    return { success: true, info };
  } catch {
    try { zk.disconnect(); } catch { /* ignore disconnect errors */ }
    return { success: false, info: null };
  }
};

export const fetchAttendanceLogs = async (ipAddress, port) => {
  const zk = createZkClient(ipAddress, port);
  try {
    await zk.createSocket();
    const logs = await zk.getAttendances();
    zk.freeData();
    zk.disconnect();
    return logs || [];
  } catch {
    try { zk.disconnect(); } catch { /* ignore disconnect errors */ }
    return [];
  }
};
