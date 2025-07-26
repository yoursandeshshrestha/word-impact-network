// Backend control utility
let isBackendEnabled = true;

export const getBackendStatus = (): boolean => {
  return isBackendEnabled;
};

export const setBackendStatus = (status: boolean): void => {
  isBackendEnabled = status;
  console.log(`🔧 Backend ${status ? 'ENABLED' : 'DISABLED'}`);
};

export const toggleBackendStatus = (): boolean => {
  isBackendEnabled = !isBackendEnabled;
  console.log(`🔧 Backend ${isBackendEnabled ? 'ENABLED' : 'DISABLED'}`);
  return isBackendEnabled;
};
