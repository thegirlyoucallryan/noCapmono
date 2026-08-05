import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearFavorites, setWorkout, setSessionSettings } from "../store/actions";
import { supabase } from "../../utils/supabase";
import {
  loadCurrentWorkoutQueue,
  saveCurrentWorkoutQueue,
  clearCurrentWorkoutQueue,
} from "../../utils/workoutStore";

/**
 * Keeps My Workout queue in AsyncStorage so app kill / screen lock
 * doesn't wipe the session the user built.
 */
export function WorkoutQueuePersist() {
  const dispatch = useDispatch();
  const exercises = useSelector((s: any) => s.favorites.favoritedExercises);
  const sets = useSelector((s: any) => s.favorites.sets as number);
  const workoutType = useSelector((s: any) => s.favorites.workoutType as string);
  const loadedName = useSelector(
    (s: any) => s.favorites.loadedWorkoutName as string | null
  );
  const loadedId = useSelector(
    (s: any) => s.favorites.loadedWorkoutId as string | null
  );
  const hydrated = useRef(false);
  const skipNextSave = useRef(false);

  const hydrate = async () => {
    const saved = await loadCurrentWorkoutQueue();
    skipNextSave.current = true;
    if (saved?.exercises?.length) {
      dispatch(setWorkout(saved.exercises, saved.name, saved.workoutId));
      dispatch(setSessionSettings(saved.sets, saved.workoutType));
    } else {
      dispatch(clearFavorites());
    }
    hydrated.current = true;
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      await hydrate();
      if (!alive) hydrated.current = false;
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async () => {
      hydrated.current = false;
      skipNextSave.current = true;
      await hydrate();
    });

    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, [dispatch]);

  useEffect(() => {
    if (!hydrated.current) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    const t = setTimeout(() => {
      if (!exercises?.length) {
        clearCurrentWorkoutQueue().catch(() => {});
        return;
      }
      saveCurrentWorkoutQueue(
        exercises.map((ex: any) => ({
          id: ex.id,
          name: ex.name,
          gifUrl: ex.gifUrl ?? "",
          equipment: ex.equipment ?? "",
          bodyPart: ex.bodyPart ?? "",
          targetWeight: ex.targetWeight ?? null,
          targetReps: ex.targetReps ?? null,
        })),
        { sets, workoutType, name: loadedName, workoutId: loadedId }
      ).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [exercises, sets, workoutType, loadedName, loadedId]);

  return null;
}
