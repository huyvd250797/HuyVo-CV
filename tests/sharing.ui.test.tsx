import {afterEach,expect,test,vi} from 'vitest';
import {render,screen,fireEvent,cleanup,waitFor} from '@testing-library/react';
import {ShareTools} from '../src/components/ShareTools';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
const props={name:'Nguyễn Văn An',role:'IT Project Manager',url:'https://cv.example.com/',version:18};
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.restoreAllMocks();});
test('Copy and Web Share send only the public canonical URL',async()=>{
 const writeText=vi.fn(async()=>{}),share=vi.fn(async()=>{});
 vi.stubGlobal('navigator',{clipboard:{writeText},share});render(<ShareTools {...props}/>);
 fireEvent.click(screen.getByRole('button',{name:'Sao chép link'}));await screen.findByText('Đã sao chép liên kết CV công khai.');expect(writeText).toHaveBeenCalledWith(props.url);
 fireEvent.click(screen.getByRole('button',{name:'Chia sẻ ↗'}));await screen.findByText('Đã mở chia sẻ CV.');expect(share).toHaveBeenCalledWith({title:'Nguyễn Văn An - IT Project Manager',url:props.url});
});
test('PDF failure gives a retry path and does not claim download succeeded',async()=>{
 vi.stubGlobal('fetch',vi.fn(async()=>({ok:false,json:async()=>({error:'Chưa tạo được PDF. Vui lòng thử lại.'})})));
 render(<ShareTools {...props}/>);fireEvent.click(screen.getByRole('button',{name:'Tải CV PDF ↓'}));await screen.findByText('Chưa tạo được PDF. Vui lòng thử lại.');expect(screen.queryByText('Đã tải PDF từ bản công khai hiện hành.')).toBeNull();await waitFor(()=>expect((screen.getByRole('button',{name:'Tải CV PDF ↓'}) as HTMLButtonElement).disabled).toBe(false));
});
test('Missing published URL hides QR and keeps browser URL as copy fallback',async()=>{
 const writeText=vi.fn(async(_value:string)=>{});vi.stubGlobal('navigator',{clipboard:{writeText}});render(<ShareTools {...props} url={null}/>);
 expect(screen.queryByRole('img')).toBeNull();fireEvent.click(screen.getByRole('button',{name:'Sao chép link'}));await screen.findByText('Đã sao chép liên kết CV công khai.');expect(writeText.mock.calls[0][0]).not.toContain('/admin');
});
test('Sharing component exposes readable QR, download and status controls',async()=>{
 render(<ShareTools {...props}/>);expect(screen.getByRole('img',{name:'Mã QR mở CV công khai'}).getAttribute('src')).toBe('/api/share/qr?lang=vi&v=18');expect(screen.getByRole('link',{name:/Tải QR/}).getAttribute('href')).toBe('/api/share/qr?lang=vi&download=1');
 if(process.env.QA_CAPTURE_DIR){await mkdir(process.env.QA_CAPTURE_DIR,{recursive:true});const css=await readFile('src/app/globals.css','utf8');await writeFile(`${process.env.QA_CAPTURE_DIR}/sharing.html`,`<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><body>${document.body.innerHTML}</body></html>`);}
});
