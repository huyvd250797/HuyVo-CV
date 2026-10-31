const months={jan:1,january:1,feb:2,february:2,mar:3,march:3,apr:4,april:4,may:5,jun:6,june:6,jul:7,july:7,aug:8,august:8,sep:9,sept:9,september:9,oct:10,october:10,nov:11,november:11,dec:12,december:12};
function tokenDate(token,end=false){
 let year,month,day;let m;
 if((m=token.match(/^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?$/))){year=+m[1];month=+m[2];day=m[3]?+m[3]:end?new Date(Date.UTC(year,month,0)).getUTCDate():1;}
 else if((m=token.match(/^(?:(\d{1,2})\/)?(\d{1,2})\/(\d{4})$/))){year=+m[3];month=+m[2];day=m[1]?+m[1]:end?new Date(Date.UTC(year,month,0)).getUTCDate():1;}
 else if((m=token.match(/^(thang\s+\d{1,2}|[a-z]+)\s+(\d{4})$/))){year=+m[2];month=m[1].startsWith('thang')?+m[1].replace(/\D/g,''):months[m[1]];day=end?new Date(Date.UTC(year,month,0)).getUTCDate():1;}
 else if(/^\d{4}$/.test(token)){year=+token;month=end?12:1;day=end?31:1;}
 if(!year||year<1900||year>2200||!month||month>12||!day||day>new Date(Date.UTC(year,month,0)).getUTCDate())return null;
 return year*10000+month*100+day;
}
export function timeKey(value,edge='start'){
 if(typeof value!=='string')return null;
 const text=value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/đ/g,'d');
 const tokens=text.match(/\b\d{4}-\d{1,2}(?:-\d{1,2})?\b|\b(?:\d{1,2}\/)?\d{1,2}\/\d{4}\b|\b(?:thang\s+\d{1,2}|jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{4}\b|\b(?:19|20|21)\d{2}\b/g)||[];
 const present=/\b(?:hien tai|den nay|present|current|ongoing|now)\b/.test(text);
 if(edge==='end'&&present)return Infinity;
 if(!tokens.length)return present?Infinity:null;
 return tokenDate(edge==='end'?tokens.at(-1):tokens[0],edge==='end');
}
export function sortByTime(rows,field,direction='desc',edge='start'){
 return rows.map((row,index)=>({row,index,key:timeKey(row[field],edge)})).sort((a,b)=>{
  if(a.key===null&&b.key===null)return a.index-b.index;if(a.key===null)return 1;if(b.key===null)return -1;
  if(a.key===b.key)return a.index-b.index;return (a.key<b.key?-1:1)*(direction==='asc'?1:-1);
 }).map(item=>item.row);
}
