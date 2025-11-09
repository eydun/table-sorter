function tableSorter(tableId) {
    const STYLE_ID = 'vts-styles';
    const CSS = `
th.sortable {
    cursor: pointer;
    user-select: none;
    position: relative;
}
th.sortable svg {
    width: 0.8em;
    height: 0.8em;
    position: relative;
    margin: 0.2em;
    top: 0.2em;
    transform: translateY(-50%);
    opacity: 0.3;
    transition: opacity 0.2s ease;
}
th.sortable.sort-active svg { opacity: 1; }
th.sortable svg.desc { transform: translateY(-50%) rotate(180deg); }
`;

    function ensureStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = CSS;
        document.head.appendChild(style);
    }

    return {
        sortOrders: [],

        init() {
            ensureStyles();

            const saved = localStorage.getItem('tableSortOrders');
            if (saved) {
                this.sortOrders = JSON.parse(saved);
                this.applySort();
                this.updateHeaderClasses();
            }

            const table = document.getElementById(tableId);
            table.querySelectorAll('th.sortable').forEach(th => {
                th.addEventListener('click', e => {
                    e.preventDefault();
                    e.stopPropagation();
                    const index = parseInt(th.dataset.sortBy);
                    this.sort(index, e);
                });
            });
        },

        sort(colIndex, event) {
            const existingIndex = this.sortOrders.findIndex(o => o.index === colIndex);

            if (event.shiftKey) {
                if (existingIndex === -1) {
                    this.sortOrders.push({index: colIndex, asc: true});
                } else {
                    this.sortOrders[existingIndex].asc = !this.sortOrders[existingIndex].asc;
                }
            } else {
                if (existingIndex !== -1 && this.sortOrders.length === 1 && this.sortOrders[0].index === colIndex) {
                    this.sortOrders[0].asc = !this.sortOrders[0].asc;
                } else {
                    this.sortOrders = [{index: colIndex, asc: true}];
                }
            }

            this.applySort();
            this.updateHeaderClasses();
            localStorage.setItem('tableSortOrders', JSON.stringify(this.sortOrders));
        },

        applySort() {
            const table = document.getElementById(tableId);
            const rows = Array.from(table.tBodies[0].rows);

            rows.sort((a, b) => {
                for (const {index, asc} of this.sortOrders) {
                    const valA = a.cells[index].textContent.trim();
                    const valB = b.cells[index].textContent.trim();
                    const numA = parseFloat(valA), numB = parseFloat(valB);
                    const isNumeric = !isNaN(numA) && !isNaN(numB);

                    let cmp = isNumeric ? (numA - numB) : valA.localeCompare(valB);
                    if (cmp !== 0) return asc ? cmp : -cmp;
                }
                return 0;
            });

            rows.forEach(row => table.tBodies[0].appendChild(row));
        },

        updateHeaderClasses() {
            document.querySelectorAll(`#${tableId} th.sortable`).forEach(th => {
                const index = parseInt(th.dataset.sortBy);
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
