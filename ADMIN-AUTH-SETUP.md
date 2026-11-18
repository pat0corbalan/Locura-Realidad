# Configuración del acceso administrativo

## Qué cambia

- `/admin` y todas sus subrutas requieren una sesión administrativa válida.
- Si no hay sesión, se redirige a `/login`.
- El login usa el usuario guardado en MongoDB y compara la contraseña con bcrypt.
- La sesión se guarda en una cookie HttpOnly, Secure en producción, SameSite=Lax.
- Los endpoints que crean, modifican o eliminan productos, fotos, álbumes, tours, reservas, eventos y cargas de Cloudinary requieren la cookie.
- El listado completo de reservas también requiere sesión.
- El alta inicial de administrador queda limitada por `ADMIN_BOOTSTRAP_SECRET` y solo funciona si todavía no existe un usuario con role `admin`.
- Se eliminó el log de credenciales del login.

## Variables de entorno en Vercel

Configurar en Project → Settings → Environment Variables:

1. `MONGODB_URI`: conservar la URI real actual de MongoDB.
2. `JWT_SECRET`: secreto aleatorio de al menos 32 caracteres.
3. `ADMIN_BOOTSTRAP_SECRET`: otro secreto aleatorio, distinto de JWT_SECRET y de al menos 32 caracteres.

Generar secretos localmente con:

```bash
openssl rand -base64 48
```

No subir `.env.local` al repositorio ni compartir estos secretos.

## Crear el primer administrador

Con el despliegue ya configurado con las tres variables, ejecutar una sola vez:

```bash
curl -X POST "https://TU-DOMINIO/api/admin/create-user" \
  -H "Content-Type: application/json" \
  -H "x-bootstrap-secret: TU_ADMIN_BOOTSTRAP_SECRET" \
  -d '{"usuario":"TU_USUARIO","password":"UNA_CONTRASENA_LARGA_DE_AL_MENOS_12_CARACTERES"}'
```

La contraseña se hashea con bcrypt antes de almacenarse.

Cuando responda `201`, eliminar inmediatamente `ADMIN_BOOTSTRAP_SECRET` de las variables de entorno de Vercel y hacer un nuevo deploy. El endpoint de bootstrap también queda cerrado cuando ya existe un administrador.

## Probar

1. Abrir `/admin` en una ventana privada: debe redirigir a `/login`.
2. Iniciar sesión con el usuario recién creado.
3. Verificar que se abre el panel existente.
4. Probar crear/editar/eliminar un producto, foto, álbum y tour.
5. Abrir `/api/reservas` sin sesión: debe responder `401`.
6. Cerrar sesión y comprobar que `/admin` vuelve a redirigir al login.

## Importante

La protección se aplica en el servidor; ocultar botones o enlaces no se considera una medida de seguridad. Los GET públicos de catálogo, fotos, álbumes y tours siguen públicos para que la tienda pueda mostrarlos.

La protección de sesión no reemplaza rate limiting distribuido. Para producción con múltiples instancias serverless, conviene agregar limitación de intentos de login con un almacén compartido (por ejemplo Redis/Upstash) y monitoreo de accesos.
