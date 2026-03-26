require "json"
require_relative "event_schemas/version"

module EventSchemas
  EVENTS_PATH = File.expand_path("../events", __dir__).freeze

  class SchemaNotFound < StandardError; end

  # Return the parsed JSON schema hash for the given event name.
  #
  #   EventSchemas.schema("breathe.rota.shift.created")
  #   #=> { "$schema" => "...", "title" => "breathe.rota.shift.created", ... }
  #
  def self.schema(event_name)
    path = schema_path(event_name)
    raise SchemaNotFound, "No schema found for #{event_name}" unless File.exist?(path)

    JSON.parse(File.read(path))
  end

  # Return the absolute file path for a schema.
  #
  #   EventSchemas.schema_path("breathe.rota.shift.created")
  #   #=> "/path/to/gems/event_schemas-0.3.0/events/rota/shift/created/schema.json"
  #
  def self.schema_path(event_name)
    relative = event_name.delete_prefix("breathe.").tr(".", "/")
    path = File.join(EVENTS_PATH, relative, "schema.json")
    raise SchemaNotFound, "No schema found for #{event_name}" unless File.exist?(path)

    path
  end

  # List all available event names.
  #
  #   EventSchemas.event_names
  #   #=> ["breathe.notifications.rota.clock.in-late", "breathe.rota.shift.created", ...]
  #
  def self.event_names
    Dir.glob(File.join(EVENTS_PATH, "**", "schema.json")).map do |file|
      relative = file.delete_prefix("#{EVENTS_PATH}/").delete_suffix("/schema.json")
      "breathe.#{relative.tr("/", ".")}"
    end.sort
  end
end
