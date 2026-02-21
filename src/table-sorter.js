const STYLE_ID = 'sorter-styles';
const CLICK_HANDLER_PROP = '__tableSorterClickHandler';
const KEY_HANDLER_PROP = '__tableSorterKeyHandler';

const CSS = `
th.sortable {
    cursor: pointer;
    user-select: none;
    position: relative;
    white-space: nowrap;
}

th.sortable:hover svg {
    opacity: 0.6;
}

th.sortable svg {
    width: 0.9em;
    height: 0.9em;
    display: inline-block;
    vertical-align: middle;
    margin-left: 0.35em;
    opacity: 0.35;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    filter: drop-shadow(0 0 1px rgba(0,0,0,0.1));
    transform: translateY(-10%);
}

th.sortable.sort-active svg {
    opacity: 1;
}

th.sortable svg.desc {
    transform: translateY(-10%) rotate(180deg);
}
`;

function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
}

function ensureStableTableId(table, selector, index) {
    if (table.id) return table.id;

    const preferredId = table.getAttribute('data-sorter-id');
    if (preferredId) {
        const existing = document.getElementById(preferredId);
        if (!existing || existing === table) {
            table.id = preferredId;
            return table.id;
        }
        console.warn(`[table-sorter] data-sorter-id="${preferredId}" is already used by another element. Falling back to an auto id.`);
    }

    const normalizedSelector = selector
        .replace(/[^A-Za-z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'table';
    const baseId = `sorter-auto-${normalizedSelector}-${index}`;

    let candidate = baseId;
    let counter = 1;
    let existing = document.getElementById(candidate);
    while (existing && existing !== table) {
        candidate = `${baseId}-${counter}`;
        counter += 1;
        existing = document.getElementById(candidate);
    }

    table.id = candidate;
    return table.id;
}

function isElement(value) {
    return !!value && value.nodeType === 1;
}

function isTableElement(value) {
    return isElement(value) && value.tagName === 'TABLE';
}

function isCollection(value) {
    if (!value) return false;
    if (Array.isArray(value)) return true;
    if (typeof NodeList !== 'undefined' && value instanceof NodeList) return true;
    if (typeof HTMLCollection !== 'undefined' && value instanceof HTMLCollection) return true;
    return false;
}

function getTargetSeed(target) {
    if (typeof target === 'string') return target;
    if (isTableElement(target)) {
        if (target.id) return `#${target.id}`;
        return target.getAttribute('data-sorter-id') || 'table';
    }
    return 'table';
}

function resolveTables(target, acc = []) {
    if (typeof target === 'string') {
        // Preserve legacy '#id' behavior via getElementById (supports ids with CSS-special chars)
        const isPlainIdSelector =
            target.startsWith('#') &&
            target.indexOf(' ') === -1 &&
            target.indexOf(',') === -1 &&
            target.indexOf('>') === -1 &&
            target.indexOf('+') === -1 &&
            target.indexOf('~') === -1;
        if (isPlainIdSelector) {
            const el = document.getElementById(target.slice(1));
            if (!el) {
                console.warn(`[table-sorter] Table with id="${target.slice(1)}" not found.`);
                return acc;
            }
            if (!isTableElement(el)) {
                console.warn(`[table-sorter] Element with id="${target.slice(1)}" is not a <table>; ignoring.`, el);
                return acc;
            }
            acc.push(el);
            return acc;
        }

        let matches;
        try {
            matches = document.querySelectorAll(target);
        } catch (e) {
            console.warn(`[table-sorter] Invalid selector "${target}".`, e);
            return acc;
        }

        if (!matches.length) {
            console.warn(`[table-sorter] No elements found for selector "${target}".`);
            return acc;
        }

        let tableCount = 0;
        matches.forEach(el => {
            if (isTableElement(el)) {
                acc.push(el);
                tableCount += 1;
            } else {
                console.warn(`[table-sorter] Selector "${target}" matched a non-table element; ignoring.`, el);
            }
        });

        if (!tableCount) {
            console.warn(`[table-sorter] Selector "${target}" matched no table elements.`);
        }
        return acc;
    }

    if (isTableElement(target)) {
        acc.push(target);
        return acc;
    }

    if (isElement(target)) {
        console.warn('[table-sorter] Expected a <table> element; ignoring.', target);
        return acc;
    }

    if (isCollection(target)) {
        Array.from(target).forEach(item => resolveTables(item, acc));
        return acc;
    }

    if (
        target &&
        typeof target !== 'string' &&
        typeof target[Symbol.iterator] === 'function'
    ) {
        for (const item of target) {
            resolveTables(item, acc);
        }
        return acc;
    }

    if (target !== null && target !== undefined) {
        console.warn('[table-sorter] Unsupported table target. Pass a selector, table element, collection, or mixed array.');
    }

    return acc;
}

function validateSortOrders(sortOrders, sortableIndices) {
    if (!Array.isArray(sortOrders)) return [];

    const seen = new Set();
    const normalized = [];

    sortOrders.forEach(item => {
        if (!item || typeof item !== 'object') return;

        const index = Number(item.index);
        if (!Number.isInteger(index) || index < 0) return;
        if (sortableIndices && !sortableIndices.has(index)) return;
        if (typeof item.asc !== 'boolean') return;
        if (seen.has(index)) return;

        normalized.push({ index, asc: item.asc });
        seen.add(index);
    });

    return normalized;
}

function normalizeSortType(sortType) {
    if (typeof sortType !== 'string') return null;
    const t = sortType.trim().toLowerCase();
    if (t === 'number' || t === 'numeric') return 'number';
    if (t === 'text' || t === 'string') return 'text';
    if (t === 'date') return 'date';
    return null;
}

export function tableSorter(tableSelector) {
    return {
        sortOrders: [],

        // resolvedTableId will hold the actual id (without #) when a single table is initialized
        _resolvedTableId: 'table-sorter',
        init() {
            ensureStyles();

            const resolvedTables = resolveTables(tableSelector);
            const uniqueTables = [];
            const seen = new Set();
            resolvedTables.forEach(table => {
                if (seen.has(table)) return;
                seen.add(table);
                uniqueTables.push(table);
            });

            if (!uniqueTables.length) {
                return;
            }

            const targetSeed = getTargetSeed(tableSelector);
            if (uniqueTables.length > 1) {
                uniqueTables.forEach((table, i) => {
                    ensureStableTableId(table, targetSeed, i);
                    tableSorter(table).init();
                });
                return;
            }

            const table = uniqueTables[0];
            ensureStableTableId(table, targetSeed, 0);
            const tableId = table.id;

            // store resolved id for other methods via closure
            this._resolvedTableId = tableId;

            const STORAGE_KEY = `sorter-sortOrders-${tableId}`;

            // If <thead data-sort> is present, enable sorting on all its <th> children
            if (table.tHead && table.tHead.hasAttribute('data-sort')) {
                table.tHead.querySelectorAll('th').forEach(th => {
                    // Respect per-column opt-out with data-no-sort
                    if (th.hasAttribute('data-no-sort')) return;
                    if (!th.hasAttribute('data-sort')) th.setAttribute('data-sort', '');
                });
            }

            // Setup sortable headers
            const headers = table.querySelectorAll('th[data-sort]');
            const sortableIndices = new Set();
            headers.forEach((th) => {
                // Determine column index
                // If data-sort is present without a value (e.g. <th data-sort>), use the current column
                const explicitIndex = th.getAttribute('data-sort');
                const index = explicitIndex !== null && explicitIndex !== '' ? parseInt(explicitIndex, 10) : th.cellIndex;

                if (Number.isNaN(index)) {
                    console.warn(`[table-sorter] Invalid data-sort value:`, th);
                    return;
                }

                // Store normalized index
                th.dataset.sort = index;
                sortableIndices.add(index);

                const rawSortType = th.getAttribute('data-sort-type');
                if (rawSortType && !normalizeSortType(rawSortType)) {
                    console.warn(`[table-sorter] Invalid data-sort-type="${rawSortType}" on header. Use "number", "text", or "date".`, th);
                }

                // Add sortable class for styling
                th.classList.add('sortable');
                th.setAttribute('tabindex', '0');
                th.setAttribute('aria-sort', 'none');

                // Auto-insert sort icon if not present
                if (!th.querySelector('svg')) {
                    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    svg.setAttribute('viewBox', '0 0 16 16');
                    svg.setAttribute('fill', 'currentColor');
                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.setAttribute('d', 'M8 3.5 L12.5 9.5 L11.2 9.5 L8 5.5 L4.8 9.5 L3.5 9.5 Z');
                    svg.appendChild(path);
                    th.appendChild(svg);
                }

                // Attach click handler (idempotent re-init safe)
                if (th[CLICK_HANDLER_PROP]) {
                    th.removeEventListener('click', th[CLICK_HANDLER_PROP]);
                }
                th[CLICK_HANDLER_PROP] = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.sort(index, e);
                };
                th.addEventListener('click', th[CLICK_HANDLER_PROP]);

                // Keyboard support (Enter/Space) for accessibility
                if (th[KEY_HANDLER_PROP]) {
                    th.removeEventListener('keydown', th[KEY_HANDLER_PROP]);
                }
                th[KEY_HANDLER_PROP] = (e) => {
                    if (e.key !== 'Enter' && e.key !== ' ') return;
                    e.preventDefault();
                    e.stopPropagation();
                    this.sort(index, e);
                };
                th.addEventListener('keydown', th[KEY_HANDLER_PROP]);
            });

            this.updateHeaderClasses();

            // Load saved sort state
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    const normalized = validateSortOrders(parsed, sortableIndices);
                    if (normalized.length) {
                        this.sortOrders = normalized;
                        this.applySort();
                        this.updateHeaderClasses();
                    } else if (parsed && parsed.length) {
                        console.warn('[table-sorter] Ignoring invalid sort state from localStorage.');
                    }
                }
            } catch (e) {
                console.warn('[table-sorter] Failed to read sort state from localStorage:', e);
            }
        },

        sort(colIndex, event) {
            const existingIndex = this.sortOrders.findIndex(o => o.index === colIndex);

            if (event.shiftKey) {
                // Multi-column sort (add or toggle column)
                if (existingIndex === -1) {
                    this.sortOrders.push({ index: colIndex, asc: true });
                } else {
                    this.sortOrders[existingIndex].asc = !this.sortOrders[existingIndex].asc;
                }
            } else {
                // Single-column sort (reset others)
                if (
                    existingIndex !== -1 &&
                    this.sortOrders.length === 1 &&
                    this.sortOrders[0].index === colIndex
                ) {
                    // Toggle same column
                    this.sortOrders[0].asc = !this.sortOrders[0].asc;
                } else {
                    // New primary column
                    this.sortOrders = [{ index: colIndex, asc: true }];
                }
            }

            this.applySort();
            this.updateHeaderClasses();

            try {
                const tableId = this._resolvedTableId;
                const STORAGE_KEY = `sorter-sortOrders-${tableId}`;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.sortOrders));
            } catch (e) {
                console.warn('[table-sorter] Failed to save sort state to localStorage:', e);
            }
        },

        applySort() {
            const tableId = this._resolvedTableId;
            const table = document.getElementById(tableId);
            if (!table || !table.tBodies[0]) return;

            // Build a map of column index -> date format (from th[data-sort-dateformat])
            const dateFormats = {};
            // Build a map of column index -> forced sort type (from th[data-sort-type])
            const sortTypes = {};
            table.querySelectorAll('th[data-sort]').forEach(th => {
                const idx = parseInt(th.dataset.sort, 10);
                if (!Number.isNaN(idx)) {
                    const df = th.getAttribute('data-sort-dateformat');
                    if (df) dateFormats[idx] = df;
                    const sortType = normalizeSortType(th.getAttribute('data-sort-type'));
                    if (sortType) sortTypes[idx] = sortType;
                }
            });

            const parseDate = (str, fmt) => {
                if (!str) return NaN;
                const s = str.trim();
                if (!fmt) {
                    const t = Date.parse(s);
                    return Number.isNaN(t) ? NaN : t;
                }

                const parts = s.split(/[^0-9]+/);
                const tokens = fmt.split(/[^A-Za-z]+/);
                if (parts.length !== tokens.length) {
                    const t = Date.parse(s);
                    return Number.isNaN(t) ? NaN : t;
                }

                let year = 0, month = 1, day = 1;
                for (let i = 0; i < tokens.length; i++) {
                    const tok = tokens[i].toUpperCase();
                    const val = parseInt(parts[i], 10);
                    if (Number.isNaN(val)) return NaN;
                    if (tok === 'YYYY') year = val;
                    else if (tok === 'YY') year = val + (val < 70 ? 2000 : 1900);
                    else if (tok === 'MM' || tok === 'M') month = val;
                    else if (tok === 'DD' || tok === 'D') day = val;
                }

                const dt = new Date(year, month - 1, day);
                return Number.isNaN(dt.getTime()) ? NaN : dt.getTime();
            };

            const rows = Array.from(table.tBodies[0].rows);

            const compareText = (a, b) => a.localeCompare(b);

            const compareNumber = (a, b) => {
                const numA = parseFloat(a);
                const numB = parseFloat(b);
                if (!Number.isNaN(numA) && !Number.isNaN(numB)) return numA - numB;
                return compareText(a, b);
            };

            const compareDate = (a, b, fmt) => {
                const dA = parseDate(a, fmt);
                const dB = parseDate(b, fmt);
                if (!Number.isNaN(dA) && !Number.isNaN(dB)) return dA - dB;
                return compareText(a, b);
            };

            rows.sort((a, b) => {
                for (const { index, asc } of this.sortOrders) {
                    const valA = a.cells[index]?.textContent.trim() ?? '';
                    const valB = b.cells[index]?.textContent.trim() ?? '';

                    const forcedType = sortTypes[index];
                    const fmt = dateFormats[index];
                    let cmp;
                    if (forcedType === 'number') {
                        cmp = compareNumber(valA, valB);
                    } else if (forcedType === 'date') {
                        cmp = compareDate(valA, valB, fmt);
                    } else if (forcedType === 'text') {
                        cmp = compareText(valA, valB);
                    } else {
                        const numA = parseFloat(valA);
                        const numB = parseFloat(valB);
                        const isNumeric = !Number.isNaN(numA) && !Number.isNaN(numB);
                        if (isNumeric) {
                            cmp = numA - numB;
                        } else {
                            cmp = compareDate(valA, valB, fmt);
                        }
                    }

                    if (cmp !== 0) return asc ? cmp : -cmp;
                }
                return 0;
            });

            rows.forEach(row => table.tBodies[0].appendChild(row));
        },

        updateHeaderClasses() {
            const tableId = this._resolvedTableId;
            const table = document.getElementById(tableId);
            if (!table) return;

            table.querySelectorAll('th[data-sort]').forEach(th => {
                const index = parseInt(th.dataset.sort, 10);
                const svg = th.querySelector('svg');

                th.classList.remove('sort-active');
                svg?.classList.remove('desc');
                th.setAttribute('aria-sort', 'none');

                const sort = this.sortOrders.find(s => s.index === index);
                if (sort) {
                    th.classList.add('sort-active');
                    if (!sort.asc) svg?.classList.add('desc');
                    th.setAttribute('aria-sort', sort.asc ? 'ascending' : 'descending');
                }
            });
        }
    };
}

export default tableSorter;
