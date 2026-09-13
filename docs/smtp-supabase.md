# Correo de autenticación de Supabase por SMTP propio (Resend)

Procedimiento autocontenido. Lo hace Roberto en las consolas de **Resend**, **Cloudflare** y
**Supabase**; el asistente no tiene acceso a esos paneles (solo verifica el DNS en vivo, que es
público). ⚠️ **La API key de Resend es un secreto y vive SOLO en Supabase, nunca en este repo**
(que es público), igual que la clave de Azure.

## Estado

✅ **Aplicado y probado end-to-end el 12/09/2026.** Supabase Auth manda los correos de confirmación
de cuenta y de recuperación de contraseña por **Resend**. El correo de prueba llegó y el enlace
aterrizó en `vulpo.cl/profesor.html`.

## Por qué existe

El servicio de correo **integrado** de Supabase tenía dos límites que bloqueaban el piloto:

1. **2 correos por hora** (`over_email_send_rate_limit`): registrar/confirmar varias cuentas de
   profe seguidas se topaba con eso y había que esperar.
2. La **recuperación de contraseña** no funcionaba sin SMTP propio.

Y por encima, un tercer problema aparte: el **Site URL estaba en `localhost:3000`** (Sesión 36), así
que el enlace de confirmación no llevaba a ninguna parte. SMTP propio de Resend + el fix del Site
URL resuelven los tres.

## Los pasos

### 1 · Resend — verificar el dominio

1. Crear cuenta en [resend.com](https://resend.com) (tier gratis, ~3.000 correos/mes: de sobra).
2. **Domains → Add Domain** → `vulpo.cl`, región **São Paulo (sa-east-1)** (la misma de Supabase).
   - ⚠️ **Desmarcar "Enable click tracking"**: en correos de autenticación, reescribir los links
     rompe el enlace de confirmación (los tokens del `#fragmento` se pierden en el redirect) y lo
     marca más fácil como phishing el filtro de un colegio. Open tracking también apagado.
   - **Custom Return-Path `send`** (default): por esto el SPF de Resend vive en `send.vulpo.cl` y
     **no toca el SPF raíz de Google**.
3. **DNS Records → Auto configure** (integración con Cloudflare). Autorizar — es una autorización
   **única**, no otorga acceso permanente. Agrega 3 registros, todos "Solo DNS":
   - `MX` en `send` → `feedback-smtp.sa-east-1.amazonses.com`
   - `TXT` en `send` → `v=spf1 include:amazonses.com ~all`
   - `TXT` en `resend._domainkey` → la clave DKIM
   - ⚠️ **NO toca el DMARC existente ni el SPF/MX/DKIM de Google Workspace.** Si Resend ofreciera
     cambiar el DMARC, decir que **no**.

> **El SPF NO se fusiona.** Resend aísla su SPF en `send.vulpo.cl`, así que el SPF raíz
> (`v=spf1 include:_spf.google.com ~all`) queda intacto y el correo de Workspace no se afecta. El
> DKIM usa el selector `resend._domainkey`, distinto de `google._domainkey`, así que conviven.

### 2 · Resend — la credencial SMTP

**API Keys → Create API Key**, permiso **Sending access**. Empieza con `re_…`. **Se muestra una
sola vez** → cópiala. Es la contraseña SMTP. Si se pierde, se genera otra (no pasa nada).

### 3 · Supabase — Authentication → Emails → SMTP Settings

Activar **"Enable Custom SMTP"** y llenar:

| Campo | Valor |
|---|---|
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | la API key `re_…` |
| Sender email | `noreply@vulpo.cl` (o `contacto@vulpo.cl` si se quiere que las respuestas lleguen a la bandeja) |
| Sender name | `VULPO` |
| Minimum interval per user | `60` s |

### 4 · Supabase — Authentication → Rate Limits

- **Rate limit for sending emails:** subir a **100/h** (el cap de 2/h era del SMTP integrado; con
  SMTP propio ya no aplica).
- ⚠️ **Rate limit for anonymous users:** subir de 30 a **200/h POR IP**. Cada teléfono que abre el
  juego crea un usuario anónimo, y **un curso entero en el WiFi del colegio comparte una sola IP** —
  con 30, el niño 31 queda afuera con un `429`. Es el límite crítico del día del lanzamiento. (Si un
  colegio completo abriera en el mismo WiFi la misma hora, subirlo más: 300–500.)

### 5 · Supabase — Authentication → URL Configuration (⚠️ el fix sin el cual nada sirve)

- **Site URL:** `https://vulpo.cl/profesor.html` (estaba en `http://localhost:3000`).
- **Redirect URLs → Add URL:** `https://vulpo.cl/**` (el comodín está permitido).

Sin esto el correo se manda pero el enlace de confirmación cae en `localhost` y el auto-registro
falla en silencio.

## Probar (Paso E)

Registrar un profe de prueba en `vulpo.cl/profesor.html` con un correo real → el correo de
confirmación llega (mirar spam la primera vez) → clic → **debe aterrizar en `profesor.html`, no en
localhost**. Después, probar "olvidé mi contraseña".

## Verificar el DNS (esto sí lo hace el asistente — es público)

```bash
# Registros de Resend (deben aparecer):
for name in send.vulpo.cl resend._domainkey.vulpo.cl; do
  echo "== $name =="
  curl -s -H "accept: application/dns-json" \
    "https://cloudflare-dns.com/dns-query?name=$name&type=TXT" \
    | python -c "import sys,json;[print(a['data'][:80]) for a in json.load(sys.stdin).get('Answer',[])]"
done
# Y que Google siga intacto: vulpo.cl TXT con include:_spf.google.com y MX smtp.google.com
```

## ⚠️ El correo NO cambia la autorización

Un profe puede auto-registrarse y confirmar su correo, pero **sigue sin acceso hasta que un admin
lo autoriza** ("+ Autorizar profesor" en el panel + grant por el 🔑). **No hay cola de "pendiente de
aprobar"** — es por diseño de seguridad (registrarse no da acceso a los datos de un colegio). Para
que Roberto no sea el cuello de botella, la autorización se **delega en la UTP** del colegio
(SuperUsuario/Operador vía grants).
