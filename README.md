# SEGO Eventos - Plataforma de Gestión

Esta es una aplicación de Next.js construida en Firebase Studio para la gestión integral de la empresa SEGO Eventos.

## Stack de Tecnología

La aplicación está construida con las siguientes tecnologías:

- **Framework**: [Next.js](https://nextjs.org/) (usando el App Router).
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/).
- **Interfaz de Usuario (UI)**: [React](https://react.dev/).
- **Componentes UI**: [ShadCN UI](https://ui.shadcn.com/), una colección de componentes reutilizables construidos sobre Radix UI.
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/), un framework de CSS "utility-first".
- **Base de Datos**: [Supabase](https://supabase.io/), una alternativa de código abierto a Firebase que usa una base de datos PostgreSQL.

## Cómo Desplegar en Vercel

Desplegar esta aplicación en [Vercel](https://vercel.com) es el método recomendado y es muy sencillo.

### 1. Pre-requisito: Configurar la Base de Datos

Antes de desplegar, necesitas una base de datos de Supabase.

1.  **Crea una cuenta en Supabase**: Ve a [supabase.com](https://supabase.com) y regístrate.
2.  **Crea un Nuevo Proyecto**: Dale un nombre a tu proyecto y genera una contraseña segura.
3.  **Obtén tus Claves de API**:
    *   En tu proyecto de Supabase, ve a `Project Settings > API`.
    *   Copia la **Project URL** y la clave `anon` `public`. Las necesitarás para el despliegue.
4.  **Crea las Tablas**: Ve al `SQL Editor` en Supabase y ejecuta el siguiente script para crear todas las tablas necesarias para la aplicación. Puedes encontrar el script en `/supabase_schema.sql` en la raíz de este proyecto.

### 2. Desplegar en Vercel

1.  **Conecta tu Repositorio de Git**:
    *   Sube el código de tu proyecto a un repositorio de GitHub, GitLab o Bitbucket.
    *   Ve a tu dashboard de Vercel y selecciona "Add New... > Project".
    *   Importa el repositorio de tu aplicación.

2.  **Configura el Proyecto**:
    *   Vercel detectará automáticamente que es un proyecto de Next.js.
    *   Ve a la sección **Environment Variables**.
    *   Añade las siguientes dos variables de entorno con los valores que copiaste de Supabase:
        *   `NEXT_PUBLIC_SUPABASE_URL`: Pega la "Project URL".
        *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Pega la clave "anon public".
    *   Asegúrate de que estas variables estén disponibles en todos los entornos (Producción, Vista Previa y Desarrollo).

3.  **Haz clic en "Deploy"**.

¡Listo! Vercel construirá y desplegará tu aplicación, conectada a tu base de datos de Supabase.
