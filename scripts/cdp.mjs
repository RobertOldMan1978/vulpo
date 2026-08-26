/* Conductor minimo de Chrome por CDP (Node >= 22 trae WebSocket nativo).
   Existe porque `--dump-dom` fotografia el DOM al `load` (demasiado pronto para un
   juego que arma su pantalla despues) y `--virtual-time-budget` SE CUELGA con estos
   juegos: su audio corre en tiempo real y el reloj virtual no avanza. Con esto se
   navega, se espera y se evalua JavaScript de verdad, como un usuario.

   Uso:  node scripts/cdp.mjs <url> <archivo-con-pasos.js>
   El archivo exporta `export default async (ev) => {...}` donde `ev(expr)` evalua
   una expresion en la pagina (await incluido) y devuelve su valor.                   */
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const CHROMES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
];
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

export async function conducir(url, pasos, { puerto = 9333, mostrar = false } = {}) {
  const perfil = mkdtempSync(join(tmpdir(), 'cdp-'));
  const chrome = spawn(CHROMES.find(Boolean), [
    mostrar ? '--headless=new' : '--headless=new',
    '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--force-prefers-reduced-motion=reduce',      // salta la intro en video
    '--autoplay-policy=no-user-gesture-required',
    `--remote-debugging-port=${puerto}`, `--user-data-dir=${perfil}`,
    'about:blank',
  ], { stdio: 'ignore' });

  let destino = null;
  for (let i = 0; i < 60 && !destino; i++) {
    await espera(250);
    try {
      const r = await fetch(`http://127.0.0.1:${puerto}/json/list`);
      destino = (await r.json()).find((t) => t.type === 'page');
    } catch { /* todavia no levanta */ }
  }
  if (!destino) { chrome.kill(); throw new Error('Chrome no abrio el puerto de depuracion'); }

  const ws = new WebSocket(destino.webSocketDebuggerUrl);
  await new Promise((ok, mal) => { ws.onopen = ok; ws.onerror = () => mal(new Error('ws')); });

  let id = 0; const esperando = new Map(); const consola = []; const fallos = [];
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && esperando.has(msg.id)) { esperando.get(msg.id)(msg); esperando.delete(msg.id); }
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error')
      consola.push((msg.params.args || []).map((a) => a.value ?? a.description ?? '').join(' '));
    if (msg.method === 'Runtime.exceptionThrown')
      consola.push('EXCEPCION: ' + (msg.params.exceptionDetails?.exception?.description || ''));
    // 404 y compania: no llegan a la consola de forma fiable, hay que mirarlos en la red.
    if (msg.method === 'Network.responseReceived' && msg.params.response.status >= 400)
      fallos.push(msg.params.response.status + ' ' + msg.params.response.url);
    if (msg.method === 'Network.loadingFailed' && !msg.params.canceled)
      fallos.push('FALLO ' + (msg.params.errorText || '') + ' ' + (msg.params.type || ''));
  };
  const enviar = (method, params = {}) =>
    new Promise((ok) => { const n = ++id; esperando.set(n, ok); ws.send(JSON.stringify({ id: n, method, params })); });

  await enviar('Runtime.enable');
  await enviar('Page.enable');
  await enviar('Network.enable');

  const ev = async (expr) => {
    const r = await enviar('Runtime.evaluate', {
      expression: `(async()=>{ return (${expr}); })()`,
      awaitPromise: true, returnByValue: true,
    });
    const d = r.result?.result;
    if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || 'error');
    return d?.value;
  };
  ev.ir = async (u) => { await enviar('Page.navigate', { url: u }); await espera(1200); };
  ev.espera = espera;
  // Ancho de teléfono: el panel es mobile-first y ya causó desbordes a 375 px (Sesión 26).
  ev.movil = (ancho = 375, alto = 780) =>
    enviar('Emulation.setDeviceMetricsOverride',
           { width: ancho, height: alto, deviceScaleFactor: 2, mobile: true });
  ev.consola = consola;
  ev.fallos = fallos;      // peticiones con 4xx/5xx o que no cargaron

  await ev.ir(url);
  try { return await pasos(ev); }
  finally { try { ws.close(); } catch {} chrome.kill(); }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [, , url, archivo] = process.argv;
  const mod = await import(pathToFileURL(archivo).href);
  const r = await conducir(url, mod.default);
  if (r !== undefined) console.log(typeof r === 'string' ? r : JSON.stringify(r, null, 1));
  process.exit(0);
}
