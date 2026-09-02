# Reglas de Flujo Git: GitFlow Workflow

A partir de ahora, todo el control de versiones debe regirse por la metodología **GitFlow**:
1. **Ramas Principales**:
   - `main`: Código de producción estable desplegado.
   - `dev` (o `develop`): Rama base de integración continua.
2. **Ramas de Soporte**:
   - `feature/<nombre-feature>`: Creadas siempre a partir de `dev`. Para cada nueva característica o funcionalidad.
   - `bugfix/<nombre-fix>`: Creadas a partir de `dev` para solucionar errores identificados en desarrollo.
   - `hotfix/<nombre-fix>`: Creadas a partir de `main` para parches críticos en producción.
   - `release/<version>`: Creadas a partir de `dev` para preparar despliegues y congelar cambios.
3. **Regla de Operación**:
   - El agente puede preparar y ejecutar los comandos locales (`git checkout -b feature/...`, `git add`, `git commit`).
   - Los comandos `git push` siempre se le dejan listos al usuario para su ejecución final.

# Reglas de Agente: Finalización de Sesión (Session Teardown)

Cuando el usuario indique finalizar la sesión (por ejemplo: "finaliza esta sesión", "terminamos la sesión"), el agente debe actuar de la siguiente forma:

1. **Resumen de Trabajo**: Proporcionar un resumen de las tareas completadas, archivos creados/modificados y estado de Git.
2. **Siguiente Comando (Prompt)**: Entregar de forma directa e independiente el comando SDD correspondiente para retomar el trabajo en la siguiente sesión (ej. `/speckit.implement en <feature_directory>`).

# Regla: Prompt de Continuación Optimizado (Token-Saving)

Para maximizar el ahorro de tokens y garantizar la continuidad, el prompt generado para la siguiente sesión debe seguir este formato ultra-compacto y optimizado:

```text
Iniciamos nueva sesión de trabajo.
0. Resumen anterior: [Resumen ultra-compacto de cambios e hitos]
1. Leer base de conocimiento en `docs/contexto_proyecto.md` antes de responder.
2. Modo 'Austeridad de Tokens': Solo opera con la base de conocimiento cargada y el contexto inmediato. No busques historiales de chat previos ni infieras datos fuera del scope.
3. Siguiente paso: [Siguiente paso del TODO / Comando SDD sugerido]
4. Proceso Obligatorio SDD: Todo desarrollo debe hacerse usando obligatoriamente las herramientas y skills de SDD (planificación previa con specify, plan y tasks). NO ejecutes cambios directamente. En el primer turno, haz preguntas aclaratorias sobre los requisitos del siguiente paso antes de elaborar el plan.
```
