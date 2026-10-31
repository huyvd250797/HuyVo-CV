import { validateCv } from './validation.mjs';
import { normalizeLayout,sectionOrder,sectionTitle } from './layout.mjs';
export const BACKUP_FORMAT='maison-cv-backup';
export const BACKUP_VERSION=1;
export const MAX_BACKUP_BYTES=262144;
export const historyKinds={published:'Xuất bản',manual:'Mốc thủ công',before_restore:'Trước khôi phục',restore:'Đã khôi phục',before_import:'Trước nhập JSON',import:'Đã nhập JSON',baseline_draft:'Nháp trước nâng cấp',baseline_public:'Công khai trước nâng cấp'};
export function parseBackup(input) {
 const errors=[],warnings=[];
 let value=input;
 try {
  const text=typeof input==='string'?input:JSON.stringify(input);
  if(!text||new TextEncoder().encode(text).byteLength>MAX_BACKUP_BYTES)return {errors:['File vượt quá 256 KB hoặc không có dữ liệu.'],warnings,data:null};
  if(typeof input==='string')value=JSON.parse(input.replace(/^\uFEFF/,''));
 } catch {return {errors:['File JSON không hợp lệ.'],warnings,data:null};}
 if(!value||typeof value!=='object'||Array.isArray(value))return {errors:['Dữ liệu cần là một hồ sơ CV.'],warnings,data:null};
 let profile=value;
 if('format' in value||'formatVersion' in value) {
  if(value.format!==BACKUP_FORMAT||value.formatVersion!==BACKUP_VERSION)return {errors:['Định dạng hoặc phiên bản file chưa được hỗ trợ.'],warnings,data:null};
  profile=value.profile;
 } else warnings.push('Đây là JSON hồ sơ cũ; sẽ chuyển sang cấu trúc CV hiện hành.');
 if(!profile||typeof profile!=='object'||Array.isArray(profile))return {errors:['File không chứa nội dung CV.'],warnings,data:null};
 if(profile.schemaVersion!==undefined&&(!Number.isInteger(profile.schemaVersion)||profile.schemaVersion<1||profile.schemaVersion>4))return {errors:['Phiên bản cấu trúc CV chưa được hỗ trợ. Hãy dùng app tương thích trước khi nhập.'],warnings,data:null};
 const parsed=validateCv(profile);
 errors.push(...parsed.errors);
 return {errors,warnings,data:errors.length?null:parsed.data};
}
export function makeBackup(profile,documentVersion,exportedAt=new Date().toISOString()) {
 const parsed=validateCv(profile);
 if(parsed.errors.length||!parsed.data)throw new Error(parsed.errors.join('\n')||'Dữ liệu CV không hợp lệ.');
 return {format:BACKUP_FORMAT,formatVersion:BACKUP_VERSION,appVersion:'1.5.0',exportedAt,documentVersion,profile:parsed.data,media:{included:false,note:'File JSON chỉ chứa nội dung và đường dẫn ảnh. File ảnh vẫn nằm trong project Supabase nguồn.'}};
}
export const profileLabels={identity:'Thông tin đầu trang',contact:'Thông tin liên hệ',objective:'Mục tiêu nghề nghiệp',education:'Học vấn',skills:'Kỹ năng',certificates:'Chứng chỉ',experience:'Kinh nghiệm làm việc',implementations:'Kinh nghiệm triển khai',projects:'Sản phẩm nổi bật',layout:'Bố cục và ẩn/hiện'};
const fieldLabels={code:'Mã đơn vị',name:'Họ và tên',role:'Vai trò',summary:'Giới thiệu',portrait:'Ảnh',portraitAlt:'Mô tả ảnh',email:'Email',phone:'Điện thoại',website:'Website',address:'Địa chỉ',siteUrl:'URL CV',school:'Trường',degree:'Bằng cấp',period:'Thời gian',detail:'Thông tin thêm',description:'Mô tả',issuer:'Đơn vị cấp',year:'Năm',company:'Công ty',highlights:'Trách nhiệm / Kết quả',technologies:'Công nghệ',demoUrl:'Demo',sourceUrl:'Mã nguồn'};
function lines(row) {return Object.entries(row).filter(([key,value])=>value!==''&&key!=='schemaVersion').map(([key,value])=>`${fieldLabels[key]||key}: ${Array.isArray(value)?value.join('\n'):String(value)}`).join('\n');}
function comparable(profile) {
 const p=validateCv(profile).data;if(!p)return {};
 const result={identity:lines(Object.fromEntries(['name','role','summary','portrait','portraitAlt'].map(k=>[k,p[k]]))),contact:lines(Object.fromEntries(['email','phone','website','address','siteUrl'].map(k=>[k,p[k]]))),objective:p.objective};
 for(const group of ['education','skills','certificates','experience','implementations','projects'])result[group]=p[group].map((row,index)=>`${index+1}. ${lines(row)}`).join('\n\n');
 const layout=normalizeLayout(p.layout),names={personal:'Thông tin liên hệ',delivery:'Triển khai',...profileLabels};
 result.layout=`Chế độ: ${layout.mode==='grid'?'Lưới linh hoạt':'Maison'}\n`+Object.entries(layout.order).map(([zone,items])=>`${({intro:'Khối đầu',aside:'Cột trái',career:'Cột phải',tail:'Ngoài khung'})[zone]}: ${items.map(id=>names[id]||id).join(' → ')}`).join('\n')+`\nLưới: ${layout.grid.order.map(id=>`${names[id]||id} (${layout.grid.spans[id]}/12)`).join(' → ')}\nTiêu đề: ${sectionOrder(layout).map(id=>`${names[id]||id}: ${sectionTitle(layout,id)}`).join(' | ')}\nẨn: ${[...layout.hidden].sort().map(id=>names[id]||id).join(', ')||'Không có'}`;
 return result;
}
export function diffProfiles(before,after) {
 const a=comparable(before),b=comparable(after);
 return Object.entries(profileLabels).filter(([key])=>(a[key]||'')!==(b[key]||'')).map(([key,label])=>({key,label,before:a[key]||'',after:b[key]||''}));
}
