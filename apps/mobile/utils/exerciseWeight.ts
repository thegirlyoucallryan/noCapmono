export type ExerciseWeightMeta = {
  bodyPart?: string | null;
  equipment?: string | null;
  name?: string | null;
};

/** Cardio / machine moves where lb logging doesn't apply */
const NON_WEIGHT_EQUIPMENT = [
  "stationary bike",
  "elliptical machine",
  "stepmill machine",
  "upper body ergometer",
  "skierg machine",
];

const CARDIO_NAME =
  /\b(burpee|jumping jack|mountain climber|high knee|jump rope|bear crawl|air bike|stationary bike|elliptical|skierg|run\b|jog\b|sprint)\b/i;

/**
 * Whether Play should show weight logging for this exercise.
 * Primary signal: ExerciseDB bodyPart === "cardio".
 */
export function exerciseUsesWeight(meta: ExerciseWeightMeta): boolean {
  const body = (meta.bodyPart ?? "").toLowerCase().trim();
  if (body === "cardio") return false;

  const equip = (meta.equipment ?? "").toLowerCase().trim();
  if (NON_WEIGHT_EQUIPMENT.some((key) => equip.includes(key))) return false;

  if (!body && meta.name && CARDIO_NAME.test(meta.name)) return false;

  return true;
}
