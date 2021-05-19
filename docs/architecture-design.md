# Architecture Design

## Principles

### Functional over Object-Orientated

- The feed building process is best modeled by a pipeline of transformations performed on data objects.
- The data object type, being the RSS feed format and the cache interface, is predictable and static.
- The transformations, being the feed fetching, crawling, parsing, and decorating process, is extensible and dynamic.
- The data strucutre is very list-like and can be processed with high parallelism.
