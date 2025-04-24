import { fromSim } from "lossless-simplified-chinese";
import { nodefs,writeChanged ,filesFromPattern, readTextContent, fromObj
    ,autoChineseBreak} from "ptk/nodebundle.cjs";
import { UnifiedStep2,Replaces, UnifiedStep1} from "./unified.js";
await nodefs;
const srcfolder='html/'
const outfolder='acc3/';
const files=filesFromPattern('*.html',srcfolder);
const trapairs={};

const tidytext=t=>{
    t=fromSim(t.replace(/▲$/,''),3,'{}');

    t=t.replace(/\{(.{2,4})\}/g,(m,m1)=>{
        const repl=UnifiedStep1[m1]||'{'+m1+'}';
        return repl;
    })

    t=t.replace(/(.\{.{2,4}\})/g,(m,m1)=>{
        const repl=Replaces[m1]||m1;
        if (repl!==m1) {
            if (!trapairs[m1]) trapairs[m1]=0;
            trapairs[m1]++;       
        }
        return repl;
    })

    t=t.replace(/(\{.{2,4}\}.)/g,(m,m1)=>{
        const repl=Replaces[m1]||m1;
        if (repl!==m1) {
            if (!trapairs[m1]) trapairs[m1]=0;
            trapairs[m1]++;       
        }
        return repl;
    })

    t=t.replace(/\{(.{2,4})\}/g,(m,m1)=>{
        const repl=UnifiedStep2[m1]||'{'+m1+'}';
        return repl;
    })

        
    return t;
}
const gen=(fn)=>{
    const texts={P:[],E:[],C:[]};
    console.log(fn)
    const content=readTextContent(srcfolder+fn).replace(/\n/g,'▲');

    let chapter='',title='',n='',book='';
    content.replace(/<p id="id([PCE])_(\d+)([^>]+?)>(.+?)<\/p>/g,(m,lang,para,style,linetext)=>{
        linetext=tidytext(linetext)
        // if (~style.indexOf(lang+'centre')) linetext='';
        if (lang=='P') {
            linetext=linetext.replace(/<note>([^<]+)<\/note>/g,'');//drop note 
            linetext=linetext.replace(/<pb[^>]+?\/> ?/g,'')
            linetext=linetext.replace(/<hi [^>]+?class="Pdot">.<\/hi>/g,'')
            linetext=linetext.replace(/<hi [^>]+?class="Pbold">([^<]+)<\/hi>/g,'<粗>$1</粗>')
            n='',title='',chapter='',book='';            
            linetext=linetext.replace(/<hi [^>]+?class="Pparanum">(\d+)<\/hi>/g,(m,m1)=>{
                n=m1;
                return '<段>'+n+'</段>';
            });

            if (~style.indexOf('Ptitle')) {
                title=linetext;
                linetext='<節>'+linetext+'</節>';
            }
            if (~style.indexOf('Pchapter')) {
                chapter=linetext;
                linetext='<章>'+linetext+'</章>';
            }
            if (~style.indexOf('Pbook')) {
                book=linetext;
                linetext='<冊>'+linetext+'</冊>';
            }

        } else {
            if(n) linetext='<段>'+n+'</段>'+linetext.replace(n+'.','')
            if(title) linetext='<節>'+linetext+'</節>';
            if(chapter) linetext='<章>'+linetext+'</章>';
            if(book) linetext='<冊>'+linetext+'</冊>';
        }
        if (lang=='C') {
            linetext=autoChineseBreak(linetext).replace(/▲/g,'\n');
        }
        texts[lang][para]=linetext;
    })
    writeChanged(outfolder+fn.replace('.html','.xml'),'\ufeff'+texts.P.join('\n'));
    writeChanged(outfolder+fn.replace('.html','e.xml'),'\ufeff'+texts.E.join('\n'));
    writeChanged(outfolder+fn.replace('.html','c.xml'),'\ufeff'+texts.C.join('\n'));
}
//files.length=2;
const t=performance.now();
files.forEach(gen);
writeChanged('pairs.txt',fromObj(trapairs,true).join('\n'));

console.log(performance.now()-t);