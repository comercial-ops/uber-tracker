const CATEGORIAS = {
  ingreso: ["Efectivo", "Propinas", "Servicios no registrados en plataforma"],
  egreso: [
    "Peajes reconocidos por la app",
    "Peajes no reconocidos por la app",
    "Gasolina",
    "Compras en alimentación",
    "Otros",
  ],
};

const state = {
  tipo: "ingreso",
  transacciones: [],
};

const el = {
  categoria: document.getElementById("categoria"),
  monto: document.getElementById("monto"),
  fecha: document.getElementById("fecha"),
  nota: document.getElementById("nota"),
  form: document.getElementById("txForm"),
  submitBtn: document.getElementById("submitBtn"),
  formMsg: document.getElementById("formMsg"),
  btnIngreso: document.getElementById("btnIngreso"),
  btnEgreso: document.getElementById("btnEgreso"),
  txList: document.getElementById("txList"),
  emptyMsg: document.getElementById("emptyMsg"),
  totalIngresosMes: document.getElementById("totalIngresosMes"),
  totalEgresosMes: document.getElementById("totalEgresosMes"),
  totalNetoMes: document.getElementById("totalNetoMes"),
};

let supabase = null;

function fmtMoney(n) {
  return n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
}

function setFormMsg(text, kind) {
  el.formMsg.textContent = text || "";
  el.formMsg.className = "form-msg" + (kind ? " " + kind : "");
}

function renderCategorias() {
  el.categoria.innerHTML = "";
  for (const cat of CATEGORIAS[state.tipo]) {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    el.categoria.appendChild(opt);
  }
}

function setTipo(tipo) {
  state.tipo = tipo;
  el.btnIngreso.classList.toggle("active", tipo === "ingreso");
  el.btnEgreso.classList.toggle("active", tipo === "egreso");
  renderCategorias();
}

function isThisMonth(fechaStr) {
  const d = new Date(fechaStr + "T00:00:00");
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

function renderTotales() {
  let ingresos = 0;
  let egresos = 0;
  for (const tx of state.transacciones) {
    if (!isThisMonth(tx.fecha)) continue;
    if (tx.tipo === "ingreso") ingresos += Number(tx.monto);
    else egresos += Number(tx.monto);
  }
  el.totalIngresosMes.textContent = fmtMoney(ingresos);
  el.totalEgresosMes.textContent = fmtMoney(egresos);
  el.totalNetoMes.textContent = fmtMoney(ingresos - egresos);
}

function renderLista() {
  el.txList.innerHTML = "";
  el.emptyMsg.classList.toggle("visible", state.transacciones.length === 0);

  for (const tx of state.transacciones) {
    const li = document.createElement("li");
    li.className = "tx-item";

    const info = document.createElement("div");
    info.className = "tx-info";
    const cat = document.createElement("span");
    cat.className = "tx-cat";
    cat.textContent = tx.categoria;
    const meta = document.createElement("span");
    meta.className = "tx-meta";
    meta.textContent = tx.fecha + (tx.nota ? " · " + tx.nota : "");
    info.append(cat, meta);

    const actions = document.createElement("div");
    actions.className = "tx-actions";
    const amount = document.createElement("span");
    amount.className = "tx-amount " + tx.tipo;
    amount.textContent = (tx.tipo === "ingreso" ? "+" : "-") + fmtMoney(Number(tx.monto));
    const delBtn = document.createElement("button");
    delBtn.className = "tx-delete";
    delBtn.textContent = "✕";
    delBtn.addEventListener("click", () => eliminarTx(tx.id));
    actions.append(amount, delBtn);

    li.append(info, actions);
    el.txList.appendChild(li);
  }
}

async function cargarTransacciones() {
  const { data, error } = await supabase
    .from("transacciones")
    .select("*")
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    setFormMsg("No se pudieron cargar los movimientos: " + error.message, "error");
    return;
  }
  state.transacciones = data;
  renderLista();
  renderTotales();
}

async function eliminarTx(id) {
  const { error } = await supabase.from("transacciones").delete().eq("id", id);
  if (error) {
    setFormMsg("No se pudo eliminar: " + error.message, "error");
    return;
  }
  await cargarTransacciones();
}

async function guardarTx(e) {
  e.preventDefault();
  el.submitBtn.disabled = true;
  setFormMsg("Guardando...", "");

  const payload = {
    tipo: state.tipo,
    categoria: el.categoria.value,
    monto: parseFloat(el.monto.value),
    fecha: el.fecha.value,
    nota: el.nota.value || null,
  };

  const { error } = await supabase.from("transacciones").insert(payload);

  el.submitBtn.disabled = false;

  if (error) {
    setFormMsg("Error al guardar: " + error.message, "error");
    return;
  }

  setFormMsg("Guardado ✓", "success");
  el.monto.value = "";
  el.nota.value = "";
  el.fecha.valueAsDate = new Date();
  await cargarTransacciones();
  setTimeout(() => setFormMsg("", ""), 2000);
}

async function ensureAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) return;

  const { error } = await supabase.auth.signInAnonymously();
  if (error) {
    setFormMsg("No se pudo iniciar sesión: " + error.message, "error");
    throw error;
  }
}

async function init() {
  if (!window.SUPABASE_CONFIG || window.SUPABASE_CONFIG.url.includes("TU-PROYECTO")) {
    setFormMsg("Falta configurar config.js con tu URL y anon key de Supabase.", "error");
    return;
  }

  supabase = window.supabase.createClient(
    window.SUPABASE_CONFIG.url,
    window.SUPABASE_CONFIG.anonKey
  );

  el.fecha.valueAsDate = new Date();
  renderCategorias();

  el.btnIngreso.addEventListener("click", () => setTipo("ingreso"));
  el.btnEgreso.addEventListener("click", () => setTipo("egreso"));
  el.form.addEventListener("submit", guardarTx);

  try {
    await ensureAuth();
    await cargarTransacciones();
  } catch (err) {
    console.error(err);
  }
}

init();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
