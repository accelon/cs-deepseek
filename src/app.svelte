<script>
import {openPtk,enableAccelon23Features} from 'ptk'
import {onMount} from 'svelte'
let ptk, address='ak1101.p10',text;
onMount(async()=>{
    ptk=await openPtk("csds_zh");
    enableAccelon23Features(ptk)
})

const onclick=async ()=>{
    text=await ptk.fetchAddress(address);
}
</script>
<input bind:value={address}/><button {onclick}>Get</button>
<div>{text}</div>