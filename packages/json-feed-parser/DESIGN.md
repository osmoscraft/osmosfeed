# Core

- Purpose
  - Converting xml string into JSON feed object
- Expose API hooks
  - beforeBuild
  - beforeChannel
  - beforeItem
  - afterItem
  - afterChannel
  - afterBuild
- Expose reporting hooks
  - buildStart
  - buildError
  - buildSuccess
  - channelStart
  - channelError
  - channelSuccess
  - itemStart
  - itemSuccess
  - itemError
- Non-concern:
  - Crawling individual items
  - Caching and merging
  - Site building

# Components

- Downloader: URL to xml string, with error handling and retry
- Cache manager: read/write/merge site build cache
- Site builder: JSON feed to html and atom feed, with asset manager and templating engine
- Reporter: progress, error, summary report

# CLI

- Reading config and provide config to core and components
- Mount components to core API
