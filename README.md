# event-schema-registry

Event schema registry for Project Sparkle. Ships JSON Schema (draft-07) files as an npm package consumed by the NestJS API and other services.

## Package

- **npm**: `@breathehr/event-schemas` (GitHub Packages)

## Structure

Each event schema lives at `events/<domain>/<path>/schema.json`. The directory path maps directly to the event's dot-delimited name, enabling natural namespacing at any depth.

```
events/
  rota/                                          # Domain events (source: sparkle.rota)
    published/schema.json                        # rota.published
    shift/
      created/schema.json                        # rota.shift.created
      updated/schema.json                        # rota.shift.updated
      cancelled/schema.json                      # rota.shift.cancelled
      assigned/schema.json                       # rota.shift.assigned
      unassigned/schema.json                     # rota.shift.unassigned
      swapped/schema.json                        # rota.shift.swapped
      dropped/schema.json                        # rota.shift.dropped
  notifications/                                 # Notification events
    rota/                                        # Rota-related notifications
      published/schema.json                      # notification.rota.published
      shift/
        changed/schema.json                      # notification.rota.shift.changed
        cancelled/schema.json                    # notification.rota.shift.cancelled
        open-available/schema.json               # notification.rota.shift.open-available
      swap/
        requested/schema.json                    # notification.rota.swap.requested
        approved/schema.json                     # notification.rota.swap.approved
      clock/
        in-late/schema.json                      # notification.rota.clock.in-late
        in-reminder/schema.json                  # notification.rota.clock.in-reminder
```

## Adding a new event schema

1. Create a directory under `events/<domain>/<path>/` and add a `schema.json` file
2. Follow the existing schemas as a template (draft-07, `additionalProperties: false`, `required` array)
3. Set the `title` field to the dot-delimited event name derived from the directory path
4. Open a PR — CI will check for breaking changes against the published version
5. Bump `VERSION` and `package.json` version together, push a `v*` tag to trigger publish

## Publishing

Publishing is automated via GitHub Actions on tag push:

```bash
# Bump version in both files, then:
git tag v0.3.0
git push origin v0.3.0
```

## Breaking change detection

The CI workflow diffs incoming schemas against the published package using `json-schema-diff`. PRs with breaking changes (removed required fields, type changes) will fail CI.
