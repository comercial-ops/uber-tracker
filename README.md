# Mis Cuentas - Conductor

App web simple (PWA) para registrar ingresos y egresos diarios. Se instala en el iPhone
desde Safari ("Agregar a pantalla de inicio") y guarda los datos en Supabase.

## Categorías

**Ingresos:** Efectivo, Propinas, Servicios no registrados en plataforma
**Egresos:** Peajes reconocidos por la app, Peajes no reconocidos por la app, Gasolina,
Compras en alimentación, Otros

## 1. Crear el proyecto en Supabase (gratis)

1. Andá a https://supabase.com → "Start your project" → creá una cuenta.
2. "New project" → ponele un nombre (ej. `cuentas-conductor`) → elegí una contraseña de base
   de datos (guardala, no la vas a necesitar para esta app pero por si acaso) → creá el proyecto.
   Tarda ~2 minutos en aprovisionar.
3. En el menú lateral: **SQL Editor** → pegá el contenido de [`schema.sql`](schema.sql) → **Run**.
   Esto crea la tabla `transacciones` con seguridad a nivel de fila (RLS).
4. En el menú lateral: **Authentication → Sign In / Providers** → activá **Anonymous Sign-ins**.
   Esto permite que la app identifique tu dispositivo sin pedirte usuario/contraseña.
5. En el menú lateral: **Project Settings → API** → copiá:
   - **Project URL**
   - **anon public key**

## 2. Configurar la app

Abrí [`config.js`](config.js) y reemplazá los dos valores de ejemplo por los que copiaste:

```js
window.SUPABASE_CONFIG = {
  url: "https://xxxxx.supabase.co",
  anonKey: "eyJ...",
};
```

## 3. Subir a GitHub y publicar con GitHub Pages

```bash
git init
git add .
git commit -m "app inicial"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

Luego en GitHub: **Settings → Pages → Source: main branch, / (root)** → Save.
En 1-2 minutos queda publicada en `https://TU-USUARIO.github.io/TU-REPO/`.

## 4. Instalar en el iPhone

1. Abrí el link de GitHub Pages en **Safari** (tiene que ser Safari, no Chrome, para que
   funcione "Agregar a pantalla de inicio" en iOS).
2. Tocá el botón de **Compartir** (el cuadrado con la flecha) → **Agregar a pantalla de inicio**.
3. Listo — queda como una app normal, con ícono, sin barra de navegador.

## Nota sobre privacidad de los datos

Esta versión usa "inicio de sesión anónimo": cada dispositivo que abre la app por primera
vez obtiene una identidad propia y sus datos quedan aislados por esa identidad (nadie más
puede leerlos ni editarlos, ni siquiera con el link). El límite: si el conductor borra los
datos de Safari o cambia de teléfono, esa identidad se pierde y con ella el acceso a los
movimientos ya guardados (quedan en la base, pero no habría forma simple de volver a verlos).
Si eso te preocupa, el siguiente paso natural es agregar login con email — avisame y lo
armamos.
