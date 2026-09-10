import { MhahPanchang } from "mhah-panchang";
const e = new MhahPanchang();
const LAT=28.6139,LNG=77.209;
const MASA=["Chaitra","Vaishakha","Jyeshtha","Ashadha","Shravana","Bhadrapada","Ashwin","Kartik","Margashirsha","Paush","Magha","Phalguna"];
const f=(x:any)=>x?new Intl.DateTimeFormat("en-CA",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false,timeZone:"Asia/Kolkata"}).format(new Date(x)):"-";
function dump(y:number,m:number,d1:number,d2:number){
 for(let d=d1;d<=d2;d++){
  const day=new Date(y,m,d,12,0,0);
  const s:any=e.sunTimer(day,LAT,LNG);
  const sr=new Date(s.sunRise);
  const inst=new Date(sr.getTime()+2*60000);
  const c:any=e.calculate(inst); const cal:any=e.calendar(inst,LAT,LNG);
  console.log(`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`,"sr",f(sr),"| calcIno",String(c.Tithi.ino).padStart(2),"calIno",String(cal.Tithi.ino).padStart(2),"amanta",MASA[Number(cal.MoonMasa.ino)%12],"| ends",f(c.Tithi.end));
 }
}
dump(2026,10,17,23);
console.log("---");
dump(2027,1,17,22);
