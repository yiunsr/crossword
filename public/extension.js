const extensionApi = globalThis.browser ?? globalThis.chrome;

extensionApi.runtime.onInstalled.addListener(() => {
  console.log('한국어 십자말 풀이 확장프로그램이 설치되었습니다.');
});

extensionApi.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'PING') {
    sendResponse({ ok: true, source: 'extension-service-worker' });
  }

  return false;
});
