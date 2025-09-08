import { useForm } from "react-hook-form";
import Input from "../components/Input";
import { useNavigate } from "react-router-dom";

function MockSetUpPage() {
    
  const { register, handleSubmit } = useForm({
    defaultValues: {
      num_questions: 5,
      difficulty_level: "Medium",
      job_description: "Develops and maintains both front-end and back-end systems, ensuring seamless, scalable, and user-friendly applications.",
      interview_type: "Technical",
    },
  });
  const navigate = useNavigate();

  const onSubmit = (data) => {
    navigate("/mock", { state: data });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg space-y-4"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-4">⚙️ Test Setup</h1>

        <Input
          label="Number of Questions"
          type="number"
          {...register("num_questions", { valueAsNumber: true })}
        />

        <Input label="Difficulty Level" type="select" {...register("difficulty_level")}>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </Input>

        <Input
          label="Job description / Role"
          type="text"
          placeholder="copy the and paste the job description here"
          {...register("job_description")}
        />

        <Input label="Interview Type" type="select" {...register("interview_type")}>
          <option value="Technical">Technical</option>
          <option value="Behavioral">Behavioral</option>
          <option value="Case Study">Case Study</option>
          <option value="Coding">Coding</option>
          <option value="Apttitude">Aptitude</option>
          <option value="Reasoning">Reasoning</option>
        
        </Input>


        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Start Interview 🚀
        </button>
      </form>
    </div>
  );
}

export default MockSetUpPage;
