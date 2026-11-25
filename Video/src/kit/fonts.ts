// Every font a look may use. A theme file names families; the files are loaded here, once, and the render
// waits for the faces in FONT_FACES. To give a look a new typeface: add its @fontsource import and its
// faces here, then name the family in the theme file.
import "@fontsource/fraunces/400.css";
import "@fontsource/fraunces/600.css";
import "@fontsource/fraunces/400-italic.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";

/** CSS font shorthands the render waits for before the first frame. */
export const FONT_FACES = [
    "400 40px Fraunces",
    "600 40px Fraunces",
    "italic 400 40px Fraunces",
    "400 40px 'IBM Plex Mono'",
    "500 40px 'IBM Plex Mono'",
];
