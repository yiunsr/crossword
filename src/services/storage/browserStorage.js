const extensionApi = globalThis.browser ?? globalThis.chrome;

export function getStorageValue(key) {
  if (extensionApi.storage?.local?.get.length === 1) {
    return extensionApi.storage.local.get(key).then((result) => result[key]);
  }

  return new Promise((resolve) => {
    extensionApi.storage.local.get([key], (result) => resolve(result[key]));
  });
}

export function setStorageValue(key, value) {
  if (extensionApi.storage?.local?.set.length === 1) {
    return extensionApi.storage.local.set({ [key]: value });
  }

  return new Promise((resolve) => {
    extensionApi.storage.local.set({ [key]: value }, resolve);
  });
}
