# Components

- JSON feed parser: xml to JSON feed
- Network manager: URL to xml string, with error handling and retry
- Cache manager: read/write/merge site build cache
- Site builder: JSON feed to html and atom feed, with asset manager and templating engine
- Config manager: overlaying user preference on system built-ins
- Orchestrator: coordinate all of above
- Reporter: progress and error handling
- CLI: binding all of above to fs and tty
