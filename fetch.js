import {writeFileSync} from 'fs';
const baseurl='https://apply.paauksociety.org/tipitaka/index_display_palitext(ajax).php?book=';
const outdir="html/";
import { bookcode } from './src/bookcode.js';
const dobook=async (key)=>{
    const res=await fetch(baseurl+key,{
        credentials: 'include',
        headers:{
            Cookie:'ti_tra_name=Guest; ti_writing=roman; ti_dividing=inline; ti_catalog=chinese; ti_background_color=%23f3ddb6; ti_pali_size=0; ti_pali_font=Tahoma; ti_pali_color=%23000000; ti_chinese_size=0; ti_chinese_font=Songti%20SC; ti_chinese_color=%23000000; ti_english_size=0; ti_english_font=Tahoma; ti_english_color=%23000000; ti_searchLanguage=chinese; ti_searchKey=%E6%86%8D%E8%B5%8F%E5%BC%A5%E7%BB%8F%20; ti_mata=1; ti_alternate=inline; ti_list_style=2; ti_translated=chineseenglish; ti_book='+key
        }
    });
    const text=await res.text()
    process.stdout.write('\r'+key)
    writeFileSync( outdir+key+'.html', text,'utf8');
}
const dobooks=async  ()=>{
    for (let key in bookcode) dobook(key)
}
dobooks();
