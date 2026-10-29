'use client';
import { useEffect, useState } from 'react';
export default function Countdown({start}:{start:string}) {
  const [now,setNow]=useState<number|null>(null);
  useEffect(()=>{setNow(Date.now());const timer=setInterval(()=>setNow(Date.now()),60000);return()=>clearInterval(timer);},[]);
  const date=new Date(start);
  if(!start || Number.isNaN(+date)) return <p className="meta mt-6">Dates annoncées très bientôt</p>;
  const end=new Date(date);end.setUTCDate(end.getUTCDate()+2);
  const fmt=new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'long',year:'numeric',timeZone:'Africa/Casablanca'});
  const dayKey=(d:Date)=>new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Casablanca',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
  const days=now===null?null:Math.round((Date.parse(dayKey(date))-Date.parse(dayKey(new Date(now))))/86400000);
  return <div className="mt-6"><p className="meta">Du {fmt.format(date)} au {fmt.format(end)}</p><p className="lede mt-4 text-2xl" aria-live="polite">{days===null?'':days>0?`J-${days}`:days===0?'Le jour J est arrivé.':now!==null&&now<=+end+86400000?'Le chapitre se vit maintenant.':'Un chapitre à garder en mémoire.'}</p></div>;
}
