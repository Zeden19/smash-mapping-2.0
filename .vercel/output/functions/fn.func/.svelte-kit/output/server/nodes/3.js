

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/about/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/3.2853f02a.js","_app/immutable/chunks/scheduler.2780c2e6.js","_app/immutable/chunks/index.bfa20e3f.js"];
export const stylesheets = ["_app/immutable/assets/3.87955568.css"];
export const fonts = [];
