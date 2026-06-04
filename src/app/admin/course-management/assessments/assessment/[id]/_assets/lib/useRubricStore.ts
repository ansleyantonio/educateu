import { create, } from "zustand";
import { ConnectRubric, Rubric, RubricCriteria, RubricLevel } from "../schemas/rubricsSchema";
import { arrayMove } from "@dnd-kit/sortable";
import { v4 as uuidv4 } from "uuid";

type RubricStore = {
  rubricName: string;
  rubricDescription: string;
  rubric: Rubric;
  rubricTemplates: Rubric[];
  activeRubrics: boolean;
  getCriteria: (id: string) => RubricCriteria;
  getCriteriaIndex: (id: string) => number;

  setRubricTemplates: (rubrics: Rubric[]) => void;
  updateRubric: (rubric: Rubric) => void;
  getProcessedRubricForConnect: () => ConnectRubric;
  getProcessedRubricTemplatesForAdd: () => ConnectRubric;

  addRubricCriteria: () => void;
  addRubricCriteriaLevel: (index: number) => void;

  updateRubricCriteria: (index: number, rubricCriteria: RubricCriteria) => void;
  updateRubricCriteriaLevel: (index: number, levelIndex: number, level: RubricLevel) => void;

  removeRubricCriteriaLevel: (index: number, levelIndex: number) => void;
  removeRubricCriteria: (rubricCriteriaId: string) => void;

  moveRubricCriteria: (id: string, newId: string) => void;
};

export const useRubricStore = create<RubricStore>((set, get) => ({
  rubricName: "",
  rubricDescription: "",
  rubric: {} as Rubric,
  activeRubrics: false,


  getCriteria: (id: string) => {
    const rubric = get().rubric;
    if (!rubric.rubricCriteria) return {} as RubricCriteria
    return rubric?.rubricCriteria.find((criteria) => criteria.id === id) ?? {} as RubricCriteria;
  },

  getCriteriaIndex: (id: string) => {
    const rubric = get().rubric;
    if (!rubric.rubricCriteria) return -1
    return rubric?.rubricCriteria.findIndex((criteria) => criteria.id === id) ?? -1;
  },

  getProcessedRubricTemplatesForAdd: () => {
    const rubric = get().rubric;
    const rubricCriteria = rubric?.rubricCriteria ?? [];
    return {
      rubricName: "default",
      rubricDescription: "default",
      name: "default",
      rubricCriteriaConnections: rubricCriteria.map((criteria, index) => {
        if (criteria.id && !criteria.id.startsWith("null")) {
          return {
            type: "existing",
            index,
            rubricCriteriaId: criteria.id
          }
        }
        return {
          type: "new",
          index,
          data: criteria,
        }
      }),
    };
  },

  getProcessedRubricForConnect: () => {
    const rubric = get().rubric;
    const rubricName = get().rubricName;
    const rubricDescription = get().rubricDescription;
    const rubricCriteria = rubric?.rubricCriteria ?? [];
    return {
      rubricName: rubricName ?? "",
      rubricDescription: rubricDescription ?? "",
      rubricCriteriaConnections: rubricCriteria.map((criteria, index) => {
        if (criteria.id && !criteria.id.startsWith("null")) {
          return {
            type: "existing",
            index,
            rubricCriteriaId: criteria.id
          }
        }
        return {
          type: "new",
          index,
          data: criteria,
        }
      }),
    };
  },

  rubricTemplates: [] as Rubric[],
  setRubricTemplates: (rubrics: Rubric[]) => {
    const newRubrics = rubrics.map((rubric) => ({
      ...rubric,
      rubricCriteria: rubric.rubricCriteria.map((criteria) => ({
        ...criteria,
        id: "null" + uuidv4(),
      })),
    }));

    set({ rubricTemplates: newRubrics });
  },
  updateRubric: (rubric: Rubric) => set({ rubric }),
  addRubricCriteria: () => {
    const rubric = structuredClone(get().rubric);
    const dummyRubricCriteria: RubricCriteria = {
      id: "null" + uuidv4(),
      name: "content Quality",
      description: "description",
      weight: 5,
      levels: [
        { name: "excellent", weight: 5, description: "description" },
        { name: "good", weight: 4, description: "description" },
        { name: "average", weight: 3, description: "description" },
      ]
    };
    rubric.rubricCriteria.push(dummyRubricCriteria);
    set({ rubric });
  },
  addRubricCriteriaLevel: (index: number) => {
    const rubric = structuredClone(get().rubric);
    if (!rubric!.rubricCriteria[index]!.levels) {
      return;
    }
    rubric.rubricCriteria[index].levels.push({ name: "excellent", weight: 5, description: "description" });
    set({ rubric });
  },
  updateRubricCriteria: (index: number, rubricCriteria: RubricCriteria) => {
    const rubric = structuredClone(get().rubric);
    rubric.rubricCriteria[index] = rubricCriteria;
    // rubric.rubricCriteria = rubric.rubricCriteria.map((criteria) =>
    //   criteria.id === rubricCriteriaId ? rubricCriteria : criteria
    // );
    set({ rubric });
  },

  updateRubricCriteriaLevel: (index: number, levelIndex: number, level: RubricLevel) => {
    const rubric = structuredClone(get().rubric);
    if (!rubric!.rubricCriteria[index]!.levels) {
      return
    }
    rubric.rubricCriteria[index].levels[levelIndex] = level;
    set({ rubric });
  },
  removeRubricCriteriaLevel: (index: number, levelIndex: number) => {
    const rubric = structuredClone(get().rubric);
    if (!rubric!.rubricCriteria[index]!.levels) {
      return
    }
    rubric.rubricCriteria[index].levels.splice(levelIndex, 1);
    set({ rubric });
  },

  removeRubricCriteria: (rubricCriteriaId: string) => {
    const rubric = structuredClone(get().rubric);
    rubric.rubricCriteria = rubric.rubricCriteria.filter(
      (rubricCriteria) => rubricCriteria.id !== rubricCriteriaId
    );
    set({ rubric });
  },
  moveRubricCriteria: (id: string, newId: string) => {
    const rubric = get().rubric;
    rubric.rubricCriteria = arrayMove(
      rubric.rubricCriteria,
      rubric.rubricCriteria.findIndex((rubricCriteria) => rubricCriteria.id === id),
      rubric.rubricCriteria.findIndex((rubricCriteria) => rubricCriteria.id === newId)
    );
    set({ rubric });
  },
}));
