# The Cabinet of Cornelis van der Geest, Collector — Antwerp, 1628\n\n**Willem van Haecht, Artist**

A Three.js interpretation of Willem van Haecht’s *The Gallery of Cornelis van der Geest*. The room follows the supplied image’s architecture and display vocabulary rather than claiming a measured historical reconstruction.

## Open it

Double-click **The Cabinet.html**. This standalone file embeds Three.js, the interface, the five imagined paintings, and the labeled reference as a separate About-panel aid. No installation or local server is required. A modern browser with WebGL2 is needed.

An internet connection loads the 9,657 × 7,191-pixel, unnumbered photograph of Van Haecht’s gallery. Works without an independently verified image use native-resolution crops from this source. Eight identified works also load standalone reproductions (#1, #2, #3, #4, #8, #12, #14, #20). The labeled reference is never used as a painting texture or inspection image. Attribution and image-status notes appear in the detail viewer.

## Controls

- WASD or arrow keys: walk. Hold Shift to move faster.
- Drag the room: look around. “Mouse look” enables pointer lock; Escape releases it.
- Click a painting: open its title, artist, description, image provenance, and source links.
- E: inspect the painting at the center of the view.
- In a detail: scroll or use +/− to zoom; drag to pan; Fit resets the image.
- “Find in the room”: move to a clear viewing position.
- Collection: keyboard-accessible access to every work.
- R or Reset view: return to the entrance.
- Touch: directional buttons to walk, drag to look, tap to inspect.

## Contents and limitations

Twenty identified works retain the reference’s numbering. Five additional paintings are newly generated period-inspired compositions, clearly marked “Imagined.” They are not attributed to historical painters. Six originals were attempted; the tavern generation failed and was omitted.

The coffered ceiling, leaded windows, layered frames, chandelier, cabinets, table, globe, books, porcelain, astrolabe, nautilus, bronze horses, busts, and draped statues are modeled interpretations. The sculpture is procedural geometry, not museum scans. There are no animated people.

Twelve entries use unnumbered details from the original gallery photograph because a verified standalone source is unavailable. The resolution of each detail is limited by the pixels in the full gallery photograph; those entries are identified as details in the viewer. Some originals are lost or disputed. The labeled reference image appears separately in the About panel only.

## Source and development

The modular site is in `dist/`; Three.js 0.183.2 and its license are vendored locally. To serve it, run `npm start` and open `http://localhost:8000`.

`npm run check` performs syntax, metadata, asset, geometry, frame-overlap, and painting-raycast checks. `npm install` installs the optional esbuild packaging dependency; `npm run package` regenerates the standalone HTML. The high-resolution gallery photograph and standalone reproductions load from their public web sources; the standalone HTML therefore needs an internet connection to show the identified historical works.

Source research and reuse notes are in `SOURCE-RESEARCH.json`, `GALLERY-DETAIL-RESEARCH.json`, and `dist/sources.json`. Original generated PNGs are preserved in `generated-originals/`; the full built-in imagegen prompts are in `GENERATED-ART-PROMPTS*.json`.

## Validation record

All 25 paintings passed metadata, geometry, bounds, frame-overlap, and direct raycast checks. The scene has 11 furniture/easel collision obstacles. The standalone file is checked for embedded assets and syntax.

This environment blocked the local HTTP server and browser launch. A software-rendered spatial diagnostic was inspected to verify room composition; it does not validate WebGL lighting or interactive browser behavior. Actual browser QA remains outstanding. The hosted upload also failed because the session could not resolve the publishing service hostname. `validation/software-spatial-preview.png` is explicitly a geometry diagnostic, not a browser screenshot.

Historical context: [Rubenshuis](https://www.rubenshuis.be/en/willem-van-haecht-gallery-cornelis-van-der-geest), [RKD catalogue](https://kunstkamers-in-het-kwadraat.rkdstudies.nl/bijlagen/1-de-kunstkamer-van-cornelis-van-der-geest-antwerpen-rubenshuis/).
