# event-schema-registry

Event schema registry for Breathe HR. Cross-stack, language-agnostic JSON Schema definitions for domain events.

This repo is the **single source of truth** for event schemas. It ships raw JSON files only — consuming apps bring their own validation library.

## Packages

- **npm**: `@breathehr/event-schemas` (GitHub Packages)
- **Ruby gem**: `event_schemas` (via git)

## Structure

Each event schema lives at `events/<domain>/<path>/schema.json`. The directory path maps directly to the event's dot-delimited name.

```
events/
  rota/                                          # Domain events (source: breathe.rota)
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

## Usage

### Node / TypeScript

Install the package:

```bash
npm install @breathehr/event-schemas
```

Load schemas directly as JSON and validate with the library of your choice (e.g. AJV):

```typescript
import Ajv from "ajv";
import addFormats from "ajv-formats";

// Schemas are raw JSON files — require them by path
const shiftCreatedSchema = require("@breathehr/event-schemas/events/rota/shift/created/schema.json");

const ajv = new Ajv({ strict: false });
addFormats(ajv);

const validate = ajv.compile(shiftCreatedSchema);

if (!validate(payload)) {
  console.error(validate.errors);
}
```

### Rails / Ruby

Add the gem to your Gemfile:

```ruby
gem "event_schemas", git: "https://github.com/breatheHR/event-schema-registry", branch: "main"
```

The gem provides helpers to load schemas by event name. Validate with the library of your choice (e.g. json_schemer):

```ruby
require "json_schemer"

# Load the parsed schema hash
schema_hash = EventSchemas.schema("breathe.rota.shift.created")
schemer = JSONSchemer.schema(schema_hash)

schemer.valid?(payload)
# => true

schemer.validate(payload).to_a
# => []

# Or resolve the file path directly
EventSchemas.schema_path("breathe.rota.shift.created")
# => "/path/to/gems/event_schemas-0.3.0/events/rota/shift/created/schema.json"

# List all available event names
EventSchemas.event_names
# => ["breathe.notifications.rota.clock.in-late", "breathe.rota.shift.created", ...]
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
