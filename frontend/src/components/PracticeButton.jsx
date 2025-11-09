import { Brain, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useSelector } from "react-redux";

function PracticeButton({ description, path }) {
  const navigate = useNavigate();

  const authStatus = useSelector((state) => state.auth.status);
  const resumeStatus = useSelector((state) => state.resume.status);

  const handleClick = () => {
    if (!authStatus) {
      navigate("/login");
    } else if (resumeStatus != "succeeded") {
      navigate("/upload_resume");
    } else {
      navigate(path);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold text-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3 mx-auto"
      >
        <Brain className="w-6 h-6" />
        {description ? description : "Start Practice"}
        <ArrowRight className="w-6 h-6" />
      </button>
    </>
  );
}

export default PracticeButton;
