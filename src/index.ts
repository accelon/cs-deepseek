import {mount} from 'svelte';
import App from './app.svelte' 
// import {CMActiveLine} from 'offtextview/3rdparty/activeline.js';
// CMActiveLine();

const app = mount(App,{target: document.getElementById("root")});
document.querySelector("#bootmessage").innerHTML='';
export default app;