# vanilla-table-sorter

A lightweight, dependency-free ES module that adds sortable behavior to an HTML table.
Supports single-column sorting, multi-column sorting with Shift+click, numeric/text auto-detection, and persistent sort state via localStorage.

---

## FEATURES

* ES module (no bundler required)
* No dependencies (pure JavaScript)
* Click column header to sort
* Shift-click for multi-column sorting
* Auto-detects numeric vs text values
* Persists sort order using localStorage, per table
* CSS-controlled visual indicators
* Minimal setup and API surface

---

## INSTALLATION

#### 1) Install via npm (from GitHub)

Install directly from the GitHub repo:

```bash
npm install github:eydun/vanilla-table-sorte
```

#### 2) Local file

   Copy: src/table-sorter.js

   Then import:

    <script type="module">
        import { tableSorter } from './src/table-sorter.js';

        const sorter = tableSorter('myTable');
        sorter.init();
    </script>

---

## USAGE

HTML setup

Mark sortable headers using the sortable class and define the column index using data-sort-by:

    <table id="myTable">
        <thead>
            <tr>
                <th class="sortable" data-sort-by="0">
                    Name
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

Each sortable th can contain an optional SVG arrow icon to visualize direction.

#### Example:

    <svg viewBox="0 0 10 10"><path d="M5 0 L10 10 L0 10 Z"></path></svg>

Initialize:

    <script type="module">
        import { tableSorter } from '@eydun/vanilla-table-sorter';

        const sorter = tableSorter('myTable');
        sorter.init();
    </script>

Multi-column sorting:

Hold Shift when clicking another column header to add or change secondary/tertiary sort rules.

---

### PERSISTENT SORT STATE

Sort order is stored per table using:

    localStorage["vts-sortOrders-<table-id>"]

Refreshing the page restores the last sort order.

---

### DEMO

Live demo:

    https://eydun.github.io/vanilla-table-sorter

Source example:

    /demo/index.html

---

## API

Only one entry point:

    import { tableSorter } from '@eydun/vanilla-table-sorter';

    const sorter = tableSorter('myTable');
    sorter.init();

No global state, no framework required.

---

## BROWSER SUPPORT

* Chrome
* Firefox
* Safari
* Edge

(Modern browsers; no IE.)

---

## LICENSE

Released under the MIT License. See LICENSE.

---

## CONTRIBUTING

Pull requests and issues are welcome.
