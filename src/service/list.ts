import Express from 'express';

export const handler = async (req: Express.Request) => {
  return {
    label: 'LINEWORKS Action Hub',
    integrations: [
      {
        name: 'lineworks_messenger',
        label: 'LINEWORKS Messenger',
        supported_action_types: ['query'],
        url: `https://${req.hostname}/execute`,
        icon_data_uri:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAAAXNSR0IArs4c6QAAAOhlWElmTU0AKgAAAAgABgESAAMAAAABAAEAAAEaAAUAAAABAAAAVgEbAAUAAAABAAAAXgExAAIAAAAkAAAAZgEyAAIAAAAUAAAAiodpAAQAAAABAAAAngAAAAAAAABkAAAAAQAAAGQAAAABQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKE1hY2ludG9zaCkAMjAxOTowMTozMCAxNzowNDo1MAAABJAEAAIAAAAUAAAA1KABAAMAAAABAAEAAKACAAQAAAABAAABAKADAAQAAAABAAABAAAAAAAyMDE4OjExOjE5IDExOjAxOjA3ACoG0HQAAAAJcEhZcwAAD2EAAA9hAag/p2kAAArvaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJYTVAgQ29yZSA1LjQuMCI+CiAgIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICAgICAgICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgICAgICAgICB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIKICAgICAgICAgICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgICAgICAgICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICAgICAgICAgICB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iPgogICAgICAgICA8eG1wTU06RGVyaXZlZEZyb20gcmRmOnBhcnNlVHlwZT0iUmVzb3VyY2UiPgogICAgICAgICAgICA8c3RSZWY6aW5zdGFuY2VJRD54bXAuaWlkOjlFMUI4OTQ2RDRFMjExRTg5NDc0RjM4M0Y3QUUzNDA4PC9zdFJlZjppbnN0YW5jZUlEPgogICAgICAgICAgICA8c3RSZWY6ZG9jdW1lbnRJRD54bXAuZGlkOjlFMUI4OTQ3RDRFMjExRTg5NDc0RjM4M0Y3QUUzNDA4PC9zdFJlZjpkb2N1bWVudElEPgogICAgICAgICA8L3htcE1NOkRlcml2ZWRGcm9tPgogICAgICAgICA8eG1wTU06SW5zdGFuY2VJRD54bXAuaWlkOjAwMmFlNTQ1LTk5MGQtNGQ3Ny05MDkzLTRlODQ1ODJiMGVjZjwveG1wTU06SW5zdGFuY2VJRD4KICAgICAgICAgPHhtcE1NOkluZ3JlZGllbnRzPgogICAgICAgICAgICA8cmRmOkJhZz4KICAgICAgICAgICAgICAgPHJkZjpsaSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CiAgICAgICAgICAgICAgICAgIDxzdFJlZjpEb2N1bWVudElEPnV1aWQ6MTJiOTdhYjAtOGE3My0wYTRkLWI4YzktYjgwMzU5M2VmNDg4PC9zdFJlZjpEb2N1bWVudElEPgogICAgICAgICAgICAgICAgICA8c3RSZWY6bGlua0Zvcm0+UmVmZXJlbmNlU3RyZWFtPC9zdFJlZjpsaW5rRm9ybT4KICAgICAgICAgICAgICAgICAgPHN0UmVmOmZpbGVQYXRoPmNsb3VkLWFzc2V0Oi8vY2MtYXBpLXN0b3JhZ2UuYWRvYmUuaW8vYXNzZXRzL2Fkb2JlLWxpYnJhcmllcy8xZTFlNWNlYS00ZjdlLTRhNzgtOWJkMS0zMDk3MGE4YTQ5YzI7bm9kZT01YzJhMTIyNi0wZGE3LTRjMmItYTBjZC1iNmI3NTZlNjhjNzA8L3N0UmVmOmZpbGVQYXRoPgogICAgICAgICAgICAgICA8L3JkZjpsaT4KICAgICAgICAgICAgPC9yZGY6QmFnPgogICAgICAgICA8L3htcE1NOkluZ3JlZGllbnRzPgogICAgICAgICA8eG1wTU06RG9jdW1lbnRJRD54bXAuZGlkOjUyMTQ3Mzg0RTNDMzExRThBRjBGQkE1MUYyMjVDNTUwPC94bXBNTTpEb2N1bWVudElEPgogICAgICAgICA8eG1wTU06T3JpZ2luYWxEb2N1bWVudElEPnhtcC5kaWQ6NTIxNDczODRFM0MzMTFFOEFGMEZCQTUxRjIyNUM1NTA8L3htcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD4KICAgICAgICAgPHhtcE1NOkhpc3Rvcnk+CiAgICAgICAgICAgIDxyZGY6U2VxPgogICAgICAgICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OnNvZnR3YXJlQWdlbnQ+QWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKE1hY2ludG9zaCk8L3N0RXZ0OnNvZnR3YXJlQWdlbnQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpjaGFuZ2VkPi88L3N0RXZ0OmNoYW5nZWQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDp3aGVuPjIwMTktMDEtMzBUMTc6MDQ6NTArMDk6MDA8L3N0RXZ0OndoZW4+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDppbnN0YW5jZUlEPnhtcC5paWQ6MDAyYWU1NDUtOTkwZC00ZDc3LTkwOTMtNGU4NDU4MmIwZWNmPC9zdEV2dDppbnN0YW5jZUlEPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6YWN0aW9uPnNhdmVkPC9zdEV2dDphY3Rpb24+CiAgICAgICAgICAgICAgIDwvcmRmOmxpPgogICAgICAgICAgICA8L3JkZjpTZXE+CiAgICAgICAgIDwveG1wTU06SGlzdG9yeT4KICAgICAgICAgPHhtcDpNb2RpZnlEYXRlPjIwMTktMDEtMzBUMTc6MDQ6NTArMDk6MDA8L3htcDpNb2RpZnlEYXRlPgogICAgICAgICA8eG1wOkNyZWF0b3JUb29sPkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE4IChNYWNpbnRvc2gpPC94bXA6Q3Jl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',
        form_url: `https://${req.hostname}/form`,
        supported_formats: ['txt', 'html'],
        supported_formattings: ['unformatted'],
        supported_visualization_formattings: ['noapply'],
        supported_download_settings: ['push'],
        params: [
          {
            name: 'from_id',
            label: 'From ID',
            required: true,
          },
          {
            name: 'to_id',
            label: 'TO ID',
            required: true,
          },
          {
            name: 'to_name',
            label: 'TO NAME',
            required: true,
          },
        ],
      },
    ],
  };
};
