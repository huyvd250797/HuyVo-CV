export function timeKey(value:unknown,edge?:'start'|'end'):number|null;
export function sortByTime<T>(rows:T[],field:string,direction?:'asc'|'desc',edge?:'start'|'end'):T[];
