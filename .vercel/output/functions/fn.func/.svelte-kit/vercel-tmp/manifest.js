export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["example.png","favicon.ico","favicon.png","filter.png","markers/blue-marker.png","markers/green-marker.png","markers/grey-marker.png","markers/purple-marker.png","markers/red-marker.png","markers/yellow-marker.png","outlook.png","questionmark.png","reimu-standing.gif","reimu.gif","tournament-card-icons/clock.png","tournament-card-icons/map-marker.png","tournament-card-icons/people.png","tournaments.png"]),
	mimeTypes: {".png":"image/png",".ico":"image/vnd.microsoft.icon",".gif":"image/gif"},
	_: {
		client: {"start":"_app/immutable/entry/start.e1633eb7.js","app":"_app/immutable/entry/app.46ba8b3d.js","imports":["_app/immutable/entry/start.e1633eb7.js","_app/immutable/chunks/scheduler.2780c2e6.js","_app/immutable/chunks/singletons.bb95582b.js","_app/immutable/entry/app.46ba8b3d.js","_app/immutable/chunks/preload-helper.41c905a7.js","_app/immutable/chunks/scheduler.2780c2e6.js","_app/immutable/chunks/index.bfa20e3f.js"],"stylesheets":[],"fonts":[]},
		nodes: [
			__memo(() => import('../output/server/nodes/0.js')),
			__memo(() => import('../output/server/nodes/1.js')),
			__memo(() => import('../output/server/nodes/2.js')),
			__memo(() => import('../output/server/nodes/3.js')),
			__memo(() => import('../output/server/nodes/4.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/about",
				pattern: /^\/about\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/contact",
				pattern: /^\/contact\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		}
	}
}
})();
