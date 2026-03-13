# event-schema-registry

Event schema registry for Project Sparkle. Ships JSON Schema (draft-07) files as an npm package consumed by the NestJS API and other services.

## Package

- **npm**: `@sparkle/schemas` (GitHub Packages)

## Structure

```
events/
  todos/
    todo.created.json
    todo.completed.json
```

## Adding a new event schema

1. Create a JSON Schema file under `events/<domain>/<event-name>.json`
2. Follow the existing schemas as a template (draft-07, `additionalProperties: false`, `required` array)
3. Open a PR — CI will check for breaking changes against the published version
4. Bump `VERSION` and `package.json` version together, push a `v*` tag to trigger publish

## Publishing

Publishing is automated via GitHub Actions on tag push:

```bash
# Bump version in both files, then:
git tag v0.2.0
git push origin v0.2.0
```

## Breaking change detection

The CI workflow diffs incoming schemas against the published package using `json-schema-diff`. PRs with breaking changes (removed required fields, type changes) will fail CI.
