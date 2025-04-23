import { fromSim } from "lossless-simplified-chinese";
import { nodefs,writeChanged ,filesFromPattern, readTextContent, fromObj} from "ptk/nodebundle.cjs";
import { UnifiedStep2,Replaces, UnifiedStep1} from "./unified.js";
await nodefs;
const srcfolder='html/'
const outfolder='off/';
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
    let title='',n='';
    content.replace(/<p id="id([PCE])_(\d+)([^>]+?)>(.+?)<\/p>/g,(m,lang,para,style,linetext)=>{
        if (lang=='P') {
            linetext=linetext.replace(/<note>([^<]+)<\/note>/g,'');//drop note 
            linetext=linetext.replace(/<pb[^>]+?\/> ?/g,'')
            linetext=linetext.replace(/<hi [^>]+?class="Pdot">.<\/hi>/g,'')
            linetext=linetext.replace(/<hi [^>]+?class="Pbold">([^<]+)<\/hi>/g,'^b[$1]')
            n='';            
            linetext=linetext.replace(/<hi [^>]+?class="Pparanum">(\d+)<\/hi>/g,(m,m1)=>{
                n=m1;
                return '^n'+n;
            });
            if (~style.indexOf('Ptitle')) {
                linetext='^title '+linetext;
            }
        } else {
            if(n) linetext='^n'+n+' '+linetext.replace(n+'.','')
        }
        texts[lang][para]=tidytext(linetext);
    })
    writeChanged(outfolder+fn.replace('.html','.off'),texts.P.join('\n'));
    writeChanged(outfolder+fn.replace('.html','e.off'),texts.E.join('\n'));
    writeChanged(outfolder+fn.replace('.html','c.off'),texts.C.join('\n'));
}
files.length=2;
const t=performance.now();
files.forEach(gen);
writeChanged('pairs.txt',fromObj(trapairs,true).join('\n'));

console.log(performance.now()-t);