# vanilla-table-sorter

A lightweight, dependency-free JavaScript utility that adds sortable behavior to an HTML table.
Supports single-column sorting, multi-column sorting with **Shift+click**, numeric/text auto-detection, and persistent sort state via `localStorage`.

---

## Features

* No dependencies (pure JavaScript)
* Click column header to sort
* Shift-click to add multi-column sorting
* Auto-detects numeric vs text values
* Persists sort order using `localStorage`
* CSS-controlled visual indicators
* Minimal setup, minimal API surface

---

## Installation

Copy the JS fileinto your project:

```
src/
  table-sorter.js
```

Or embed inline if preferred.

---

## Usage

### 1. HTML Setup

Mark sortable headers using the `sortable` class and define the column index using `data-sort-by`:

```html
<table id="myTable">
    <thead>
        <tr>
		<th class="sortable" data-sort-by="0">Name
            <svg viewBox="0 0 10 10"><path d="M5 0 L10 10 L0 10 Z"></path></svg>
		</th>
		<th class="sortable" data-sort-by="1">Age</th>
            <th class="sortable" data-sort-by="2">City</th>
        </tr>
    </thead>
    <tbody>
        <tr><td>Alice</td><td>30</td><td>Paris</td></tr>
        <tr><td>Bob</td><td>22</td><td>London</td></tr>
    </tbody>
</table>
```

Each sortable `<th>` can contain an **optional** SVG arrow icon to visualize direction.  

#### Example:  
`<svg viewBox="0 0 10 10"><path d="M5 0 L10 10 L0 10 Z"></path></svg>`

---

### 2. JavaScript Initialization

```html
<script src="table-sorter.js"></script>
<script>
    const sorter = tableSorter('myTable');
    sorter.init();
</script>
```

---

### 3. Multi-Column Sorting

Hold **Shift** when clicking another sortable column to add or change secondary/tertiary sort rules.

---

## Demo

There is a sample HTML file under [/demo/index.html](/demo/index.html) to show how sorting works.

---

## API

Only one entrypoint:

```js
const sorter = tableSorter(tableId);
sorter.init();
```

No global side effects beyond storing sort order in `localStorage`.

---

## Browser Support

* Chrome
* Firefox
* Safari
* Edge

(Modern browsers; no IE.)

---

## License

Released under the MIT License. See `LICENSE`.

---

## Contributing

Pull requests and issues are welcome.
