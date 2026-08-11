# HOBEE Mobile Design System Freeze

Golden visual baseline: checkpoint `27e2ac51`.

| Group | Frozen values |
|---|---|
| Colors | Canvas `#F8F7F5`; surface `#FFFFFF`; ink `#211F1D`; muted `#8D8882`; border `#E9E5DF`; gold `#D6AC48`; navigation `#292725`. |
| Spacing | Page 20px; compact 8px; regular 12px; loose 16px; section 31px; card inner padding 13px. |
| Shape | Tile 22px; card 23px; hero 26px; fully rounded pills; navigation 38px. |
| Image | Card 154px; hero 303px; profile 77px. |
| Elevation | Warm soft card shadow; stronger 10px-offset floating navigation shadow. |

`components/hobee/design-tokens.ts` is the single source for repeated tokens. `components/hobee/shared-ui.tsx` supplies the shared header, location pill, search, section header, category, commerce, trip, service, community, empty, and skeleton components.
