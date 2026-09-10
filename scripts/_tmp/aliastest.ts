import { getPanchang } from "@/lib/panchang";
console.log("alias ok", getPanchang(new Date(2026,8,10)).tithi.en);
