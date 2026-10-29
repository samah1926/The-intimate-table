'use client';
import { useEffect, useState } from 'react';
import { sections, summary, zodiac, type Answers } from '@/lib/chapter-zero/fields';
import { submitInvitation } from './actions';
const KEY = 'the-house-chapter-0-v1';
const colors = [['Ivoire','#f5f0e8'],['Bordeaux','#5b1d24'],['Olive','#5b5c43'],['Brun','#4a3426'],['Sable','#c9b79e'],['Laiton','#a4834f']];
export default function Questionnaire({backend}:{backend:boolean}) {
  const [answers,setAnswers] = useState<Answers>({});
  const [token,setToken] = useState('');
  const [ready,setReady] = useState(false);
  const [status,setStatus] = useState('');
  const [pending,setPending] = useState(false);
  const [draft,setDraft] = useState('');
  const [manual,setManual] = useState(false);
  useEffect(() => {
    let id = crypto.randomUUID();
    try { const saved = JSON.parse(localStorage.getItem(KEY) || 'null'); if (saved?.answers) setAnswers(saved.answers); if (saved?.token) id = saved.token; } catch { /* unavailable or old draft */ }
    setToken(id); setReady(true);
  },[]);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY,JSON.stringify({answers,token})); setDraft('Brouillon conservé sur cet appareil.'); }
    catch { setDraft('Le navigateur ne permet pas de conserver ce brouillon.'); }
  },[answers,token,ready]);
  const update = (key:string,value:string) => {setAnswers(a=>({...a,[key]:value}));setStatus('');};
  return <section id="questionnaire" className="bg-paper scroll-mt-8" lang="fr"><div className="mx-auto max-w-[60rem] px-6 py-20 sm:px-10 sm:py-28">
    <p className="eyebrow muted">Une place pour toi</p><h2 className="display mt-6 text-[2.8rem] sm:text-[3.8rem]">On prépare la suite ensemble.</h2>
    <p className="mt-6 max-w-xl">Quelques questions pour prendre soin de toi pendant ces deux jours.</p><p className="mt-3 text-sm font-sans muted">{draft || 'Chargement de ton brouillon…'} Les champs marqués * sont obligatoires.</p>
    <form className="mt-12" onSubmit={async e=>{e.preventDefault();setPending(true);try {const r=await submitInvitation({token,answers});setStatus(r.error || 'Tes réponses sont bien reçues. À très bientôt à la maison.');}catch {setStatus('Connexion interrompue. Ton brouillon est conservé ; réessaie ou utilise WhatsApp.');}finally {setPending(false);}}}>
    {sections.map((section,i)=><fieldset key={section.title} className="border-t hairline py-10"><legend className="display pr-6 text-[2rem]"><span className="meta muted mr-4">0{i+1}</span>{section.title}</legend><div className="grid gap-x-10 gap-y-7 sm:grid-cols-2">{section.fields.map(field=>{
      const f = field as {key:string;label:string;type?:string;options?:string[];required?:boolean;note?:string};
      const inputClass='mt-3 block min-h-12 w-full min-w-0 border-b hairline bg-transparent px-1 py-2 text-base font-sans';
      return <div key={f.key}><label className="block" htmlFor={f.key}>{f.label}{f.required?' *':''}</label>
      {f.type==='color'?<div role="radiogroup" aria-label={f.label} className="mt-4 flex flex-wrap gap-3">{colors.map(([name,color])=><label key={name} className="cursor-pointer"><input className="peer sr-only" type="radio" name="color" value={name} checked={answers.color===name} onChange={()=>update('color',name)}/><span title={name} className="block h-11 w-11 rounded-full border border-ink/20 peer-checked:outline-2 peer-checked:outline-offset-4 peer-checked:outline-oxblood peer-focus-visible:outline-2" style={{background:color}}/><span className="mt-2 block text-xs font-sans">{name}</span></label>)}</div>:f.options?<select id={f.key} required={f.required} className={inputClass} value={answers[f.key]||''} onChange={e=>update(f.key,e.target.value)}><option value="">Choisir</option>{f.options.map(o=><option key={o}>{o}</option>)}</select>:<input id={f.key} type={f.type || 'text'} maxLength={1500} max={f.type==='date'?new Date().toISOString().slice(0,10):undefined} required={f.required} className={inputClass} value={answers[f.key]||''} onChange={e=>update(f.key,e.target.value)}/>}
      {f.note&&<p className="mt-2 text-sm italic muted">{f.note}</p>}{f.key==='birthdate'&&<p aria-live="polite" className="mt-3 italic text-oxblood">{zodiac(answers.birthdate||'')}</p>}</div>;
    })}</div></fieldset>)}
    <p className="text-sm font-sans muted mb-8">Tes réponses sont destinées à l’organisation du week-end. Les informations de santé et le contact d’urgence sont facultatifs. Tu peux demander leur modification ou leur suppression à ton hôte.</p>
    <div className="flex flex-wrap items-center gap-6">{backend&&<button className="btn-primary disabled:opacity-50" disabled={!ready||pending}>{pending?'Envoi en cours…':'Envoyer mes réponses'} <span aria-hidden>→</span></button>}
    <button type="button" className="btn-quiet" onClick={async()=>{try{await navigator.clipboard.writeText(summary(answers));setStatus('Réponses copiées. Tu peux les envoyer à ton hôte.');}catch{setManual(true);setStatus('Sélectionne le texte ci-dessous pour le copier.');}}}>Copier mes réponses</button>
    <a className="btn-quiet" href={'https://wa.me/?text='+encodeURIComponent(summary(answers))} target="_blank" rel="noreferrer">Envoyer par WhatsApp ↗</a></div>
    <p className="mt-6" role="status">{status}</p>{manual&&<textarea readOnly aria-label="Récapitulatif à copier" className="w-full h-60 border hairline p-4 font-sans text-sm" value={summary(answers)} onFocus={e=>e.target.select()}/>}
    </form></div></section>;
}
