# table-sorter

A lightweight, dependency-free ES module that adds sortable behavior to an HTML table.

Supports single-column sorting, multi-column sorting with Shift+click, numeric/text auto-detection, and persistent sort state via localStorage.

---

## FEATURES

* No dependencies (pure JavaScript)
* Click column header to sort
* Shift-click for multi-column sorting
* Auto-detects numeric vs text values
* Persists sort order using localStorage, per table

---

## INSTALLATION

#### 1) Install via npm

Install from the npm registry:

```bash
npm install @eydun/table-sorter
```

#### 2) Local file

   Copy: src/table-sorter.js

   Then import:

    <script type="module">
        import { tableSorter } from './src/table-sorter.js';
        tableSorter('myTable').init();
    </script>

---

## USAGE

HTML setup

Add `data-sort` attribute to any header you want to make sortable. Sort icons are automatically inserted.

    <table id="myTable">
        <thead>
            <tr>
                <th data-sort>Name</th>
                <th data-sort>Age</th>
                <th data-sort>City</th>
            </tr>
        </thead>
        <tbody>
            <tr><td>Alice</td><td>30</td><td>Paris</td></tr>
            <tr><td>Bob</td><td>22</td><td>London</td></tr>
        </tbody>
    </table>

Column indices are auto-detected from order. For explicit control use `data-sort="0"`, `data-sort="1"`, etc.

Initialize:

    <script type="module">
        import { tableSorter } from '@eydun/table-sorter';
        tableSorter('myTable').init();
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

Click to see a demo. 

[/demo/index.html](/demo/index.html)

---

## API

Only one entry point:

    import { tableSorter } from '@eydun/table-sorter';
    tableSorter('myTable').init();

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
