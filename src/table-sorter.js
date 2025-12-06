const STYLE_ID = 'vts-styles';

const CSS = `
th.sortable {
    cursor: pointer;
    user-select: none;
    position: relative;
    white-space: nowrap;         /* prevent wrapping to new line */
}

th.sortable svg {
    width: 0.8em;
    height: 0.8em;
    display: inline-block;       /* keeps icon on same line */
    vertical-align: middle;      /* aligns with text */
    margin-left: 0.3em;
    opacity: 0.3;
    transition: opacity 0.2s ease;
}

th.sortable.sort-active svg {
    opacity: 1;
}

th.sortable svg.desc {
    transform: rotate(180deg);
}
`;

function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
}

/**
 * Create a table sorter instance for the given table ID.
 * Usage:
 *   import { tableSorter } from '@eydun/vanilla-table-sorter';
 *   const sorter = tableSorter('demoTable');
 *   sorter.init();
 */
export function tableSorter(tableId) {
    const STORAGE_KEY = `vts-sortOrders-${tableId}`;

    return {
        sortOrders: [],

        init() {
            ensureStyles();

            const table = document.getElementById(tableId);
            if (!table) {
                console.warn(`[vanilla-table-sorter] Table with id="${tableId}" not found.`);
                return;
            }

            // Load saved sort state
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    this.sortOrders = JSON.parse(saved);
                    this.applySort();
                    this.updateHeaderClasses();
                }
            } catch (e) {
                console.warn('[vanilla-table-sorter] Failed to read sort state from localStorage:', e);
            }

            // Attach click handlers
            table.querySelectorAll('th.sortable').forEach(th => {
                th.addEventListener('click', e => {
                    e.preventDefault();
                    e.stopPropagation();
                    const index = parseInt(th.dataset.sortBy, 10);
                    if (Number.isNaN(index)) return;
                    this.sort(index, e);
                });
            });
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
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.sortOrders));
            } catch (e) {
                console.warn('[vanilla-table-sorter] Failed to save sort state to localStorage:', e);
            }
        },

        applySort() {
            const table = document.getElementById(tableId);
            if (!table || !table.tBodies[0]) return;

            const rows = Array.from(table.tBodies[0].rows);

            rows.sort((a, b) => {
                for (const { index, asc } of this.sortOrders) {
                    const valA = a.cells[index]?.textContent.trim() ?? '';
                    const valB = b.cells[index]?.textContent.trim() ?? '';

                    const numA = parseFloat(valA);
                    const numB = parseFloat(valB);
                    const isNumeric = !Number.isNaN(numA) && !Number.isNaN(numB);

                    let cmp = isNumeric ? (numA - numB) : valA.localeCompare(valB);

                    if (cmp !== 0) return asc ? cmp : -cmp;
                }
                return 0;
            });

            rows.forEach(row => table.tBodies[0].appendChild(row));
        },

        updateHeaderClasses() {
            const table = document.getElementById(tableId);
            if (!table) return;

            table.querySelectorAll('th.sortable').forEach(th => {
                const index = parseInt(th.dataset.sortBy, 10);
                const svg = th.querySelector('svg');

                th.classList.remove('sort-active');
                svg?.classList.remove('desc');

                const sort = this.sortOrders.find(s => s.index === index);
                if (sort) {
                    th.classList.add('sort-active');
                    if (!sort.asc) svg?.classList.add('desc');
                }
            });
        }
    };
}

export default tableSorter;
