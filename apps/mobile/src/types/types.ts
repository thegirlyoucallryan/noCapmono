export type Exercise = {
  bodyPart?: string;
  equipment: string;
  gifUrl: string;
  id: string;
  name: string;
  target?: string;
  /** Planned working weight (lb) from My Workout */
  targetWeight?: number | null;
  /** Planned reps from My Workout */
  targetReps?: number | null;
};

export type WorkoutType = {
  Workout: "Circuit" | "Straight Set";
};
