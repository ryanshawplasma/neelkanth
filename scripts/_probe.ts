import { getPanchang } from "../src/lib/panchang";
type Row = { date: string; masaP: string; paksha: string; n: number; ends: Date | null };
const rows: Row[] = [];
let d = new Date(2026, 7, 15); const end = new Date(2028, 0, 10);
while (d <= end) { const p = getPanchang(new Date(d)); rows.push({ date: p.date, masaP: p.masa.purnimanta.en, paksha: p.tithi.paksha, n: p.tithi.number, ends: p.tithi.endsAt }); d = new Date(d.getTime()+86400000); }
const f = (x: Date|null) => x ? new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false,timeZone:"Asia/Kolkata"}).format(x) : "-";
function q(m:string,p:string,n:number,l:string){
  rows.forEach((r,i)=>{ if(r.masaP===m&&r.paksha===p&&r.n===n){ const prev=rows[i-1]; if(prev&&prev.n===n) return; console.log(l.padEnd(28), "sunriseDate",r.date, "| starts", f(prev?.ends??null), "| ends", f(r.ends)); }});
}
const T: [string,string,number,string][] = [
 ["Bhadrapada","shukla",14,"AnantChaturdashi"],["Bhadrapada","shukla",15,"BhadraPurnima"],
 ["Ashwin","krishna",15,"SarvaPitruAmavasya"],["Ashwin","shukla",1,"SharadNavratri"],
 ["Ashwin","shukla",8,"DurgaAshtami"],["Ashwin","shukla",9,"MahaNavami"],["Ashwin","shukla",10,"Dussehra"],
 ["Ashwin","shukla",15,"SharadPurnima"],["Kartik","krishna",4,"KarwaChauth"],["Kartik","krishna",8,"AhoiAshtami"],
 ["Kartik","krishna",13,"Dhanteras"],["Kartik","krishna",14,"NarakaChaturdashi"],["Kartik","krishna",15,"Diwali"],
 ["Kartik","shukla",1,"Govardhan"],["Kartik","shukla",2,"BhaiDooj"],["Kartik","shukla",6,"Chhath"],
 ["Kartik","shukla",11,"DevUthani"],["Kartik","shukla",12,"TulsiVivah"],["Kartik","shukla",15,"KartikPurnima"],
 ["Margashirsha","shukla",11,"GitaJayanti"],["Magha","shukla",5,"VasantPanchami"],["Phalguna","krishna",14,"MahaShivratri"],
 ["Phalguna","shukla",15,"HolikaDahan"],["Chaitra","krishna",1,"Holi"],["Chaitra","shukla",1,"ChaitraNavratri"],
 ["Chaitra","shukla",9,"RamNavami"],["Chaitra","shukla",15,"HanumanJayanti"],["Vaishakha","shukla",3,"AkshayaTritiya"],
 ["Jyeshtha","shukla",10,"GangaDussehra"],["Jyeshtha","shukla",11,"NirjalaEkadashi"],["Ashadha","shukla",2,"RathYatra"],
 ["Ashadha","shukla",15,"GuruPurnima"],["Shravana","shukla",5,"NagPanchami"],["Shravana","shukla",15,"RakshaBandhan"],
 ["Bhadrapada","krishna",8,"Janmashtami"],["Bhadrapada","shukla",3,"HartalikaTeej"],["Bhadrapada","shukla",4,"GaneshChaturthi"],
];
for (const [m,p,n,l] of T) q(m,p,n,l);
