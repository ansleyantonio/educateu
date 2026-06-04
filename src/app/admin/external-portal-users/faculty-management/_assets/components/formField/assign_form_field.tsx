/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import ActionButton from "@/components/common/button/actionButton";
import { CustomField } from "@/components/common/fields/cusInputField";
import DataFetcher from "@/hooks/fetchDataCollection/hooksExport";
import { Plus, Trash } from "lucide-react";
import { useState } from "react";
import { useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";

interface FormType {
  id: string;
  form: any;
  viewOnly?: boolean;
}
interface OptionType {
  label: string;
  value: string;
}

interface Course {
  courseId: string;
  courseTitle: string;
}

interface Module {
  id: string;
  title: string;
}

interface SessionType {
  id?: string;
  sessionId?: string;
  name?: string;
  sessionName?: string;
}
interface CourseApiResponse {
  courseId: string;
  courseTitle: string;
  modules: Module[];
}

const Assign_Form_field = ({ form, id }: FormType) => {
  const [sessionId, setSessionId] = useState<any>();
  const [courseId, setCourseId] = useState<any>();
  const [searchTerms, setSearchTerms] = useState({
    session: "",
    course: "",
    module: "",
  });
  // select session
  const { options: sessionOptions } = DataFetcher.fetchAcademicSessions({
    filter: {
      search: searchTerms.session,
      status: ["UPCOMING", "ACTIVE", "TEMPORARILY_ACTIVE"],
      pageSize: 10,
    },
  });
  // select course
  const { options: courseOptions } = DataFetcher.fetchCoursesBySessionId({
    sessionId: sessionId,
    filter: {
      searchTerm: searchTerms.course,
      pageSize: 10,
    },
    enabled: !!sessionId || !!searchTerms.course,
  });
  // select module
  const { options: moduleOptions } = DataFetcher.fetchModulesByCourseId({
    courseId: courseId,
    filter: {
      searchTerm: searchTerms.module,
    },
    enabled: !!courseId || !!searchTerms.module,

  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "courseAssign",
  });

  const handleCourseChange = (index: number, courseId?: string) => {
    form.setValue(`courseAssign.${index}.module`, []);
    setCourseId(courseId);
  };
  const handleSessionChange = (index: number, sessionId?: string) => {
    form.setValue(`courseAssign.${index}.course`, []);
    setSessionId(sessionId);
  };

  const addNewRow = async () => {
    const lastIndex = fields.length - 1;

    const isValid = await form.trigger(`courseAssign.${lastIndex}`);

    if (!isValid) {
      toast.error(
        "Please complete the current assignment before adding a new one."
      );
      return;
    }

    append({
      id: id,
      course: "",
      module: [],
      role: "",
    });
  };

  console.log(courseOptions, "courseOptions");

  return (
    <div className="space-y-6">
      {/* Fixed Headings */}
      <div className="hidden md:grid grid-cols-12 gap-4 items-center font-medium text-sm text-gray-700">
        <div className="col-span-3">Session</div>
        <div className="col-span-3">Course</div>
        <div className="col-span-3">Module</div>
        <div className="col-span-2">Role</div>
        <div className="col-span-1">Action</div>
      </div>
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="p-4 border flex gap-3 rounded-lg space-y-4 md:space-y-0 relative"
        >
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 items-top">
            {/* Course */}
            <div className="md:col-span-3">
              <CustomField.SelectField
                form={form}
                name={`courseAssign.${index}.session`}
                placeholder="Select Session *"
                optional={false}
                options={sessionOptions}
                onSearch={(value) =>
                  setSearchTerms((prev) => ({ ...prev, session: value }))
                }
                onValueChange={(value: string) =>
                  handleSessionChange(index, value)
                }
              />
            </div>
            <div className="md:col-span-3">
              <CustomField.SelectField
                form={form}
                name={`courseAssign.${index}.course`}
                placeholder="Select Course *"
                optional={false}
                onSearch={(value) =>
                  setSearchTerms((prev) => ({ ...prev, course: value }))
                }
                options={courseOptions}
                onValueChange={(value: string) =>
                  handleCourseChange(index, value)
                }
              />
            </div>

            {/* Module */}
            <div className="md:col-span-3">
              <CustomField.SelectField
                form={form}
                name={`courseAssign.${index}.module`}
                placeholder="Select Module *"
                onSearch={(value) =>
                  setSearchTerms((prev) => ({ ...prev, module: value }))
                }
                options={moduleOptions}
                type="multiple"
              />
            </div>

            {/* Role */}
            <div className="md:col-span-3">
              <CustomField.SelectField
                form={form}
                name={`courseAssign.${index}.role`}
                placeholder="Select Role *"
                optional={false}
                options={[
                  { value: "TEACHER", label: "Teacher" },
                  { value: "TEACHING_ASSISTANT", label: "Teacher Assistant" },
                  { value: "GUEST_TEACHER", label: "Guest" },
                ]}
              />
            </div>
          </div>
          {/* Delete Button */}
          <div className="md:col-span-1 flex justify-end md:justify-center">
            <ActionButton
              icon={<Trash className="h-2 w-2 text-red-500" />}
              type="button"
              variant="icon"
              handleOpen={() => remove(index)}
              disabled={index <= 0 && index >= fields.length - 1}
            />
          </div>
        </div>
      ))}

      <ActionButton
        icon={<Plus className="h-4 w-3" />}
        type="button"
        handleOpen={addNewRow}
      />
    </div>
  );
};

export default Assign_Form_field;
