/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// Scratch instrumentation for a macOS CI repro: records the event order and
// the editor's selection around every pointer, key and selection event, and
// prints it when a test fails.

function installEventLog() {
  const log = [];
  window.__evlog = log;
  const t0 = performance.now();
  const desc = n => {
    if (!n) {
      return 'null';
    }
    if (n.nodeType === 3) {
      return '#text"' + n.textContent.slice(0, 6) + '"';
    }
    let s = (n.nodeName || '?').toLowerCase();
    if (typeof n.className === 'string' && n.className) {
      s +=
        '.' +
        n.className
          .split(' ')
          .filter(Boolean)
          .map(c => c.replace('PlaygroundEditorTheme__', ''))
          .slice(0, 2)
          .join('.');
    }
    return s;
  };
  const cellOf = n => {
    const e = n && (n.nodeType === 3 ? n.parentElement : n);
    const c = e && e.closest ? e.closest('td,th') : null;
    if (!c) {
      return '';
    }
    const tr = c.parentElement;
    return `[${Array.prototype.indexOf.call(tr.children, c)},${Array.prototype.indexOf.call(tr.parentElement.children, tr)}]`;
  };
  const dom = () => {
    const s = document.getSelection();
    if (!s || s.rangeCount === 0) {
      return 'none';
    }
    return `${desc(s.anchorNode)}${cellOf(s.anchorNode)}:${s.anchorOffset}->${desc(s.focusNode)}${cellOf(s.focusNode)}:${s.focusOffset}`;
  };
  const point = (ed, p) => {
    const el = ed.getElementByKey(p.key);
    return `${p.key}${cellOf(el)}:${p.offset}${p.type[0]}`;
  };
  const lex = () => {
    const ed = window.lexicalEditor;
    if (!ed) {
      return '-';
    }
    const s = ed.getEditorState()._selection;
    let out = !s
      ? 'null'
      : (s.tableKey ? 'T ' : s.anchor ? 'R ' : 'N ') +
        (s.anchor ? `${point(ed, s.anchor)}->${point(ed, s.focus)}` : '');
    const st = ed._inputState;
    if (st) {
      out += ` md=${st.isSelectionChangeFromMouseDown ? 1 : 0}`;
      if ('mouseDrag' in st) {
        out += ` drag=${st.mouseDrag ? st.mouseDrag.type : '-'}`;
      }
    }
    return out;
  };
  const menu = () => {
    const m = document.querySelector('.table-cell-action-button-container');
    if (!m) {
      return '-';
    }
    const active = m.classList.contains(
      'table-cell-action-button-container--active',
    )
      ? 'A'
      : m.classList.contains('table-cell-action-button-container--inactive')
        ? 'I'
        : '?';
    return active + (m.querySelector('.table-cell-action-button') ? '+btn' : '-btn');
  };
  const table = () => {
    const t = document.querySelector('table');
    const obs = t && t.__lexicalTableSelection;
    if (!obs) {
      return '';
    }
    return ` obs=sel${obs.isSelecting ? 1 : 0},a${obs.anchorCell ? `${obs.anchorCell.x},${obs.anchorCell.y}` : '-'}`;
  };
  const rec = (type, extra) => {
    if (log.length > 2000) {
      log.splice(0, 1000);
    }
    log.push(
      `${(performance.now() - t0).toFixed(1)} ${type}${extra} | dom=${dom()} | lex=${lex()}${table()} | menu=${menu()}`,
    );
  };
  for (const type of [
    'pointerdown',
    'mousedown',
    'pointermove',
    'pointerup',
    'mouseup',
    'click',
    'keydown',
    'keyup',
    'selectionchange',
    'paste',
    'blur',
    'focus',
  ]) {
    document.addEventListener(
      type,
      e => {
        if (type === 'pointermove' && e.buttons === 0) {
          return;
        }
        const extra =
          (e.shiftKey ? ' S' : '') +
          (e.key ? ` key=${e.key}` : '') +
          (e.detail ? ` d${e.detail}` : '') +
          (e.target && e.target.nodeType
            ? ` tgt=${desc(e.target)}${cellOf(e.target)}`
            : '') +
          (e.isTrusted ? '' : ' UNTRUSTED');
        rec(type, extra);
        setTimeout(() => rec(`  ${type}+0`, ''));
      },
      true,
    );
  }
  let registered = null;
  setInterval(() => {
    const ed = window.lexicalEditor;
    if (ed && registered !== ed) {
      registered = ed;
      ed.registerUpdateListener(({tags}) =>
        rec('  update', ` tags=${[...tags].join(',')}`),
      );
      const dispatch = ed.dispatchCommand.bind(ed);
      ed.dispatchCommand = (command, payload) => {
        rec('  cmd', ` ${command.type || '?'}`);
        return dispatch(command, payload);
      };
    }
  }, 20);
}

export async function evlogPage({page}, use, testInfo) {
  await page.addInitScript(installEventLog);
  await use(page);
  if (
    testInfo.status !== testInfo.expectedStatus ||
    process.env.EVLOG_ALWAYS === '1'
  ) {
    let lines = [];
    try {
      lines = await page.evaluate(() => (window.__evlog || []).slice(-300));
    } catch (e) {
      lines = [`could not read the event log: ${e}`];
    }
    const text = lines.join('\n');
    // eslint-disable-next-line no-console
    console.log(
      `===== EVLOG ${testInfo.titlePath.join(' > ')} (repeat ${testInfo.repeatEachIndex}, retry ${testInfo.retry})\n${text}\n===== END EVLOG`,
    );
    await testInfo.attach('evlog', {body: text, contentType: 'text/plain'});
  }
}
