# @eydun/table-sorter

A lightweight, dependency-free ES module that adds sortable behavior to HTML tables.

## Features

- No dependencies (pure JavaScript)
- Single-column sorting by click
- Multi-column sorting with `Shift+click`
- Numeric, text, and date sorting
- Optional explicit date parsing with `data-sort-dateformat`
- Optional explicit type selection with `data-sort-type`
- Persistent sort state per table via `localStorage`
- Keyboard support (`Tab` + `Enter` / `Space`)

## Installation

Install from npm:

```bash
npm install @eydun/table-sorter
```

Or copy `src/table-sorter.js` into your project.

## Quick Start

```html
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

<script type="module">
  import { tableSorter } from '@eydun/table-sorter';
  tableSorter('#myTable').init();
</script>
```

## API

Entry point:

```js
import { tableSorter } from '@eydun/table-sorter';
tableSorter(target).init();
```

`target` can be:

- A selector string (`'#myTable'`, `'.sortable-table'`, `'table[data-sortable]'`)
- A single `<table>` element
- A `NodeList` / `HTMLCollection`
- An array (or iterable) of selectors and/or table elements

Examples:

```js
// Single table by id
tableSorter('#myTable').init();

// All tables by class
tableSorter('.sortable-table').init();

// Any selector
tableSorter('table[data-sortable]').init();

// Single DOM element
const tableEl = document.getElementById('myTable');
tableSorter(tableEl).init();

// Mixed multi-target init in one call
tableSorter(['#usersTable', '#ordersTable', '.team-table']).init();
```

## HTML Attributes

- `data-sort` on `<th>`:
  - Enables sorting for that header.
  - If empty (`<th data-sort>`), current column index is used.
  - If set (`<th data-sort="2">`), explicit column index is used.
- `data-sort` on `<thead>`:
  - Enables sorting on all header cells in that `<thead>`.
- `data-no-sort` on `<th>`:
  - Opts a column out when `<thead data-sort>` is used.
- `data-sort-dateformat` on `<th>`:
  - Explicit date format for parsing values in that column.
  - Supported tokens: `DD`, `D`, `MM`, `M`, `YYYY`, `YY`.
  - Example: `<th data-sort data-sort-dateformat="DD/MM/YYYY">Start</th>`
- `data-sort-type` on `<th>`:
  - Forces sorting strategy for that column.
  - Supported values: `number`, `text`, `date`.
  - Example: `<th data-sort data-sort-type="number">Amount</th>`
- `data-sorter-id` on `<table>`:
  - Optional stable id fallback for persistence when a table has no `id`.

## Sorting Behavior

- Click a sortable header to sort ascending; click again to toggle descending.
- Use `Shift+click` to add/toggle secondary and tertiary sort rules.
- Sort icons are inserted automatically.
- `data-sort-type` overrides auto-detection for its column.
- If both compared values look numeric, numeric comparison is used.
- Otherwise date comparison is attempted, then text comparison.

## Accessibility

Sortable headers get:

- `tabindex="0"`
- `aria-sort` updates (`none`, `ascending`, `descending`)
- Keyboard sorting with `Enter` and `Space`

## Persistent Sort State

Sort state is stored per table id:

```js
localStorage['sorter-sortOrders-<table-id>']
```

On init, the sorter restores saved state if valid. Invalid saved payloads are ignored safely.

## Demo

See `demo/index.html` for a full example covering:

- id-based init
- class/multi-target init
- `data-no-sort`
- explicit index sorting
- explicit type override with `data-sort-type`
- date format sorting
- keyboard sorting
- persistence and invalid-state handling

## Browser Support

Modern browsers:

- Chrome
- Firefox
- Safari
- Edge

(Internet Explorer is not supported.)

## License

MIT. See `LICENSE`.
