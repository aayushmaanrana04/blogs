import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

const DATA_FILE = '.data/visitors.json';
const active = new Map<string, number>();
let cache: { total: number; known: Set<string> } | null = null;

function load() {
	if (cache) return cache;
	try {
		const data = JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
		cache = { total: data.total, known: new Set(data.known) };
	} catch {
		cache = { total: 0, known: new Set() };
	}
	return cache;
}

function save() {
	if (!existsSync('.data')) mkdirSync('.data');
	const data = load();
	writeFileSync(DATA_FILE, JSON.stringify({ total: data.total, known: [...data.known] }));
}

export function visit(id: string) {
	const data = load();
	if (!data.known.has(id)) {
		data.total++;
		data.known.add(id);
		save();
	}
	active.set(id, Date.now());
	for (const [k, v] of active) if (Date.now() - v > 60000) active.delete(k);
	return { current: active.size, total: data.total };
}
