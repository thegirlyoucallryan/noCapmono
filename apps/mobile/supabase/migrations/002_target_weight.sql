-- Optional planned working weight for exercises in a saved workout
alter table public.workout_exercises
  add column if not exists target_weight numeric;
