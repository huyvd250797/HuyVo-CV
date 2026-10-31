import {DocumentLanguage} from './DocumentLanguage';
import {loadPublicCv} from '@/lib/public-profile';
import {renderCv} from '@/lib/render.mjs';
import {PublicMarkup} from './PublicMarkup';
import {HoldingPage} from './HoldingPage';
import {ShareTools} from './ShareTools';
import {LanguageNav} from './LanguageNav';
import {canonicalCvUrl} from '@/lib/sharing.mjs';
import type {Locale} from '@/lib/types';
export async function PublicCvPage({language='vi',fallback=false}:{language?:Locale;fallback?:boolean}){
 const {profile,status,version=1,languages}=await loadPublicCv(language,fallback);if(!profile)return <HoldingPage error={status==='error'}/>;
 const lang=profile.language==='en'?'en':'vi',query=`?lang=${lang}`;
 return <div lang={lang}><DocumentLanguage language={lang}/><LanguageNav languages={languages} current={lang}/><PublicMarkup html={renderCv(profile,{printHref:'/print'+query,pdfHref:'/api/cv/pdf'+query,responsivePortrait:true,homeHref:lang==='en'?'/en':'/',portfolioHref:'/portfolio'+query})}/><ShareTools name={profile.name} role={profile.role} url={canonicalCvUrl(profile.siteUrl,lang)} version={version} language={lang}/><a className="owner-entry" href="/admin">{lang==='en'?'Manage CV':'Quản lý CV'}</a></div>;
}
