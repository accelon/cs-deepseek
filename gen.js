import { nodefs,writeChanged ,filesFromPattern, readTextContent, fromObj
    ,autoChineseBreak,autoEnglishBreak,toParagraphs} from "ptk/nodebundle.cjs";
await nodefs;
const srcfolder='html/'
const outfolderP='csds.offtext/';
const outfolderE='csds_en.offtext/';
const outfolderC='csds_zh.offtext/';
const files=filesFromPattern('*.html',srcfolder);
const trapairs={};
// import {BKID} from './src/bkid.ts'


const alignbyp=(texts,fn)=>{
    const P=[],E=[],C=[];
    for (let i in texts.P) {
        if (!texts.E[i]) texts.E[i]=texts.P[i]
        if (!texts.C[i]) texts.C[i]=texts.P[i]

        const Pi=((parseInt(i)?'^p'+i+' ':'')+texts.P[i].trim()).split('\n')
        const Ci=((parseInt(i)?'^p'+i+' ':'')+texts.C[i].trim()).split('\n')
        const Ei=((parseInt(i)?'^p'+i+' ':'')+texts.E[i].trim()).split('\n')
        
        let max=Pi.length;
        if (Ei.length>max) max=Ei.length;
        if (Ci.length>max) max=Ci.length;
    
        while (Pi.length<max) Pi.push('');
        while (Ei.length<max) Ei.push('');
        while (Ci.length<max) Ci.push('');
        
        P[i]=Pi.join('\n');
        E[i]=Ei.join('\n');
        C[i]=Ci.join('\n');
    }

    return {P,E,C};
}
const replaceParanum=(t,remove=false)=>{
    return t.replace(/([\-\d]+)\./,remove?"":"$1");
}
const gen=(fn)=>{
    const texts={P:[],E:[],C:[],T:[]};
    process.stdout.write('\r'+fn+'          ');
    const content=readTextContent(srcfolder+fn).replace(/\n/g,'▲');
// para , cs-deepseek 自己給的序號
// n   , vri 的段號
    let chapter='',title='',n='',book='',save_n_for_nextpara='';
    content.replace(/<p id="id([PCE])_(\d+)([^>]+?)>(.+?)<\/p>/g,(m,lang,para,style,linetext)=>{
        linetext=linetext.replace(/▲$/,'');
        if (lang=='P') {
            linetext=linetext.replace(/<note>([^<]+)<\/note>/g,'');//drop note 
            linetext=linetext.replace(/<pb[^>]+?\/> ?/g,'')
            linetext=linetext.replace(/<hi [^>]+?class="Pdot">.<\/hi>/g,'')
            linetext=linetext.replace(/<hi [^>]+?class="Pbold">([^<]+)<\/hi>/g,'^b[$1]')
            title='',chapter='',book=''; 
            if (save_n_for_nextpara) {
                //console.log('save',save_n_for_nextpara, 'for',para)
                n=save_n_for_nextpara; 
                save_n_for_nextpara=''
                linetext='^pn'+n+' '+linetext;
            } else {
                linetext=linetext.replace(/<hi [^>]+?class="Pparanum">([\-\d]+)<\/hi>/g,(m,m1)=>{
                    n=m1;
                    // if (n=="1") console.log("n reset",fn,"para",para)
                    return '^pn'+m1;
                });    
            }
            if (~style.indexOf('Ptitle')||~style.indexOf('Psubhead')) {
                title=linetext;
                linetext='#title '+replaceParanum(linetext);
            }
            if (~style.indexOf('Pchapter')) {
                chapter=linetext;
                linetext='#chapter '+replaceParanum(linetext);
            }
            if (~style.indexOf('Pbook')) {
                book=linetext;
                linetext='#book '+replaceParanum(linetext);
            }
            linetext=autoEnglishBreak(linetext);
        } else {
            if(n) linetext='^pn'+n+' '+replaceParanum(linetext,true)
            if(title) linetext='#title '+replaceParanum(linetext);
            if(chapter) linetext='#chapter '+replaceParanum(linetext);
            if(book) {
                linetext='#book '+replaceParanum(linetext);
            }
            if (lang=='C') {
                linetext=autoChineseBreak(linetext);
                texts['T'][para]=linetext;
            } else if (lang=='E') {
                linetext=autoEnglishBreak(linetext)
            }            
            linetext=linetext.replace(/▲/g,'\n');
        }
        if (lang=='P' && linetext.match(/^\^pn\d+$/)) { // 1103  p134,  只有段號，必須存起來。
            // console.log('empty para',linetext);
            linetext='';
            save_n_for_nextpara=n;
        }
        if (lang=='E') n='';//english at the end, reset n
        if (texts[lang][para]) texts[lang][para]+='\n'
        texts[lang][para]=(texts[lang][para]||'')+linetext.replace(/\n+/g,'\n');
    })
    //address by ak
    texts.P[0]='^ak'+fn.replace('.html','');
    texts.E[0]='^ak'+fn.replace('.html','');
    texts.C[0]='^ak'+fn.replace('.html','');

    const {P,E,C} = alignbyp(texts,fn);

    writeChanged(outfolderP+fn.replace('.html','.off'),'\ufeff'+P.join('\n'));
    writeChanged(outfolderE+fn.replace('.html','e.off'),'\ufeff'+E.join('\n'));
    writeChanged(outfolderC+fn.replace('.html','c.off'),'\ufeff'+C.join('\n'));
}
// files.length=151; //exclude 8xxxx.html
// files.length=10
const t=performance.now();
files.forEach(gen);
writeChanged('pairs.txt',fromObj(trapairs,true).join('\n'));

console.log(performance.now()-t);