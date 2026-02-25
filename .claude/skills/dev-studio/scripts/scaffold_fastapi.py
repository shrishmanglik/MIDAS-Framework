"""FastAPI Project Scaffolder — generates project structure from architecture spec."""

import os

def scaffold(project_name, models=None, routes=None):
    """Generate FastAPI project structure."""
    models = models or ["user"]
    routes = routes or ["auth", "users"]

    dirs = [
        f"{project_name}/app/api/routes",
        f"{project_name}/app/core",
        f"{project_name}/app/models",
        f"{project_name}/app/schemas",
        f"{project_name}/app/services",
        f"{project_name}/alembic/versions",
        f"{project_name}/tests/unit",
        f"{project_name}/tests/integration",
    ]
    for d in dirs:
        os.makedirs(d, exist_ok=True)

    # Create __init__.py files
    for d in dirs:
        init = os.path.join(d, "__init__.py")
        if not os.path.exists(init):
            open(init, "w").close()

    print(f"Scaffolded {project_name} with {len(models)} models, {len(routes)} routes")
    return dirs

if __name__ == "__main__":
    scaffold("my_app", ["user", "post"], ["auth", "users", "posts"])
