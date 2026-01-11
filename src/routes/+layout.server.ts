import { visit } from '$lib/server/visitors';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ cookies }) => {
	let id = cookies.get('vid');
	if (!id) {
		id = crypto.randomUUID();
		cookies.set('vid', id, { path: '/', maxAge: 60 * 60 * 24 * 365 });
	}
	return visit(id);
};
