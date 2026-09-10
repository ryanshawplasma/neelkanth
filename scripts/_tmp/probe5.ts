import { MhahPanchang } from "mhah-panchang";
const e = new MhahPanchang();
const LAT=28.6139,LNG=77.209;
const MASA=["Chaitra","Vaishakha","Jyeshtha","Ashadha","Shravana","Bhadrapada","Ashwin","Kartik","Margashirsha","Paush","Magha","Phalguna"];
const TN=["Pratipada","Dwitiya","Tritiya","Chaturthi","Panchami","Shashthi","Saptami","Ashtami","Navami","Dashami","Ekadashi","Dwadashi","Trayodashi","Chaturdashi","Purnima"];
const f=(x:any)=>x?new Intl.DateTimeFormat("en-CA",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false,timeZone:"Asia/Kolkata"}).format(new Date(x)):"-";
function dump(a:Date,b:Date){
 for(let d=new Date(a); d<=b; d=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1)){
  const day=new Date(d.getFullYear(),d.getMonth(),d.getDate(),12,0,0);
  const s:any=e.sunTimer(day,LAT,LNG);
  const sr=new Date(s.sunRise);
  const c:any=e.calculate(new Date(sr.getTime()+2*60000));
  const cal:any=e.calendar(new Date(sr.getTime()+2*60000),LAT,LNG);
  const ino=Number(c.Tithi.ino)%30;
  const pk=ino<15?"S":"K";
  const am=Number(cal.MoonMasa.ino)%12;
  const inoSR=Number(cal.Tithi.ino)%30;
  const purn=(ino>=15||inoSR>=15)?(am+1)%12:am;
  console.log(`${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,"0")}-${String(day.getDate()).padStart(2,"0")}`,
    MASA[purn].padEnd(12), pk, (TN[ino%15]||"?").padEnd(13), "ends", f(c.Tithi.end));
 }
}
const [ , , A, B] = process.argv;
const p=(s:string)=>{const [y,m,d]=s.split("-").map(Number); return new Date(y,m-1,d);};
dump(p(A),p(B));
