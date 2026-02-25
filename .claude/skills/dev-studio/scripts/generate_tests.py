"""Test Generator — creates test stubs from route definitions."""

def generate_test_file(route_path, methods, auth_required=True):
    """Generate pytest test file for an API route."""
    resource = route_path.strip("/").split("/")[-1]
    tests = []

    for method in methods:
        if method == "GET":
            tests.append(f"""
def test_get_{resource}_success(client, auth_headers):
    response = client.get("{route_path}", headers=auth_headers)
    assert response.status_code == 200
""")
        elif method == "POST":
            tests.append(f"""
def test_create_{resource}_success(client, auth_headers):
    data = {{}}  # TODO: add test data
    response = client.post("{route_path}", json=data, headers=auth_headers)
    assert response.status_code == 201
""")

    if auth_required:
        tests.append(f"""
def test_{resource}_unauthorized(client):
    response = client.get("{route_path}")
    assert response.status_code == 401
""")

    return "\n".join(tests)

if __name__ == "__main__":
    print(generate_test_file("/api/users", ["GET", "POST"]))
