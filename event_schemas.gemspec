version = File.read(File.expand_path("VERSION", __dir__)).strip

Gem::Specification.new do |s|
  s.name        = "event_schemas"
  s.version     = version
  s.summary     = "Event schema registry for Breathe"
  s.description = "JSON Schema definitions for Breathe domain events and notifications."
  s.authors     = ["Breathe HR"]
  s.homepage    = "https://github.com/breatheHR/event-schema-registry"
  s.license     = "MIT"

  s.required_ruby_version = ">= 3.0"

  s.files = Dir["lib/**/*.rb", "events/**/*.json", "VERSION"]

  # No runtime dependencies — this gem is data-only.
  # Consuming apps bring their own JSON Schema validator.
end
