# Accessibility engineering

This revision gives the theme toggle a stable name and pressed state, adds non-color trace encodings (solid/dashed and circle/square phase markers), numerical cursor values in a native expandable table, prediction error semantics and larger navigation targets. Native range controls expose their values; decorative duplicate value spans are hidden from assistive technology. STFT text describes the selected periodic window.

The targeted Chromium suite checks both distributions: skip-link focus, keyboard workspace navigation, stable toggle state, label presence on visible controls and canvases, seven selected theme token pairs at a 4.5:1 contrast target, expandable cursor table, input validation and 320px reflow. It generates JSON and screenshots. It does not establish a full accessibility tree, screen-reader, zoom, forced-colors or WCAG conformance audit. The cursor table is a selected measurement alternative, not a complete nonvisual representation of every graph.

Run `python tests/e2e/accessibility.py` after installing Playwright 1.51 and Chromium. See [test strategy](TEST_MATRIX.md).
