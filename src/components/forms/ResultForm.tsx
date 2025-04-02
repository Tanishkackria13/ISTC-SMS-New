"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  ResultSchema,
  resultSchema,
} from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import {
  createResult,
  updateResult,
} from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const ResultForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    unregister,
  } = useForm<ResultSchema>({
    resolver: zodResolver(resultSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createResult : updateResult,
    {
      success: false,
      error: false,
    }
  );

  const [hasSessionalExam, setHasSessionalExam] = useState(
    data?.sessionalExam !== undefined && data?.sessionalExam !== "-"
  );

  const router = useRouter();

  // ✅ Function to calculate grade based on overall marks
  const calculateGrade = (marks: number) => {
    if (marks >= 90) return "A+";
    if (marks >= 80) return "A";
    if (marks >= 70) return "B+";
    if (marks >= 60) return "B";
    if (marks >= 50) return "C+";
    if (marks >= 45) return "C";
    if (marks >= 40) return "D";
    return "E"; // Fail
  };

  // ✅ Auto-update grade when overall marks change
  useEffect(() => {
    const overallMarks = watch("overallMark");
    if (overallMarks !== undefined && overallMarks !== "") {
      setValue("grade", calculateGrade(Number(overallMarks)));
    }
  }, [watch("overallMark"), setValue]);

  useEffect(() => {
    if (!hasSessionalExam) {
      unregister("sessionalExam"); // Remove if unchecked
    } else {
      setValue("sessionalExam", data?.sessionalExam || ""); // Restore previous value if enabled
    }
  }, [hasSessionalExam, unregister, setValue, data]);

  const onSubmit = handleSubmit((formData) => {
    const finalData = {
      ...formData,
      sessionalExam: hasSessionalExam ? formData.sessionalExam : "-", // Always pass "-"
    };
    formAction(finalData);
  });

  useEffect(() => {
    if (state.success) {
      toast(`Result has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);
  useEffect(() => {
    if (data?.student) {
      setValue("studentId", data.student.id);
    }
  }, [data, setValue]);

  const { students, subjects, teachers } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      {data?.student && (
    <h2 className="text-lg font-bold text-gray-800">
      {data.student.name}
    </h2>
  )}

      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a result" : "Update the result"}
      </h1>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={hasSessionalExam}
          onChange={() => setHasSessionalExam(!hasSessionalExam)}
          className="w-4 h-4"
        />
        <label className="text-sm text-gray-600">Sessional Exam Exists</label>
      </div>

      <div className="flex justify-between flex-wrap gap-4">
        {/* Sessional Exam */}
        {hasSessionalExam && (
          <InputField
            label="Sessional Exam"
            name="sessionalExam"
            defaultValue={data?.sessionalExam || ""}
            register={register}
            error={errors.sessionalExam}
          />
        )}

        {/* End Term Exam */}
        <InputField
          label="End Term Exam"
          name="endTerm"
          defaultValue={data?.endTerm}
          register={register}
          error={errors.endTerm}
        />

        {/* Overall Marks */}
        <InputField
          label="Overall Marks"
          name="overallMark"
          defaultValue={data?.overallMark}
          register={register}
          error={errors.overallMark}
        />

        {/* Grade (Auto-filled) */}
        <InputField
          label="Grade"
          name="grade"
          defaultValue={data?.grade}
          register={register}
          error={errors.grade}
          disabled // Prevent user from manually entering
        />

        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}

        {/* Student Selection */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
  <label className="text-xs text-gray-500">Student</label>
  <select
    className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
    {...register("studentId")}
    defaultValue={data?.studentId} // Ensure pre-selected value
  >
    {students.map((student: { id: string; name: string }) => (
      <option value={student.id} key={student.id}>
        {student.name}
      </option>
    ))}
  </select>
  {errors.studentId?.message && (
    <p className="text-xs text-red-400">{errors.studentId.message.toString()}</p>
  )}
</div>


        {/* Subject Selection */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Subject</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("subjectId")}
            defaultValue={data?.subjectId}
          >
            {subjects.map((subject: { id: number; name: string }) => (
              <option value={subject.id} key={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {errors.subjectId?.message && (
            <p className="text-xs text-red-400">
              {errors.subjectId.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Teacher</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("teacherId")}
            defaultValue={data?.teacherId}
          >
            {teachers.map((teacher: { id: string; name: string }) => (
              <option value={teacher.id} key={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </select>
          {errors.teacherId?.message && (
            <p className="text-xs text-red-400">
              {errors.teacherId.message.toString()}
            </p>
          )}
        </div>
      </div>

      {state.error && <span className="text-red-500">Something went wrong!</span>}

      <button type="submit" className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default ResultForm;