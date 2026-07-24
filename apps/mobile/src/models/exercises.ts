class Exercise {
  id: string;
  name: string;
  gifUrl: string;
  equipment: any;
  bodyPart?: string;
  sets: number;

  constructor(
    id: any,
    name: any,
    gifUrl: string,
    equipment: any,
    bodyPart?: string,
    sets = 4
  ) {
    this.id = id;
    this.name = name;
    this.gifUrl = gifUrl;
    this.equipment = equipment;
    this.bodyPart = bodyPart;
    this.sets = sets;
  }
}

export default Exercise;
