import { useFormBuilderStore } from "../lib/useFormBuilderStore";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const LeftPanelItemMockup = ({ id, }: { id: string, }) => {
  const fields = useFormBuilderStore((state) => state.fields);
  const item = fields.find((el) => el.type === id);

  return (
    <div role="draggable" className={`w-full border border-[#CBD5E1] flex bg-white items-center justify-between py-[23px] pl-[48px] pr-[32px]`}>
      <div className="items-center gap-[24px] flex flex-row">
        {item?.icon}
        <div className="w-[180px]">
          <h2 className="text-[17px] font-semibold text-[#0F172A]">{item?.label}</h2>
          <p className="text-[12px] font-normal text-[#0F172A]">{item?.sublabel}</p>
        </div>
      </div>
      <img src="/assets/icons/grip-dotted-horizontal.svg" alt="" />
    </div>
  )
}

export const LeftPanelItem = ({ id, }: { id: string, }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: {
      panel: "left",
    },
  });
  const fields = useFormBuilderStore((state) => state.fields);
  const item = fields.find((el) => el.type === id);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
  };

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={style} role="draggable" className={`w-full border-r border-r-[#CBD5E1] border-b border-[#CBD5E1] flex items-center justify-between py-[23px] pl-[48px] pr-[32px]`}>
      <div className="items-center gap-[24px] flex flex-row">
        {item?.icon}
        <div className="w-[180px]">
          <h2 className="text-[17px] font-semibold text-[#0F172A]">{item?.label}</h2>
          <p className="text-[12px] font-normal text-[#0F172A]">{item?.sublabel}</p>
        </div>
      </div>
      <img src="/assets/icons/grip-dotted-horizontal.svg" alt="" />
    </div>
  )
}

const LeftPanel = () => {
  const assessment = useFormBuilderStore((state) => state.assessment);
  const fields = useFormBuilderStore((state) => state.fields).filter((el) => el.category === assessment?.assessmentCategory);
  return (
    <div className="w-[348px] sticky -top-[0px] flex flex-col h-[calc(100vh-5.5rem)]">
      <div className="bg-[#EFF6FF] py-[23px] w-[348px] h-[70px] flex items-center justify-center border-b border-[#CBD5E1]">
        <h1 className="w-[228px] text-lg font-bold text-[#233564]">Form Elements</h1>
      </div>
      <SortableContext items={fields.map((el) => el.type)} strategy={verticalListSortingStrategy} >
        <div className="w-[347px] h-full overflow-y-auto">
          {fields.map((el) => (
            <LeftPanelItem id={el.type} key={el.type} />
          ))}
        </div>
      </SortableContext>
    </div >
  );
};

export default LeftPanel;
