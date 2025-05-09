import SveltePlugin from "bun-plugin-svelte"
await Bun.build({
    plugins:[SveltePlugin],
    entrypoints:['./src/index.ts'],
    outdir:'./dist',
    format:"iife"
    // minify:true,
})
console.log('rebuild',new Date())
