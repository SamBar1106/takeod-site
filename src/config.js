/**
 * One switch for the future Spline scene.
 * Leave this empty to keep the product image.
 * A non-empty data-spline-url on a .spline-slot overrides this for that slot.
 */
export const SPLINE_SCENE_URL = "";

/**
 * Beat times, in seconds, inside each hero clip.
 * The last time crossfades to the next clip (200ms opacity only).
 * Use [] to play each clip through to the end, then cut.
 */
export const CUT_POINTS = [1.25, 2.5, 3.75, 5];

export const HERO_CLIPS = [
  { file: "h1-bottles.mp4", label: "Branded water bottles" },
  { file: "h2-caps.mp4", label: "Branded caps" },
  { file: "h3-bags.mp4", label: "Branded bags" },
  { file: "h4-tees.mp4", label: "Branded tees" },
];

export const MEDIA = `${import.meta.env.BASE_URL}media/`;

export const HOME_TITLE = "Daykodee | Branded Kids' Products for Family Affair Centers";
