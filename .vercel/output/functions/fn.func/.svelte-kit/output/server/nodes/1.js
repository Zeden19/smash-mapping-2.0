

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.e8503638.js","_app/immutable/chunks/scheduler.2780c2e6.js","_app/immutable/chunks/index.bfa20e3f.js","_app/immutable/chunks/stores.18beca99.js","_app/immutable/chunks/singletons.bb95582b.js"];
export const stylesheets = [];
export const fonts = [];
