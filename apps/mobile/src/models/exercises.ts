class Exercise {
  id: string;
  name: string;
  gifUrl: string;
  equipment: any;
  bodyPart?: string;
  sets: number;
  /** Planned working weight set in My Workout (lb) */
  targetWeight?: number | null;
  /** Planned reps set in My Workout */
  targetReps?: number | null;

  constructor(
    id: any,
    name: any,
    gifUrl: string,
    equipment: any,
    bodyPart?: string,
    sets = 4,
    targetWeight: number | null = null,
    targetReps: number | null = null
  ) {
    this.id = id;
    this.name = name;
    this.gifUrl = gifUrl;
    this.equipment = equipment;
    this.bodyPart = bodyPart;
    this.sets = sets;
    this.targetWeight = targetWeight;
    this.targetReps = targetReps;
  }
}

export default Exercise;
