import { nodefs,writeChanged ,filesFromPattern, readTextContent, fromObj
    ,autoChineseBreak,autoEnglishBreak} from "ptk/nodebundle.cjs";
import {fromsimtext} from "./unified.js";
await nodefs;
const srcfolder='html/'
const outfolder='acc3/';
const files=filesFromPattern('*.html',srcfolder);
const trapairs={};

const replaceParanum=(t,remove=false)=>{
    return t.replace(/([\-\d]+)\./,remove?"":"$1");
}
const gen=(fn)=>{
    const texts={P:[],E:[],C:[],T:[]};
    console.log(fn)
    const content=readTextContent(srcfolder+fn).replace(/\n/g,'▲');

    let chapter='',title='',n='',book='';
    content.replace(/<p id="id([PCE])_(\d+)([^>]+?)>(.+?)<\/p>/g,(m,lang,para,style,linetext)=>{
        linetext=linetext.replace(/▲$/,'');
        
        // if (~style.indexOf(lang+'centre')) linetext='';
        if (lang=='P') {
            linetext=linetext.replace(/<note>([^<]+)<\/note>/g,'');//drop note 
            linetext=linetext.replace(/<pb[^>]+?\/> ?/g,'')
            linetext=linetext.replace(/<hi [^>]+?class="Pdot">.<\/hi>/g,'')
            linetext=linetext.replace(/<hi [^>]+?class="Pbold">([^<]+)<\/hi>/g,'<粗>$1</粗>')
            n='',title='',chapter='',book='';            
            linetext=linetext.replace(/<hi [^>]+?class="Pparanum">([\-\d]+)<\/hi>/g,(m,m1)=>{
                n=m1;
                return '<段>'+n+'</段>';
            });

            if (~style.indexOf('Ptitle')||~style.indexOf('Psubhead')) {
                title=linetext;
                linetext='<節>'+replaceParanum(linetext)+'</節>';
            }
            if (~style.indexOf('Pchapter')) {
                chapter=linetext;
                linetext='<章>'+replaceParanum(linetext)+'</章>';
            }
            if (~style.indexOf('Pbook')) {
                book=linetext;
                linetext='<冊>'+replaceParanum(linetext)+'</冊>';
            }
            linetext=autoEnglishBreak(linetext);
        } else {
            if(n) linetext='<段>'+n+'</段>'+replaceParanum(linetext,true)
            if(title) linetext='<節>'+replaceParanum(linetext)+'</節>';
            if(chapter) linetext='<章>'+replaceParanum(linetext)+'</章>';
            if(book) linetext='<冊>'+replaceParanum(linetext)+'</冊>';
            if (lang=='C') {
                linetext=autoChineseBreak(linetext);
                texts['T'][para]=fromsimtext(linetext);
            } else if (lang=='E') {
                linetext=autoEnglishBreak(linetext)
            }            
            linetext=linetext.replace(/▲/g,'\n');
        }
 
        texts[lang][para]=linetext;
    })
    writeChanged(outfolder+fn.replace('.html','.xml'),'\ufeff'+texts.P.join('\n'));
    writeChanged(outfolder+fn.replace('.html','e.xml'),'\ufeff'+texts.E.join('\n'));
    writeChanged(outfolder+fn.replace('.html','c.xml'),'\ufeff'+texts.C.join('\n'));
    writeChanged(outfolder+fn.replace('.html','t.xml'),'\ufeff'+texts.T.join('\n'));
}
//files.length=3;
const t=performance.now();
files.forEach(gen);
writeChanged('pairs.txt',fromObj(trapairs,true).join('\n'));

console.log(performance.now()-t);