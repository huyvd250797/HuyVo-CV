import {afterEach,expect,test,vi} from 'vitest';
import {cleanup,render,screen} from '@testing-library/react';
import {LanguageNav} from '../src/components/LanguageNav';
import {ShareTools} from '../src/components/ShareTools';
import {useReorderMotion} from '../src/lib/use-reorder-motion';
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();});
test('Viewer language switch appears only when both publications exist',()=>{
 const ui=render(<LanguageNav languages={['vi']} current="vi"/>);expect(screen.queryByRole('navigation')).toBeNull();
 ui.rerender(<LanguageNav languages={['vi','en']} current="en"/>);expect(screen.getByRole('link',{name:'English'}).getAttribute('href')).toBe('/en');expect(screen.getByRole('link',{name:'English'}).getAttribute('aria-current')).toBe('page');
});
test('English share controls keep English PDF, print and QR targets',()=>{
 render(<ShareTools name="QA" role="PM" language="en" url="https://cv.example/en" version={23}/>);
 expect(screen.getByRole('link',{name:'Print CV'}).getAttribute('href')).toBe('/print?lang=en');expect(screen.getByRole('img').getAttribute('src')).toContain('lang=en');expect(screen.getByRole('button',{name:'Copy link'})).toBeTruthy();
});
test('Reorder motion bends both swapping elements and respects reduced motion',()=>{
 let motion:ReturnType<typeof useReorderMotion>;function Probe(){motion=useReorderMotion();return <div className="editor-app"><div data-motion-key="block:a"/><div data-motion-key="block:b"/></div>;}
 render(<Probe/>);let after=false;const animations=vi.fn(()=>({cancel:vi.fn()}));document.querySelectorAll<HTMLElement>('[data-motion-key]').forEach((el,i)=>{el.getBoundingClientRect=()=>({left:0,top:after?(1-i)*100:i*100} as DOMRect);el.animate=animations as unknown as HTMLElement['animate'];});
 vi.stubGlobal('matchMedia',()=>({matches:false}));motion!.capture();after=true;motion!.play();expect(animations).toHaveBeenCalledTimes(2);const frames=animations.mock.calls as any[];expect(frames[0][0][1].transform).not.toMatch(/translate\(0px,/);
 vi.stubGlobal('matchMedia',()=>({matches:true}));motion!.capture();after=false;motion!.play();expect(animations).toHaveBeenCalledTimes(2);
});
