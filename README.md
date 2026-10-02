# Webs de Grupo Nuss

Tres webs estáticas (HTML/CSS/JS, sin backend), publicadas en Netlify:

| Carpeta     | Sitio                      |
|-------------|----------------------------|
| `nuss/`     | www.cucuruchosnuss.com     |
| `dolce-ar/` | dolcepasta.com.ar          |
| `dolce-py/` | www.dolcepastapy.com       |

## Cómo se publica

Netlify está conectado a este repo: **cada push a `main` se publica solo.**

- Nunca se sube nada directo a `main`.
- Cada cambio va en una rama `revision/<tema>` y se sube solo esa rama.
- La rama pasa a `main` únicamente cuando Facu escribe **"PUBLICÁ"**.

## Reglas del código

- Nada de scripts ni estilos inline, ni atributos `onclick` o `style` nuevos, ni librerías externas: todo va en el `script.js` y `styles.css` de cada carpeta (dolce-ar y dolce-py tienen una Content-Security-Policy estricta en `_headers`).
- Netlify distingue mayúsculas: `Productos.html` no es lo mismo que `productos.html`. No se cambian nombres de archivos.
- No se inventan datos de productos (medidas, unidades): si falta o se contradice algo, se le pregunta a Facu.
