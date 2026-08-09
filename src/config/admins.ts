/**
 * საწყისი (bootstrap) ადმინები.
 *
 * პრობლემა, რომელსაც ეს ხსნის: ადმინის როლი Firestore-ის `users` დოკუმენტში წერია,
 * მაგრამ იმ დოკუმენტის ADMIN-ად შეცვლა თავად ადმინობას მოითხოვს — ჩაკეტილი წრეა.
 * ამ სიაში მითითებული ელ. ფოსტა ავტომატურად ღებულობს ADMIN როლს რეგისტრაციისას
 * და შესვლისას, ხოლო firestore.rules იმავე ფოსტას ცნობს ჩაწერის უფლებით.
 *
 * ⚠ სიის შეცვლისას აუცილებლად ხელახლა განათავსე firestore.rules —
 *   ორივე ადგილას ერთი და იგივე მისამართები უნდა ეწეროს.
 */
export const BOOTSTRAP_ADMIN_EMAILS = ['gimedashvili7@gmail.com'] as const;

export function isBootstrapAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return BOOTSTRAP_ADMIN_EMAILS.some((e) => e.toLowerCase() === normalized);
}
