export function parseXmlString(xmlText) {
  return new DOMParser().parseFromString(xmlText, 'application/xml');
}
