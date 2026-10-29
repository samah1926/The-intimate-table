'use server';
import { z } from 'zod';
import { sections } from '@/lib/chapter-zero/fields';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { serviceClient } from '@/lib/supabase/server';
const schema = z.object({ token: z.uuid(), answers: z.record(z.string(), z.string().max(1500)) });
export async function submitInvitation(input: unknown) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: 'Vérifie tes réponses puis réessaie.' };
  const {token, answers} = parsed.data;
  const clean: Record<string,string> = {};
  for (const s of sections) for (const field of s.fields) {
    const f = field as {key:string; required?:boolean; options?:string[]};
    const value = (answers[f.key] || '').trim();
    if ((f.required && !value) || (value && f.options && !f.options.includes(value))) return {error:'Vérifie les champs obligatoires.'};
    clean[f.key] = value;
  }
  if (!isSupabaseConfigured()) return { error: 'L’enregistrement est indisponible. Tu peux copier tes réponses ou les envoyer par WhatsApp.' };
  // The random browser token permits resubmission without exposing any record or payment status.
  const { error } = await serviceClient().rpc('submit_chapter_zero', { p_token: token, p_answers: clean });
  return error ? { error: 'Tes réponses n’ont pas pu être enregistrées. Réessaie ou utilise WhatsApp ; ton brouillon est conservé.' } : { success: true };
}
