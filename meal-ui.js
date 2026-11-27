const symbols={
 plus:'<path d="M12 5v14M5 12h14"/>',
 trash:'<path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7"/>',
 edit:'<path d="m4 16-1 5 5-1L20 8l-4-4ZM13 7l4 4"/>',
 breakfast:'<path d="M4 10h13v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4ZM17 11h2a3 3 0 0 1 0 6h-2M7 3v3M11 2v4M15 3v3"/>',
 lunch:'<path d="M5 3v6M2 3v4q0 4 6 0V3M5 10v11M17 3q-5 7 0 10V3ZM17 13v8"/>',
 afternoon:'<path d="M5 10C-2 5 5 1 12 3c7-2 14 2 7 7v11H5Z"/><path d="M9 10h.1M14 13h.1M10 17h.1"/>',
 preworkout:'<path d="M1 9v6M5 5v14M8 8v8M8 12h8M16 8v8M19 5v14M23 9v6"/>',
 dinner:'<path d="M3 18a9 9 0 0 1 18 0ZM1 21h22M12 7V4M10 4h4"/>',
 supper:'<path d="M19 16A9 9 0 0 1 8 3a9 9 0 1 0 11 13Z"/>'
};
export function icon(name){return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${symbols[name]||symbols.dinner}</svg>`;}
export const mealImage=kind=>`./assets/meals/${Object.hasOwn(symbols,kind)&&!['plus','trash','edit'].includes(kind)?kind:'dinner'}.webp`;
