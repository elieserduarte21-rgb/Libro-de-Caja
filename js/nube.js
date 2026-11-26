/* =====================================================================
   NUBE.JS — Motor de guardado en la nube para Libro de Caja
   ---------------------------------------------------------------------
   - Guarda SIEMPRE primero en el dispositivo (localStorage del módulo).
   - Sube a la nube 1,2 s después del último cambio (agrupa ráfagas).
   - Si falla o no hay internet, queda pendiente y reintenta solo.
   - Control de versión: si otro dispositivo escribió después, avisa
     en vez de pisar el trabajo a ciegas.
   - Proveedor: Puter KV (se carga solo cuando hace falta).
   Uso:
     Nube.init({ modulo:'gastos', datos:()=>DB, alRecibir:d=>{...} });
     Nube.guardar();
   ===================================================================== */
(function () {
  'use strict';

  var SDK_URL = 'https://js.puter.com/v2/';
  var DEBOUNCE_MS = 1200;
  var POLL_MS = 30000;

  var cfg = null;          // { modulo, datos, alRecibir, alEstado }
  var sdkPromise = null;
  var timerGuardado = 0;
  var timerReintento = 0;
  var timerPoll = 0;
  var estado = 'local';
  var aplicando = false;
  var chip = null;
  var tituloChip = '';

  /* ---------- claves ---------- */
  function claveDoc() { return 'lc_doc_' + cfg.modulo; }
  function claveMeta() { return 'lc_meta_' + cfg.modulo; }

  function leerMeta() {
    try { return JSON.parse(localStorage.getItem(claveMeta())) || {}; }
    catch (e) { return {}; }
  }
  function escribirMeta(m) {
    try { localStorage.setItem(claveMeta(), JSON.stringify(m)); } catch (e) {}
  }

  /* ---------- estado visible ---------- */
  var TEXTOS = {
    'local':        'Solo en este equipo',
    'cargando':     'Conectando…',
    'sincronizando': 'Guardando en la nube…',
    'nube':         'Guardado en la nube ✓',
    'sin-red':      'Sin internet · guardado local',
    'sin-sesion':   'Conectar cuenta para sincronizar',
    'error':        'Sin nube · reintentar',
    'conflicto':    'Otra sesión cambió los datos'
  };

  function crearChip() {
    if (chip) return;
    chip = document.createElement('button');
    chip.id = 'nubeChip';
    chip.type = 'button';
    chip.innerHTML = '<i></i><span></span>';
    var css = document.createElement('style');
    css.textContent =
      '#nubeChip{position:fixed;left:12px;bottom:52px;z-index:81;display:inline-flex;align-items:center;gap:7px;' +
      'padding:7px 12px;border:0;border-radius:999px;background:rgba(31,41,55,.92);color:#fff;cursor:pointer;' +
      'font:600 11.5px/1 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.25);' +
      'max-width:calc(100vw - 24px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:.92;' +
      '-webkit-tap-highlight-color:transparent;transition:opacity .2s}' +
      '#nubeChip:hover{opacity:1}' +
      '#nubeChip i{width:8px;height:8px;border-radius:50%;background:#9ca3af;flex:0 0 auto}' +
      '#nubeChip.cargando i,#nubeChip.sincronizando i{background:#fbbf24}' +
      '#nubeChip.nube i{background:#34d399}' +
      '#nubeChip.sin-sesion i{background:#60a5fa}' +
      '#nubeChip.error i,#nubeChip.conflicto i{background:#f87171}' +
      '@media print{#nubeChip{display:none!important}}';
    document.head.appendChild(css);
    document.body.appendChild(chip);
    chip.addEventListener('click', alPulsarChip);
    pintar();
  }

  function pintar() {
    if (!chip) return;
    var txt = TEXTOS[estado] || estado;
    if (tituloChip) txt = tituloChip;
    chip.className = estado;
    chip.querySelector('span').textContent = txt;
    chip.title = estado === 'sin-sesion' ? 'Pulsa para iniciar sesión en Puter'
             : estado === 'error' ? 'Pulsa para reintentar la sincronización'
             : estado === 'conflicto' ? 'Pulsa para resolver el conflicto'
             : 'Estado de sincronización';
    chip.style.cursor = (estado === 'sin-sesion' || estado === 'error' || estado === 'conflicto') ? 'pointer' : 'default';
  }

  function ponerEstado(e) {
    estado = e;
    pintar();
    if (cfg && typeof cfg.alEstado === 'function') {
      try { cfg.alEstado(e); } catch (_) {}
    }
  }

  /* ---------- SDK + sesión ---------- */
  function cargarSDK() {
    if (window.puter && window.puter.kv) return Promise.resolve(true);
    if (sdkPromise) return sdkPromise;
    sdkPromise = new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = SDK_URL;
      s.async = true;
      s.onload = function () { resolve(!!(window.puter && window.puter.kv)); };
      s.onerror = function () { sdkPromise = null; resolve(false); };
      document.head.appendChild(s);
    });
    return sdkPromise;
  }

  function hayRed() { return navigator.onLine !== false; }

  function sesionActiva() {
    return cargarSDK().then(function (ok) {
      if (!ok || !window.puter || !puter.auth) return false;
      return puter.auth.isSignedIn().then(function (v) { return !!v; }).catch(function () { return false; });
    });
  }

  /* ---------- lectura / escritura ---------- */
  function leerRemoto() {
    return puter.kv.get(claveDoc()).then(function (doc) {
      if (typeof doc === 'string') {
        try { doc = JSON.parse(doc); } catch (e) { doc = null; }
      }
      return (doc && typeof doc === 'object' && 'd' in doc) ? doc : null;
    });
  }

  function aplicar(remoto) {
    aplicando = true;
    try {
      cfg.alRecibir(remoto.d);
      escribirMeta({ base: remoto.t || 0, t: remoto.t || 0, v: remoto.v || 0, pendiente: false });
      ponerEstado('nube');
    } catch (e) {
      ponerEstado('error');
    } finally {
      aplicando = false;
    }
  }

  function marcarPendiente() {
    var meta = leerMeta();
    meta.pendiente = true;
    escribirMeta(meta);
  }

  function subir(forzar) {
    if (!hayRed()) { ponerEstado('sin-red'); marcarPendiente(); return Promise.resolve(); }

    return sesionActiva().then(function (ok) {
      if (!ok) { ponerEstado('sin-sesion'); marcarPendiente(); return; }

      var datos;
      try { datos = cfg.datos(); } catch (e) { datos = null; }
      if (datos === null || datos === undefined) { ponerEstado('local'); return; }

      return leerRemoto().then(function (remoto) {
        var meta = leerMeta();
        var base = meta.base || 0;

        /* Conflicto: la nube cambió después de nuestra última base */
        if (!forzar && remoto && (remoto.t || 0) > base && (remoto.t || 0) > (meta.t || 0) - 1500) {
          ponerEstado('conflicto');
          return null;
        }

        var ahora = Date.now();
        var doc = { t: ahora, v: ((remoto && remoto.v) || 0) + 1, d: datos };
        return puter.kv.set(claveDoc(), doc).then(function () {
          escribirMeta({ base: ahora, t: ahora, v: doc.v, pendiente: false });
          ponerEstado('nube');
        });
      });
    }).catch(function () {
      marcarPendiente();
      ponerEstado('error');
      programarReintento();
    });
  }

  /* ---------- sincronización ---------- */
  function sincronizar() {
    if (!cfg || aplicando) return Promise.resolve();
    if (!hayRed()) { ponerEstado('sin-red'); return Promise.resolve(); }
    if (estado !== 'nube') ponerEstado('cargando');

    return sesionActiva().then(function (ok) {
      if (!ok) { ponerEstado('sin-sesion'); return; }
      return leerRemoto().then(function (remoto) {
        var meta = leerMeta();
        if (!remoto) return subir(true);
        if ((remoto.t || 0) > (meta.t || 0) + 50) return aplicar(remoto);
        if ((meta.t || 0) > (remoto.t || 0) + 50) return subir(true);
        escribirMeta({ base: remoto.t || 0, v: remoto.v || 0 });
        ponerEstado('nube');
      });
    }).catch(function () { ponerEstado('error'); });
  }

  function programarReintento() {
    clearTimeout(timerReintento);
    timerReintento = setTimeout(function () {
      if (estado === 'error' || estado === 'conflicto') sincronizar();
    }, 20000);
  }

  function alPulsarChip() {
    if (estado === 'sin-sesion') {
      cargarSDK().then(function (ok) {
        if (!ok || !window.puter || !puter.auth) { ponerEstado('error'); return; }
        return puter.auth.signIn().then(function () { sincronizar(); })
          .catch(function () { ponerEstado('error'); });
      });
      return;
    }
    if (estado === 'error') { sincronizar(); return; }
    if (estado === 'conflicto') {
      if (confirm('Otra sesión cambió los datos en la nube.\n\nAceptar = descargar la versión de la nube (se pierde lo local).\nCancelar = subir la versión de este equipo.')) {
        leerRemoto().then(function (r) { if (r) aplicar(r); else ponerEstado('error'); });
      } else {
        subir(true);
      }
    }
  }

  /* ---------- API pública ---------- */
  var Nube = {
    init: function (opciones) {
      if (cfg) return Nube;
      cfg = {
        modulo: opciones.modulo,
        datos: typeof opciones.datos === 'function' ? opciones.datos : function () { return opciones.datos; },
        alRecibir: opciones.alRecibir || function () {},
        alEstado: opciones.alEstado
      };
      document.addEventListener('DOMContentLoaded', function () { crearChip(); });
      if (document.readyState !== 'loading') crearChip();

      window.addEventListener('online', function () {
        if (leerMeta().pendiente) subir(true); else sincronizar();
      });
      window.addEventListener('offline', function () { ponerEstado('sin-red'); });
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
          if (leerMeta().pendiente) subir(true);
        } else if (estado === 'sin-red' || estado === 'error') {
          sincronizar();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (leerMeta().pendiente) subir(true);
      });

      clearInterval(timerPoll);
      timerPoll = setInterval(function () {
        if (document.hidden || aplicando) return;
        if (!leerMeta().pendiente) sincronizar();
      }, POLL_MS);

      setTimeout(function() {
        sesionActiva().then(function(ok) {
          if (!ok) {
            ponerEstado('sin-sesion');
            if (confirm('Es la primera vez que abres esta sección (o no hay una cuenta activa de Puter vinculada).\n\n¿Deseas conectar tu cuenta ahora para guardar y sincronizar tus datos de forma segura?')) {
              cargarSDK().then(function(sdkOk) {
                if (sdkOk && window.puter && puter.auth) {
                  puter.auth.signIn().then(function() { sincronizar(); }).catch(function() {});
                }
              });
            }
          } else {
            sincronizar();
          }
        });
      }, 800);
      return Nube;
    },

    guardar: function () {
      if (!cfg) return;
      var meta = leerMeta();
      meta.t = Date.now();
      meta.pendiente = true;
      escribirMeta(meta);
      ponerEstado(hayRed() ? 'sincronizando' : 'sin-red');
      clearTimeout(timerGuardado);
      timerGuardado = setTimeout(function () { subir(false); }, DEBOUNCE_MS);
    },

    estado: function () { return estado; },
    sincronizar: sincronizar,
    chip: function (texto) { tituloChip = texto || ''; pintar(); }
  };

  window.Nube = Nube;
})();
