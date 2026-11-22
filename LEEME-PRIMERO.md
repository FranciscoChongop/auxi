# Cómo arrancar Auxi en Claude Code

## Una sola vez

1. Instala **Node.js** (versión LTS) desde nodejs.org. Claude Code lo usa para crear la app e instalar herramientas.
2. Crea una cuenta gratis en **github.com** y un repositorio vacío llamado `auxi`.
3. Descomprime esta carpeta `auxi-starter` donde guardes tus proyectos y cámbiale el nombre a `auxi`.
4. Si tienes el código de "Estudia jugando", cópialo dentro de una carpeta `legacy` aquí adentro.
5. Abre la app de escritorio de Claude, entra a la pestaña **Code** y elige la carpeta `auxi`.

## Primer mensaje en Claude Code

```text
Instala estas skills en este proyecto y confirma cuando estén listas:
npx skills add anthropics/skills --skill frontend-design
npx skills add anthropics/skills --skill webapp-testing
npx skills add anthropics/skills --skill claude-api
Después inicializa git, conecta el repositorio de GitHub "auxi" y haz el primer commit.
```

## Después

Abre `docs/fases.md` y pega el prompt de la Fase 1. Cuando apruebes una fase, pega la siguiente.

Supabase y Vercel se crean en la Fase 3 (cuentas gratis); Claude Code te dirá qué datos necesita.

Las imágenes de León (A1 a A9) van en `public/leon/` cuando estén listas.
