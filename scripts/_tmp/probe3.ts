import { MhahPanchang } from "mhah-panchang";
const e = new MhahPanchang();
for (const d of [new Date(2026,10,8,18,0), new Date(2026,10,9,18,0), new Date(2027,2,6,23,59)]) {
  const c: any = e.calculate(d);
  const cal: any = e.calendar(d, 28.6139, 77.209);
  console.log(d.toString().slice(0,24), "| calc tithi.ino", c.Tithi.ino, "paksha", c.Paksha.ino, c.Paksha.name_en_IN, "| cal tithi.ino", cal.Tithi.ino, "masa", cal.MoonMasa.ino, cal.MoonMasa.name_en_UK);
}
