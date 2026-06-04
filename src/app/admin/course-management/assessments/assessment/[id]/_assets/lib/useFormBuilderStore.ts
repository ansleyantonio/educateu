import { create } from "zustand";
import { arrayMove } from "@dnd-kit/sortable";
import { FormElement, formElementSchema, FormElementType, formSchema } from "../schemas/formBuilderSchemas";
import { AvailableField, AvailableFields } from "../utils/formBuilderAvailableFields";
import { Assessment } from "../../../_assets/utils/types";

type FormBuilderStore = {
  assessment: Assessment | null;
  assessmentId: string | null;
  fields: AvailableField[];
  items: FormElement[];
  selectedItem: FormElement | null;
  activeId: FormElementType | null;
  sortingId: string | null;
  errors: Record<string, string>;
  selectedTab: number;
  advanceRubricSetting: boolean;

  reset: () => void;
  toggleAdvanceRubricSetting: () => void;
  setAssessment: (assessment: Assessment | null) => void;
  getIndex: (id: string) => number;
  setItem: (item: FormElement) => void;
  getItem: (id: string) => FormElement | null;
  setAssessmentId: (id: string | null) => void;
  setItems: (items: FormElement[]) => void;
  setSelectedTab: (index: number) => void;
  validateForm: () => void;
  validateSelectedItem: () => boolean;
  setSelectedItem: (item: FormElement | null) => void;
  setFields: (fields: AvailableField[]) => void;

  setActiveId: (id: FormElementType | null) => void;
  setSortingId: (id: string | null) => void;

  addItemAtIndex: (index: number, item: FormElement) => void;
  duplicateItemAtIndex: (id: string) => void;
  removeItemAtIndex: (id: string) => void;
  updateSelectedItem: () => void;
  updateItemAtIndex: (id: string, item: FormElement) => void;
  moveElementOption: (id: string, newId: string, itemId: string) => FormElement | null;
  moveItem: (id: string, newId: string) => void;
  moveField: (type: string, newType: string) => void;
  selectItem: (id: string) => void;
  deselectItem: () => void;
  clearItems: () => void;
};

const initialState = {
  assessment: null,
  assessmentId: null,
  fields: [...AvailableFields],
  items: [],
  selectedItem: null,
  activeId: null,
  sortingId: null,
  errors: {},
  selectedTab: 0,
  advanceRubricSetting: false
}

export const useFormBuilderStore = create<FormBuilderStore>((set, get) => ({

  ...initialState,
  reset: () => set(initialState),
  setAssessment: (assessment) => set({ assessment }),
  setAssessmentId: (id) => set({ assessmentId: id }),

  toggleAdvanceRubricSetting: () => set({ advanceRubricSetting: !get().advanceRubricSetting }),


  setItems: (items) => set({ items }),
  getItem: (id) => get().items.find((el) => el.id === id) ?? null,



  setItem: (item) => set({ items: get().items.map((el) => (el.id === item.id ? item : el)) }),

  getIndex: (id) => get().items.findIndex((el) => el.id === id),

  setSelectedTab: (index) => set({ selectedTab: index }),
  validateForm: () => {
    const result = formSchema.safeParse(get().items);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      set({ errors: fieldErrors });
    } else {
      set({ errors: {} });
    }
  },

  validateSelectedItem: () => {
    const result = formElementSchema.safeParse(get().selectedItem);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
        if (issue.path[0] === undefined) fieldErrors['default'] = issue.message
      });
      set({ errors: fieldErrors });
      return false;
    } else {
      set({ errors: {} });
      return true;
    }
  },

  setSelectedItem: (item) => set({ selectedItem: item }),

  setFields: (fields) => set({ fields }),

  setActiveId: (id) => set({ activeId: id }),
  setSortingId: (id) => set({ sortingId: id }),

  addItemAtIndex: (index, item) =>
    set((state) => {
      const newItems = structuredClone(state.items);
      newItems.splice(index, 0, item);
      return {
        items: newItems,
        selectedItem: structuredClone(item),
        selectedTab: 0,
        errors: {},
      };
    }),

  duplicateItemAtIndex: (id) =>
    set((state) => {
      const index = state.items.findIndex((el) => el.id === id);
      const item = state.items[index];
      const newItem = { ...structuredClone(item), id: crypto.randomUUID() };
      const newItems = structuredClone(state.items);
      newItems.splice(index + 1, 0, newItem);
      return { items: newItems };
    }),

  removeItemAtIndex: (id) =>
    set((state) => {
      const newItems = [...state.items];
      const index = newItems.findIndex((el) => el.id === id);
      newItems.splice(index, 1);
      return { items: newItems };
    }),

  updateSelectedItem: () =>
    set((state) => {
      if (!state.selectedItem) return {};
      const item = structuredClone(state.selectedItem);
      const newItems = structuredClone(state.items);
      const index = newItems.findIndex((el) => el.id === item.id);
      newItems.splice(index, 1, item);
      // zod type check
      if (!state.validateSelectedItem()) return { items: state.items };

      return {
        items: newItems,
      };
    }),

  updateItemAtIndex: (id, item) =>
    set((state) => {
      const newItems = [...state.items];
      const index = newItems.findIndex((el) => el.id === id);
      newItems.splice(index, 1, item);
      return { items: newItems };
    }),

  moveElementOption: (id, newId, itemId) => {
    let updatedItem: FormElement | null = null;
    set((state) => {
      const item = structuredClone(state.items.find((item) => item.id === itemId));
      const newItems = structuredClone(state.items);
      if (item?.type !== "ORDERING") return {};
      const oldIndex = item.options.findIndex((option) => option.id === id);
      const newIndex = item.options.findIndex((option) => option.id === newId);
      const newOptions = arrayMove(item.options, oldIndex, newIndex);
      item.options = newOptions;
      updatedItem = structuredClone(item);
      return { items: newItems.map((el) => (el.id === itemId ? item : el)) };
    });
    return updatedItem;
  },

  moveItem: (id, newId) =>
    set((state) => {
      const oldIndex = state.items.findIndex((item) => item.id === id);
      const newIndex = state.items.findIndex((item) => item.id === newId);
      const newItems = arrayMove(state.items, oldIndex, newIndex);
      return { items: newItems };
    }),

  moveField: (type, newType) =>
    set((state) => {
      const oldIndex = state.fields.findIndex((field) => field.type === type);
      const newIndex = state.fields.findIndex((field) => field.type === newType);
      const newFields = arrayMove(state.fields, oldIndex, newIndex);
      return { fields: newFields };
    }),

  selectItem: (id) =>
    set((state) => {
      const item = state.items.find((item) => item.id === id);
      return {
        selectedItem: structuredClone(item),
        selectedTab: 0,
        errors: {},
      }
    }),

  deselectItem: () => set({ selectedItem: null }),

  clearItems: () => set({ items: [], selectedItem: null }),
}));
