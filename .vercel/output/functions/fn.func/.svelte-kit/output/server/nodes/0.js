

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.b373c3fb.js","_app/immutable/chunks/scheduler.2780c2e6.js","_app/immutable/chunks/index.bfa20e3f.js","_app/immutable/chunks/stores.18beca99.js","_app/immutable/chunks/singletons.bb95582b.js"];
export const stylesheets = ["_app/immutable/assets/0.55810c41.css"];
export const fonts = [];
