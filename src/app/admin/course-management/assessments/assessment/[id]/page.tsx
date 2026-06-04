
"use client";

import { useState, useEffect, Suspense } from "react";
import { DndContext, DragOverlay, DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import LeftPanel, { LeftPanelItemMockup } from "./_assets/components/leftPanel";
import MiddlePanel from "./_assets/components/middlePanel";
import { useFormBuilderStore } from "./_assets/lib/useFormBuilderStore";
import { getDefaultElement } from "./_assets/utils/formBuilderDefaults";
import { FormElement, FormElementType, formElementTypeSchema } from "./_assets/schemas/formBuilderSchemas";
import { DashedBoxMockup } from "./_assets/components/dashedbox";
import RightPanel from "./_assets/components/rightPanel";
import { OrderingOptionMockup } from "./_assets/components/renderFormElement";
import { useCreateAssignmentQuestion, useCreateQuizQuestion, useFetchAssessment, useFetchAssignmentQuestions, useFetchQuizQuestions, useUpdateAssignmentQuestion, useUpdateAssignmentQuestionIndex, useUpdateQuizQuestion, useUpdateQuizQuestionIndex } from "./_assets/hooks/assessment";
import RubricSetting, { RubricCriteriaItemMockup } from "./_assets/components/rubricSetting";
import { useRubricStore } from "./_assets/lib/useRubricStore";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { useUpdateRubricCriteriaIndex } from "./_assets/hooks/rubric";

const AssessmentBuilder = ({ params }: { params: { id: string } }) => {
  const id = params.id;
  const activeId = useFormBuilderStore((state) => state.activeId);
  const sortingId = useFormBuilderStore((state) => state.sortingId);
  const [elementOptionSortingId, setElementOptionSortingId] = useState<string | null>(null);
  const [elementOptionSortingItemId, setElementOptionSortingItemId] = useState<string | null>(null);
  const [rubricCriteriaSortingId, setRubricCriteriaSortingId] = useState<string | null>(null);
  const items = useFormBuilderStore((state) => state.items);
  const assessment = useFormBuilderStore((state) => state.assessment);

  const { data: quizQuestions, } = useFetchQuizQuestions(id);
  const { data: assignmentQuestions } = useFetchAssignmentQuestions(id);
  const assessmentData = useFetchAssessment(id);

  const updateRubricCriteriaIndex = useUpdateRubricCriteriaIndex();

  const createQuizQuestion = useCreateQuizQuestion();
  const updateQuizQuestion = useUpdateQuizQuestion();
  const updateQuizQuestionIndex = useUpdateQuizQuestionIndex();

  const createAssignmentQuestion = useCreateAssignmentQuestion();
  const updateAssignmentQuestion = useUpdateAssignmentQuestion();
  const updateAssignmentQuestionIndex = useUpdateAssignmentQuestionIndex();

  const advanceRubricSetting = useFormBuilderStore((state) => state.advanceRubricSetting);

  const setActiveId = useFormBuilderStore((state) => state.setActiveId);
  const setSortingId = useFormBuilderStore((state) => state.setSortingId);
  const addItematIndex = useFormBuilderStore((state) => state.addItemAtIndex);
  const moveItem = useFormBuilderStore((state) => state.moveItem);
  const moveField = useFormBuilderStore((state) => state.moveField);
  const moveElementOption = useFormBuilderStore((state) => state.moveElementOption);

  const reset = useFormBuilderStore((state) => state.reset);

  useEffect(() => {
    reset();
  }, [])

  useEffect(() => {
    if (id) {
      useFormBuilderStore.getState().setAssessmentId(id);
    }
  }, [id])

  useEffect(() => {
    if (assessmentData.data) {
      useFormBuilderStore.getState().setAssessment(assessmentData.data.data.assessment);
      console.log(assessmentData.data.data.assessment);
    }
  }, [assessmentData])

  const selectedItem = useFormBuilderStore((state) => state.selectedItem);

  useEffect(() => {
    if (selectedItem && (selectedItem.type === "SHORT_ANSWER" || selectedItem.type === "ESSAY" || selectedItem.type === "FILE_UPLOAD")) {
      console.log("changing selected item", selectedItem)
      useRubricStore.setState({ rubricName: selectedItem?.rubricName ?? "", rubricDescription: selectedItem.rubricDescription ?? "" });
    }
  }, [selectedItem]);

  useEffect(() => {
    if (!assessment) return
    if (quizQuestions && assessment?.assessmentCategory === "QUIZ") {
      console.log(quizQuestions.data.quizQuestions);
      useFormBuilderStore.getState().setItems(quizQuestions.data.quizQuestions);
      console.log("items from page", quizQuestions.data.quizQuestions);
    } else if (assignmentQuestions && assessment?.assessmentCategory === "ASSIGNMENT") {
      console.log(assignmentQuestions.data.assignmentQuestions);
      useFormBuilderStore.getState().setItems(assignmentQuestions.data.assignmentQuestions.map((question: FormElement) => ("submissionType" in question) ? { ...question, type: question.submissionType.type } : { ...question, type: "SHORT_ANSWER", submissionType: { type: "SHORT_ANSWER", maxLength: 100 } }));
    }
  }, [quizQuestions, assignmentQuestions, assessment])


  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    console.log(active);
    if (active.data.current?.panel === "middle") setSortingId(active.id as string);
    else if (active.data.current?.panel === "rubric") setRubricCriteriaSortingId(active.id as string);
    else if (active.data.current?.panel === "element") {
      setElementOptionSortingId(active.id as string);
      setElementOptionSortingItemId(active.data.current?.itemId as string);
    }
    else if (formElementTypeSchema.safeParse(active.id).success) {
      setActiveId(active.id as FormElementType);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event;
    if (over?.id) {
      if (sortingId) {
        if (assessment?.assessmentCategory === "QUIZ") {
          updateQuizQuestionIndex.mutate({
            id: sortingId,
            index: Number(over.data.current?.index)
          }, {
            onSuccess: () => {
              console.log("Index updated successfully");
              moveItem(sortingId, over.id as string);
            },
            onError: () => {
              console.log("Failed to update index");
            }
          })
        } else {
          updateAssignmentQuestionIndex.mutate({
            id: sortingId,
            index: Number(over.data.current?.index)
          }, {
            onSuccess: () => {
              console.log("Index updated successfully");
              moveItem(sortingId, over.id as string);
            },
            onError: () => {
              console.log("Failed to update index");
            }
          })
        }
      }
      else if (activeId) {
        if (over.data.current?.panel === "left") moveField(activeId, over.id as string);
        else if (over.data.current?.panel === "element") return
        else {
          if (assessment?.assessmentCategory === "QUIZ") {
            createQuizQuestion.mutate({
              type: activeId,
              index: Number(over.id),
              assessmentId: id
            }, {
              onSuccess: (data) => {
                const response = data.data.quizQuestion;
                console.log("response", response);
                addItematIndex(Number(over.id), { ...getDefaultElement(activeId), id: response.id });
                console.log("Question created successfully");
                showToast("success", "Question created successfully", undefined, "toast");
              },
              onError: () => {
                console.log("Failed to create question");
              }
            })
          } else {
            createAssignmentQuestion.mutate({
              type: activeId,
              index: Number(over.id),
              assessmentId: id
            }, {
              onSuccess: (data) => {
                const response = data.data.assignmentQuestion;
                console.log("response", response);
                const defaltElement = { ...getDefaultElement(activeId), id: response.id };
                updateAssignmentQuestion.mutate(
                  defaltElement, {
                  onSuccess: (data) => {
                    console.log(data);
                    addItematIndex(Number(over.id), { id: data.data.assignmentQuestion.id, rubricName: data.data.assignmentQuestion.rubricName, rubricDescription: data.data.assignmentQuestion.rubricDescription, type: data.data.assignmentQuestion.submissionType.type, questionText: data.data.assignmentQuestion.questionText, submissionType: data.data.assignmentQuestion.submissionType, point: data.data.assignmentQuestion.point });
                    showToast("success", "Question created successfully", undefined, "toast");
                  },
                  onError: () => {
                    console.log("Failed to update question");
                  }
                }
                )
                // addItematIndex(Number(over.id), { ...getDefaultElement(activeId), id: response.id });
                console.log("Question created successfully");
              },
              onError: () => {
                console.log("Failed to create question");
              }
            })
          }
        }
        console.log("over id", over.id);
      } else if (elementOptionSortingId) {
        const updatedItem = moveElementOption(elementOptionSortingId, over.id as string, over.data.current?.itemId as string);
        updateQuizQuestion.mutate(
          updatedItem, {
          onSuccess: (data) => {
            console.log(data);
          },
          onError: () => {
            console.log("Failed to update question");
          }
        }
        )
      } else if (rubricCriteriaSortingId) {
        updateRubricCriteriaIndex.mutate(
          { index: over.data.current?.index, rubricCriteriaId: rubricCriteriaSortingId }, {
          onSuccess: (data) => {
            console.log(data);
            useRubricStore.getState().moveRubricCriteria(rubricCriteriaSortingId, over.id as string);
            showToast("success", "Rubric criteria moved successfully", undefined, "toast");
          },
          onError: () => {
            console.log("Failed to update question");
            showToast("error", "Failed to update question", undefined, "toast");
          }
        }
        )
      }
    }
    handleDragCancel();
  }

  const handleDragCancel = () => {
    setActiveId(null);
    setSortingId(null);
    setElementOptionSortingId(null);
    setElementOptionSortingItemId(null);
    console.log("Drag cancelled");
  }

  return (
    <div className="min-h-[calc(100vh-5.5rem)] bg-white flex flex-row gap-[32px] relative">
      <DndContext onDragCancel={handleDragCancel} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <LeftPanel />
        {advanceRubricSetting ? <RubricSetting /> : (
          <>
            <Suspense>
              <MiddlePanel id={id} />
            </Suspense>
            <RightPanel />
          </>
        )}
        <DragOverlay style={{ cursor: "grabbing" }}>{activeId ?
          <LeftPanelItemMockup id={activeId as string} />
          : elementOptionSortingId ? <OrderingOptionMockup id={elementOptionSortingId} itemId={elementOptionSortingItemId as string} />
            : rubricCriteriaSortingId ? <RubricCriteriaItemMockup criteria={useRubricStore.getState().getCriteria(rubricCriteriaSortingId)} index={useRubricStore.getState().getCriteriaIndex(rubricCriteriaSortingId)} />
              : <DashedBoxMockup item={items.find((item) => item.id === sortingId)} selected={false} />
        }</DragOverlay>
      </DndContext>
    </div>
  );
};

export default AssessmentBuilder;
