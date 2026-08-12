/**
 * ხმოვანი data: URI-ის MIME-ის ნორმალიზება.
 *
 * ჩამწერი აპლიკაციები ხშირად აწერენ არასტანდარტულ ტიპებს (audio/x-m4a),
 * რომელსაც Safari/iOS data: URI-დან არ უკრავს. სტანდარტულ ეკვივალენტზე
 * გადაყვანა ფაილის შიგთავსს არ ცვლის — მხოლოდ სწორად ასახელებს.
 *
 * ცალკე ფაილშია, რომ ხმის ძრავს Firebase არ შემოჰქონდეს.
 */
const MIME_ALIASES: Record<string, string> = {
  'audio/x-m4a': 'audio/mp4',
  'audio/m4a': 'audio/mp4',
  'audio/aac': 'audio/mp4',
  'audio/mp3': 'audio/mpeg',
  'audio/x-wav': 'audio/wav',
  'audio/vnd.wave': 'audio/wav',
};

export function normalizeAudioDataUrl(url: string): string {
  if (!url.startsWith('data:')) return url;
  const semi = url.indexOf(';');
  if (semi < 0) return url;
  const mime = url.slice(5, semi);
  const better = MIME_ALIASES[mime.toLowerCase()];
  return better ? `data:${better}${url.slice(semi)}` : url;
}
