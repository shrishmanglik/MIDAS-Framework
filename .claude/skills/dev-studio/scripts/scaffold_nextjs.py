"""Next.js Project Scaffolder — generates frontend structure from architecture spec."""

import os

def scaffold(project_name, pages=None, components=None):
    """Generate Next.js project structure."""
    pages = pages or ["index", "login", "dashboard"]
    components = components or ["Layout", "Header", "Footer"]

    dirs = [
        f"{project_name}/src/app",
        f"{project_name}/src/components",
        f"{project_name}/src/hooks",
        f"{project_name}/src/lib/api",
        f"{project_name}/src/styles",
        f"{project_name}/public",
    ]
    for d in dirs:
        os.makedirs(d, exist_ok=True)

    print(f"Scaffolded {project_name} with {len(pages)} pages, {len(components)} components")
    return dirs

if __name__ == "__main__":
    scaffold("frontend", ["index", "login", "dashboard", "settings"], ["Layout", "Header", "Sidebar"])
