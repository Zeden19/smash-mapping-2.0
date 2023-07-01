import * as server from '../entries/pages/_page.server.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/+page.server.js";
export const imports = ["_app/immutable/nodes/2.91246fbf.js","_app/immutable/chunks/scheduler.2780c2e6.js","_app/immutable/chunks/index.bfa20e3f.js","_app/immutable/chunks/preload-helper.41c905a7.js"];
export const stylesheets = ["_app/immutable/assets/2.7004adde.css"];
export const fonts = [];
