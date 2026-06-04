/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { useAuths } from "@/hooks/userContext";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import toast from "react-hot-toast";
import { Switch } from "@/components/ui/custom_ui/switch";

interface FormType {
  id: string;
  resetSignal?: number;
  onPermissionsChange?: (data: {
    mainSwitch: boolean;
    courseSwitches: Record<string, boolean>;
    permissions: Record<
      string,
      { create: boolean; edit: boolean; reorder: boolean }
    >;
  }) => void;
  onPayloadChange?: (payload: any) => void;
}

interface CourseModuleNames {
  courseModuleId: string;
  modulesName: string;
}
interface Course {
  courseId: string;
  courseName: string;
  facultyRole: string;
  courseModuleNames: CourseModuleNames[];
}

const permissionMap: Record<string, string> = {
  create: "POST",
  edit: "POST",
  reorder: "RE-ORDER",
};

const Faculty_Form_field = ({
  id,
  resetSignal,
  onPermissionsChange,
  onPayloadChange,
}: FormType) => {
  const user = useAuths();
  const token = user?.user?.token;
  const [courses, setCourses] = useState<Course[]>([]);
  const [mainSwitch, setMainSwitch] = useState(false);
  const [courseSwitches, setCourseSwitches] = useState<Record<string, boolean>>({});
  
  // 🔧 CHANGED: Use composite key: courseId + moduleName
  const [permissions, setPermissions] = useState<
    Record<string, { create: boolean; edit: boolean; reorder: boolean }>
  >({});
  
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/faculty-management/course-modules-list/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          toast.error("Faculty not assigned to courses or modules. Please assign them before managing permissions.");
          setHasError(true);
          return;
        }

        setCourses(data?.data || []);

        const initialSwitches: Record<string, boolean> = {};
        const initialPermissions: Record<string, { create: boolean; edit: boolean; reorder: boolean }> = {};

        (data?.data || []).forEach((course: Course) => {
          initialSwitches[course.courseId] = false;
          course.courseModuleNames.forEach((module) => {
            const key = `${course.courseId}_${module.modulesName}`;
            initialPermissions[key] = { create: false, edit: false, reorder: false };
          });
        });

        setCourseSwitches(initialSwitches);
        setPermissions(initialPermissions);
        setMainSwitch(false);
      } catch (error) {
        toast.error("Failed to load course modules");
        setHasError(true);
      }
    };

    fetchModules();
  }, [id, token, resetSignal]);

  useEffect(() => {
    if (onPermissionsChange) {
      onPermissionsChange({ mainSwitch, courseSwitches, permissions });
    }
    generatePayload();
  }, [mainSwitch, courseSwitches, permissions]);

  const generatePayload = () => {
    const result = {
      coursePermissions: mainSwitch,
      courseModule: [] as any[],
      assessmentPermissions: true,
      studentMessagingAccess: false,
    };

    courses.forEach((course) => {
      const courseObj: any = {
        courseName: course.courseName,
        roleName: course.facultyRole,
        modules: [],
      };

      course.courseModuleNames.forEach((module) => {
        const key = `${course.courseId}_${module.modulesName}`; // 🔧 CHANGED
        const modulePerms = permissions[key];

        const hasAnyPermission =
          modulePerms?.create || modulePerms?.edit || modulePerms?.reorder;

        if (hasAnyPermission) {
          const modulePermission: string[] = ["GET"];
          if (modulePerms.create) modulePermission.push(permissionMap.create);
          if (modulePerms.edit) modulePermission.push(permissionMap.edit);
          if (modulePerms.reorder) modulePermission.push(permissionMap.reorder);

          courseObj.modules.push({
            moduleName: module.modulesName,
            modulePermission,
          });
        }
      });

      if (courseObj.modules.length > 0) {
        result.courseModule.push(courseObj);
      }
    });

    if (onPayloadChange) {
      onPayloadChange(result);
    }
  };

  const onMainSwitchToggle = (checked: boolean) => {
    setMainSwitch(checked);

    const newCourseSwitches = { ...courseSwitches };
    const newPermissions = { ...permissions };

    courses.forEach((course) => {
      newCourseSwitches[course.courseId] = checked;
      course.courseModuleNames.forEach((module) => {
        const key = `${course.courseId}_${module.modulesName}`; // 🔧 CHANGED
        newPermissions[key] = { create: checked, edit: checked, reorder: checked };
      });
    });

    setCourseSwitches(newCourseSwitches);
    setPermissions(newPermissions);
  };

  const onCourseSwitchToggle = (
    courseId: string,
    _courseName: string,
    checked: boolean
  ) => {
    setCourseSwitches((prev) => ({ ...prev, [courseId]: checked }));

    const updatedPermissions = { ...permissions };
    const course = courses.find((c) => c.courseId === courseId);
    if (!course) return;

    course.courseModuleNames.forEach((module) => {
      const key = `${courseId}_${module.modulesName}`; // 🔧 CHANGED
      updatedPermissions[key] = { create: checked, edit: checked, reorder: checked };
    });

    setPermissions(updatedPermissions);

    const newCourseSwitches = { ...courseSwitches, [courseId]: checked };
    const allCoursesOn = Object.values(newCourseSwitches).every((v) => v);
    setMainSwitch(allCoursesOn);
  };

  const onPermissionToggle = (
    courseId: string,
    moduleName: string,
    permission: keyof (typeof permissions)[string],
    checked: boolean
  ) => {
    const key = `${courseId}_${moduleName}`;

    const updated = {
      ...permissions[key],
      [permission]: checked,
    };
  
    setPermissions((prev) => {
      const newPermissions = {
        ...prev,
        [key]: updated,
      };
  
      const course = courses.find((c) => c.courseId === courseId);
      if (!course) return newPermissions;
  
      let allPermissionsChecked = true;
  
      for (const mod of course.courseModuleNames) {
        const modKey = `${courseId}_${mod.modulesName}`;
        const perms = newPermissions[modKey];
        if (!perms || Object.values(perms).some((val) => !val)) {
          allPermissionsChecked = false;
          break;
        }
      }
      // for (const module of course.courseModuleNames) {
      //   const modKey = `${courseId}_${module.modulesName}`;
      //   const perms = newPermissions[modKey];
      //   if (!perms || Object.values(perms).some((val) => !val)) {
      //     allPermissionsChecked = false;
      //     break;
      //   }
      // }

      setCourseSwitches((prevSwitches) => ({
        ...prevSwitches,
        [courseId]: allPermissionsChecked,
      }));
  
      // Update main switch if all courses are on
      const newCourseSwitches = {
        ...courseSwitches,
        [courseId]: allPermissionsChecked,
      };
      const allCoursesOn = Object.values(newCourseSwitches).every((v) => v);
      setMainSwitch(allCoursesOn);
  
      return newPermissions;
    });
  };
  return (
    <div className="flex flex-col gap-4 mt-8">
      <Card>
        <CardContent>
          <div className="flex justify-between items-center mt-4">
            <p className="text-base font-semibold">Course Material Management</p>
            <Switch
              checked={mainSwitch}
              onCheckedChange={onMainSwitchToggle}
              disabled={hasError}
            />
          </div>

          {courses.map((course) => (
            <Accordion
              key={course.courseId}
              type="single"
              collapsible
              className="mt-2 w-full rounded-xl border border-[#E2E8F0]"
            >
              <AccordionItem value={`course-${course.courseId}`}>
                <AccordionTrigger hideIcon className="p-4">
                  <div className="flex justify-between items-center w-full">
                    <div>
                      <p className="text-base font-medium text-[#272E35]">
                        {course.courseName}
                      </p>
                    </div>
                    <Switch
                      checked={courseSwitches[course.courseId] || false}
                      onCheckedChange={(checked) =>
                        onCourseSwitchToggle(course.courseId, course.courseName, checked)
                      }
                    />
                  </div>
                </AccordionTrigger>

                <AccordionContent className="p-4 space-y-2">
                  {course.courseModuleNames.map((module) => (
                    <div
                      key={module.courseModuleId}
                      className="border p-3 rounded-md bg-muted/30"
                    >
                      <p className="text-sm font-semibold mb-2">
                        {module.modulesName}
                      </p>
                      <div className="flex gap-4 flex-wrap">
                        {["create", "edit", "reorder"].map((perm) => (
                          <div key={perm} className="flex items-center gap-2">
                            <Checkbox
                              checked={
                                permissions[`${course.courseId}_${module.modulesName}`]?.[
                                  perm as keyof (typeof permissions)[string]
                                ] || false
                              }
                              onCheckedChange={(checked) =>
                                onPermissionToggle(
                                  course.courseId,
                                  module.modulesName,
                                  perm as keyof (typeof permissions)[string],
                                  !!checked
                                )
                              }
                            />
                            <p className="text-base text-[#272E35]">
                              {perm.charAt(0).toUpperCase() + perm.slice(1)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="flex justify-between items-center mt-4">
            <p className="text-base font-semibold">Assessment Grading</p>
            <Switch disabled />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="flex justify-between items-center mt-4">
            <p className="text-base font-semibold">Student Messaging Access</p>
            <Switch disabled />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Faculty_Form_field;