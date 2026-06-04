import { Textarea } from "@/components/ui/textarea";
import { useFormBuilderStore } from "../lib/useFormBuilderStore";
import { v4 as uuid } from "uuid";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { Switch } from "antd";
import { shuffleArray } from "@/utils/ShuffleArray";
import { generateColorShades } from "@/utils/GenerateColorShades";

export default function GeneralSetting() {
  const selectedItem = useFormBuilderStore((state) => state.selectedItem);
  const setSelectedItem = useFormBuilderStore((state) => state.setSelectedItem);
  const errors = useFormBuilderStore((state) => state.errors);
  const colorShades = generateColorShades(selectedItem?.type === "MATCHING" ? selectedItem?.answer?.length : 1);


  const handleSelectAnswer = (id: string) => {
    if (!selectedItem) return;

    const newSelectedItem = { ...selectedItem };

    if (newSelectedItem.type === "MULTIPLE_CHOICE") {
      newSelectedItem.answer = newSelectedItem.answer === id ? "" : id;
    } else if (newSelectedItem.type === "MULTIPLE_SELECT") {
      const currentAnswers = Array.isArray(newSelectedItem.answer) ? newSelectedItem.answer : [];
      if (currentAnswers.includes(id)) {
        newSelectedItem.answer = currentAnswers.filter(a => a !== id);
      } else {
        newSelectedItem.answer = [id, ...currentAnswers];
      }
    }

    setSelectedItem(newSelectedItem);
  };

  const handleAddOption = () => {
    if (!selectedItem) return;

    let newSelectedItem = { ...selectedItem };

    if (!newSelectedItem || newSelectedItem.type !== "MULTIPLE_CHOICE" && newSelectedItem.type !== "MULTIPLE_SELECT" && newSelectedItem.type !== "ORDERING") return newSelectedItem; // or return null safely

    const newOption = { id: uuid(), text: "Option " + (newSelectedItem.options.length + 1) };
    newSelectedItem = { ...newSelectedItem, options: [...newSelectedItem.options, newOption] };
    if (newSelectedItem.type === "ORDERING") newSelectedItem.answer = [...newSelectedItem.answer, newOption.id];
    console.log(newSelectedItem);
    setSelectedItem(newSelectedItem);
  };

  const handleAddPairOption = () => {
    if (!selectedItem) return;
    let newSelectedItem = { ...selectedItem };
    if (!newSelectedItem || newSelectedItem.type !== "MATCHING") return newSelectedItem; // or return null safely
    const newOption = [{ id: uuid(), text: "Term " + (newSelectedItem.answer.length + 1) }, { id: uuid(), text: "Definition " + (newSelectedItem.answer.length + 1) }];
    newSelectedItem.answer = [...newSelectedItem.answer, { leftSideId: newOption[newOption.length - 2].id, rightSideId: newOption[newOption.length - 1].id }];
    newSelectedItem = { ...newSelectedItem, options: { leftSide: [...newSelectedItem.options.leftSide, newOption[0]], rightSide: [...newSelectedItem.options.rightSide, newOption[1]] } };
    newSelectedItem.options.rightSide = shuffleArray(newSelectedItem.answer.map(a => newSelectedItem.options.rightSide.find(o => o.id === a.rightSideId)!));
    setSelectedItem(newSelectedItem);
  };

  const handleUpdateLeftSideText = (id: string, text: string) => {
    if (!selectedItem) return;
    let newSelectedItem = { ...selectedItem };
    if (!newSelectedItem || newSelectedItem.type !== "MATCHING") return newSelectedItem; // or return null safely
    newSelectedItem = { ...newSelectedItem, options: { ...newSelectedItem.options, leftSide: newSelectedItem.options.leftSide.map((option, i) => option.id === id ? { ...option, text } : option) } };
    setSelectedItem(newSelectedItem);
  };

  const handleUpdateRightSideText = (id: string, text: string) => {
    if (!selectedItem) return;
    let newSelectedItem = { ...selectedItem };
    if (!newSelectedItem || newSelectedItem.type !== "MATCHING") return newSelectedItem; // or return null safely
    newSelectedItem = { ...newSelectedItem, options: { ...newSelectedItem.options, rightSide: newSelectedItem.options.rightSide.map((option, i) => option.id === id ? { ...option, text } : option) } };
    setSelectedItem(newSelectedItem);
  };

  const handleUpdateOptionText = (id: string, text: string) => {
    if (!selectedItem) return;
    let newSelectedItem = { ...selectedItem };
    if (!newSelectedItem || newSelectedItem.type !== "MULTIPLE_CHOICE" && newSelectedItem.type !== "MULTIPLE_SELECT" && newSelectedItem.type !== "ORDERING") return newSelectedItem; // or return null safely
    newSelectedItem = { ...newSelectedItem, options: newSelectedItem.options.map((option, i) => option.id === id ? { ...option, text } : option) };
    setSelectedItem(newSelectedItem);
  };

  const handleRemovePairOption = (leftSideId: string, rightSideId: string) => {
    if (!selectedItem) return;
    let newSelectedItem = { ...selectedItem };
    if (!newSelectedItem || newSelectedItem.type !== "MATCHING") return newSelectedItem; // or return null safely
    newSelectedItem = {
      ...newSelectedItem,
      answer: newSelectedItem.answer.filter(a => a.leftSideId !== leftSideId && a.rightSideId !== rightSideId),
      options: {
        leftSide: newSelectedItem.options.leftSide.filter(o => o.id !== leftSideId),
        rightSide: newSelectedItem.options.rightSide.filter(o => o.id !== rightSideId)
      }
    };
    newSelectedItem.options.rightSide = shuffleArray(newSelectedItem.answer.map(a => newSelectedItem.options.rightSide.find(o => o.id === a.rightSideId)!));
    setSelectedItem(newSelectedItem);
  }
  const handleRemoveOption = (id: string) => {
    if (!selectedItem) return;
    let newSelectedItem = { ...selectedItem };
    if (!newSelectedItem || newSelectedItem.type !== "MULTIPLE_CHOICE" && newSelectedItem.type !== "MULTIPLE_SELECT" && newSelectedItem.type !== "ORDERING") return newSelectedItem; // or return null safely
    newSelectedItem = { ...newSelectedItem, options: newSelectedItem.options.filter((_, i) => _.id !== id) };

    if (newSelectedItem.type === "MULTIPLE_CHOICE") newSelectedItem = { ...newSelectedItem, answer: newSelectedItem.answer === id ? "" : newSelectedItem.answer };
    else if (newSelectedItem.type === "MULTIPLE_SELECT" || newSelectedItem.type === "ORDERING") newSelectedItem = { ...newSelectedItem, answer: Array.isArray(newSelectedItem.answer) ? newSelectedItem.answer.filter(a => a !== id) : [] };

    setSelectedItem(newSelectedItem);
  };

  const handleRandomizeOptions = () => {
    if (!selectedItem) return;
    let newSelectedItem = { ...selectedItem };
    if (!newSelectedItem || newSelectedItem.type !== "MULTIPLE_CHOICE" && newSelectedItem.type !== "MULTIPLE_SELECT" && newSelectedItem.type !== "ORDERING") return newSelectedItem; // or return null safely
    newSelectedItem = { ...newSelectedItem, options: newSelectedItem.options.sort(() => Math.random() - 0.5) };
    setSelectedItem(newSelectedItem);
  };

  const handlePartialCredit = () => {
    if (!selectedItem) return;
    let newSelectedItem = { ...selectedItem };
    if (!newSelectedItem || newSelectedItem.type !== "MULTIPLE_SELECT") return newSelectedItem; // or return null safely
    newSelectedItem = { ...newSelectedItem, partialMark: !newSelectedItem.partialMark };
    setSelectedItem(newSelectedItem);
  }


  return (
    <>
      <div className="flex flex-col gap-[8px]">
        <h1 className="text-[14px] font-medium text-[#272E35]">Question Text <span className="text-[#7E8C9A]">(Required)</span></h1>
        <Textarea value={selectedItem?.questionText}
          onChange={(e) =>
            selectedItem && setSelectedItem({ ...selectedItem, questionText: e.target.value })
          }
          className="h-[129px]" placeholder="Write your question here" />
        {errors.questionText && <p className="text-[#D32F2F] text-[12px]">{errors.questionText}</p>}
      </div>
      <div className="flex flex-col gap-[8px]">
        <h1 className="text-[14px] font-medium text-[#272E35]">Points</h1>
        <input
          value={selectedItem?.point}
          onChange={(e) =>
            selectedItem && setSelectedItem({ ...selectedItem, point: parseInt(e.target.value) })
          }
          min={0}
          type="number"
          placeholder="Points"
          className="h-[40px] bg-transparent border border-[#CBD5E1] rounded-[4px] px-[12px]" />
        {errors.points && <p className="text-[#D32F2F] text-[12px]">{errors.point}</p>}
      </div>

      {/* Multiple Choice/select */}
      {(selectedItem?.type === "MULTIPLE_CHOICE" || selectedItem?.type === "MULTIPLE_SELECT") && selectedItem.options && (
        <div className="flex flex-col gap-[8px] items-center">
          <h1 className="text-[14px] font-medium text-[#272E35] text-left w-full">Options <span className="text-[#7E8C9A]">({selectedItem.type === "MULTIPLE_CHOICE" ? "Select The right One" : "Select All That Correct Answers"})</span></h1>
          {selectedItem.options.map((option, index) => (
            <div key={index} className="flex flex-row gap-[8px] w-full items-center hover:cursor-pointer">
              <div className="flex flex-row gap-[8px] items-center flex-1 h-[40px] border border-[#EAECF0] rounded-[2px] py-[6px] px-[12px]">
                <input
                  value={option.text}
                  onChange={(e) => handleUpdateOptionText(option.id, e.target.value)}
                  className="flex-1 w-[10px] bg-transparent focus:outline-none" />
                <button className="z-10 w-[24px]" onClick={() => handleRemoveOption(option.id)}>
                  <img height={24} width={24} src="/assets/icons/delete.svg" alt="" />
                </button>
              </div>
              <Checkbox id={option.id} onClick={() => handleSelectAnswer(option.id)} checked={selectedItem.type === "MULTIPLE_CHOICE" ? selectedItem.answer === option.id : selectedItem.answer.some((id) => id === option.id)} />
            </div>
          ))}
          {errors.options && <p className="text-[#D32F2F] text-[12px]">{errors.options}</p>}
          {errors.answer && <p className="text-[#D32F2F] text-[12px]">{errors.answer}</p>}
        </div>
      )}


      {/* true & false */}
      {selectedItem?.type === "TRUE_FALSE" && (
        <div className="flex flex-col gap-[8px]">
          <h1 className="text-[14px] font-medium text-[#272E35] text-left w-full">Options <span className="text-[#7E8C9A]">(Select The right One)</span></h1>
          <div className="flex flex-row gap-[8px] hover:cursor-pointer items-center" onClick={() => setSelectedItem({ ...selectedItem, answer: true })}>
            {/* <RadioGroup value="true" id={selectedItem.id} onChange={() => setSelectedItem({ ...selectedItem, answer: true })} /> */}
            <p className="h-[40px] flex-1 flex items-center border border-[#EAECF0] rounded-[2px] py-[6px] px-[12px] text-[16px] font-normal">True</p>
            <Checkbox checked={selectedItem.answer} id={`${selectedItem.id}-true`} name="answer" value="true" />
          </div>
          <div onClick={() => setSelectedItem({ ...selectedItem, answer: false })} className="flex flex-row gap-[8px] hover:cursor-pointer items-center">
            {/* <RadioGroup value="false" id={selectedItem.id} onChange={() => setSelectedItem({ ...selectedItem, answer: false })} /> */}
            <p className="h-[40px] flex-1 flex items-center border border-[#EAECF0] rounded-[2px] py-[6px] px-[12px] text-[16px] font-normal">False</p>
            <Checkbox checked={!selectedItem.answer} id={`${selectedItem.id}-false`} name="answer" value="false" />
          </div>
        </div>
      )}

      {/* fill in the blanks */}
      {selectedItem?.type === "FILL_BLANK" && (
        <div className="flex flex-col gap-[8px]">
          <h1 className="text-[14px] font-medium text-[#272E35] text-left w-full">Answer</h1>
          <input
            value={selectedItem?.answer}
            onChange={(e) =>
              selectedItem && setSelectedItem({ ...selectedItem, answer: e.target.value })
            }
            type="text"
            placeholder="Answer"
            className="h-[40px] bg-transparent border border-[#CBD5E1] rounded-[4px] px-[12px]" />
        </div>
      )}

      {/* ORDERING */}
      {selectedItem?.type === "ORDERING" && (
        <>
          <div className="flex flex-col gap-[8px] items-center">
            <h1 className="text-[14px] font-medium text-[#272E35] text-left w-full">Options <span className="text-[#7E8C9A]">(Add them in order)</span></h1>
            {selectedItem.answer.map((id, index) => (
              <div key={index} className="flex flex-row gap-[8px] w-full items-center hover:cursor-pointer">
                <div className="flex flex-row gap-[8px] items-center flex-1 h-[40px] border border-[#EAECF0] rounded-[2px] py-[6px] px-[12px]">
                  <input value={selectedItem.options.find((option) => option.id === id)?.text} onChange={(e) => handleUpdateOptionText(id, e.target.value)} className="flex-1 bg-transparent focus:outline-none" />
                  <button className="z-10 w-[24px]" onClick={() => handleRemoveOption(id)}>
                    <img height={24} width={24} src="/assets/icons/delete.svg" alt="" />
                  </button>
                </div>
              </div>
            ))}
            {errors.options && <p className="text-[#D32F2F] text-[12px]">{errors.options}</p>}
            {errors.answer && <p className="text-[#D32F2F] text-[12px]">{errors.answer}</p>}
          </div>
        </>
      )}

      {/* Matching */}
      {selectedItem?.type === "MATCHING" && (
        <div className="flex flex-col gap-[8px]">
          <h1 className="text-[14px] font-medium text-[#272E35] text-left w-full">Options <span className="text-[#7E8C9A] inline-block">(Add MATCHING options in pair)</span></h1>
          <div className="flex flex-col gap-[12px]">
            {selectedItem.answer.map((item, index) => (
              <div key={index} className="flex flex-row gap-[8px] w-full items-center">
                <div className="flex relative flex-col gap-[8px] w-[10px] flex-1">
                  <input
                    onChange={(e) => handleUpdateLeftSideText(item.leftSideId, e.target.value)}
                    style={{ borderColor: colorShades[index].dark }} className="h-[40px] focus:outline-none border border-[#EAECF0] rounded-[2px] py-[6px] px-[12px]"
                    value={selectedItem.options.leftSide.find((option) => option.id === item.leftSideId)?.text}
                  />
                  <input
                    onChange={(e) => handleUpdateRightSideText(item.rightSideId, e.target.value)}
                    style={{ borderColor: colorShades[index].dark }} className="h-[40px] focus:outline-none border border-[#EAECF0] rounded-[2px] py-[6px] px-[12px]"
                    value={selectedItem.options.rightSide.find((option) => option.id === item.rightSideId)?.text}
                  />
                  <div style={{ borderColor: colorShades[index].dark }} className="absolute inset-0 border-l-2 border-y-2 rounded-[10px] top-[15px] z-[-1] h-[60px] border-gray-800 -left-2" />
                </div>
                <button className="z-10 w-[24px]" onClick={() => handleRemovePairOption(item.leftSideId, item.rightSideId)}>
                  <img height={24} width={24} src="/assets/icons/delete.svg" alt="" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Numerical entry */}
      {selectedItem?.type === "NUMERICAL_ENTRY" && (
        <>
          <div className="flex flex-col gap-[8px]">
            <h1 className="text-[14px] font-medium text-[#272E35] text-left w-full">Answer <span className="text-[#7E8C9A] inline-block">(Number only)</span></h1>
            <input
              value={selectedItem?.answer.correctValue}
              onChange={(e) =>
                selectedItem && setSelectedItem({ ...selectedItem, answer: { ...selectedItem.answer, correctValue: Number(e.target.value) } })
              }
              type="number"
              placeholder="Answer"
              className="h-[40px] bg-transparent border border-[#CBD5E1] rounded-[4px] px-[12px]" />
          </div>

          <div className="flex flex-col gap-[8px]">
            <h1 className="text-[14px] font-medium text-[#272E35] text-left w-full">Error Tolerance <span className="text-[#7E8C9A] inline-block">(Number only)</span></h1>
            <input
              value={selectedItem?.answer.tolerance}
              onChange={(e) =>
                selectedItem && setSelectedItem({ ...selectedItem, answer: { ...selectedItem.answer, tolerance: Number(e.target.value) } })
              }
              type="number"
              placeholder="Answer"
              className="h-[40px] bg-transparent border border-[#CBD5E1] rounded-[4px] px-[12px]" />
          </div>

        </>
      )}

      {/* add option */}
      {(selectedItem?.type === "MULTIPLE_CHOICE" || selectedItem?.type === "MULTIPLE_SELECT" || selectedItem?.type === "ORDERING" || selectedItem?.type === "MATCHING") && selectedItem.options && (
        <button onClick={selectedItem.type === "MATCHING" ? handleAddPairOption : handleAddOption} className="w-full hover:bg-gray-100 flex flex-row gap-[8px] items-center justify-center h-[40px] py-[6px] border border-[#EAECF0] rounded-[2px]">
          <Plus size={24} />
          Add Option
        </button>
      )}

      {/* randomize options */}
      {(selectedItem?.type === "MULTIPLE_CHOICE" || selectedItem?.type === "MULTIPLE_SELECT" || selectedItem?.type === "ORDERING") && selectedItem.options && (
        <div className="flex flex-row items-center h-[32px] justify-between">
          <p>Randomize Options</p>
          <Switch onChange={handleRandomizeOptions} />
        </div>
      )}

      {/* partial credit toggle for multiple select*/}
      {(selectedItem?.type === "MULTIPLE_SELECT") && selectedItem.options && (
        <div className="flex flex-row items-center h-[32px] justify-between">
          <p>Allow Partial Credit</p>
          <Switch value={selectedItem.partialMark} onChange={handlePartialCredit} />
        </div>
      )}

      {errors.default && <p className="text-[#D32F2F] text-[12px]">{errors.default}</p>}

    </>
  );
}
