/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
// AccordionItem.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Ensure these imports are correct
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"; // Ensure these imports are correct
import { Button } from "@/components/ui/button";
import { GrPowerReset } from "react-icons/gr";
import { FiInfo } from "react-icons/fi";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";

const FormSchema = z.object({
  campus: z.string().nonempty("Campus is required."),
  program: z.string().nonempty("Program/Course is required."),
  session: z.string().nonempty("Academic session is required."),
  year: z.string().nonempty("Year of entry is required."),
  studyPreferences: z.string().nonempty("Study preferences are required."),
  route: z.string().nonempty("Route is required."),
});

interface AccordionItemProps {
  id: string;
  title: string;
  campus: string;
  program: string;
  session: string;
  year: string;
  studyPreferences: string;
  route: string;
}

export function AccordionItemComponent({
  id,
  title,
  campus,
  program,
  session,
  year,
  studyPreferences,
  route,
}: AccordionItemProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      campus,
      program,
      session,
      year,
      studyPreferences,
      route,
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log({
      title: "You submitted the following values:",
      description: (
        <pre className="p-4 mt-2 rounded-md w-[340px] bg-slate-950">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <Card className="mb-3">
      <AccordionItem value={id}>
        <AccordionTrigger className="p-4 font-semibold text-black">
          {title}
        </AccordionTrigger>
        <AccordionContent>
          <hr />
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-1 gap-6 p-4 w-full sm:grid-cols-2"
            >
              {/* Campus */}
              <FormField
                control={form.control}
                name="campus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campus</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a campus" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="London-Canary Wharf">
                          London-Canary Wharf
                        </SelectItem>
                        <SelectItem value="London-Brighton">
                          London-Brighton
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Program/Course */}
              <FormField
                control={form.control}
                name="program"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Program/Course</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a program" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Business & Management (CCCU)">
                          Business & Management (CCCU)
                        </SelectItem>
                        <SelectItem value="Computer Science (CCCU)">
                          Computer Science (CCCU)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Academic Session */}
              <FormField
                control={form.control}
                name="session"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Session</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select academic session" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="11/09/2024">11/09/2024</SelectItem>
                        <SelectItem value="12/09/2024">12/09/2024</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Year of Entry */}
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year of Entry</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year of entry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Foundation year">
                          Foundation year
                        </SelectItem>
                        <SelectItem value="Year 1">Year 1</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Study Preferences */}
              <FormField
                control={form.control}
                name="studyPreferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Study Preferences</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select study preferences" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Weekdays">Weekdays</SelectItem>
                        <SelectItem value="Weekends">Weekends</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Route */}
              <FormField
                control={form.control}
                name="route"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Route</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select route" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Work Experience">
                          Work Experience
                        </SelectItem>
                        <SelectItem value="Internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
            <div className="flex justify-between items-center p-4 mt-6">
              <div className="flex gap-2 items-center">
                <FiInfo size={20} color="#555F6D" />
                <p className="text-sm font-thin">
                  To modify campus, course, intake, year of entry or study
                  preferences, you will be required to reset course details.
                </p>
              </div>
              <Button
                variant="secondary"
                className="text-sm rounded-full shadow-md"
                onClick={() => form.reset()}
              >
                <GrPowerReset size={20} color="#0C456E" />
                <p>Reset</p>
              </Button>
            </div>
          </Form>
        </AccordionContent>
      </AccordionItem>
    </Card>
  );
}
