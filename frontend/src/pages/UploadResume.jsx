import React from "react";
import Input from "../components/Input";
import { useDispatch, useSelector } from "react-redux";
import TestServices from "../services/resume";
import { useForm } from "react-hook-form";
import { setResume } from "../features/resumeSlice";

function UploadResume() {
  const { register, handleSubmit, reset } = useForm();
  const dispatch = useDispatch();
  const [error, setError] = React.useState(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [successMessage, setSuccessMessage] = React.useState("");
  
  // Get resume data from Redux store
  const resumeData = useSelector((state) => state.resume?.data);
  
  // Fetch resume data on component mount
React.useEffect(() => {
  const fetchResumeData = async () => {
    setIsLoading(true);
    try {
      const resume = await TestServices.get_resume();
      console.log("Fetched resume data:", resume);

      if (resume) {
        dispatch(setResume(resume));
      } else {
        console.warn("No resume data found.");
      }
    } catch (error) {
      console.error("Error fetching resume:", error);
    } finally {
      setIsLoading(false); 
    }
  };

  fetchResumeData();
}, [dispatch]);


  const uploadResume = async (file) => {
    setError(null);
    setSuccessMessage("");
    setIsUploading(true);
    
    try {
      const response = await TestServices.upload_resume(file.file[0]);
      if (response) {
        dispatch(setResume(response)); // store data
        setSuccessMessage("Resume uploaded successfully!");
        reset(); // Clear the form
      }
      console.log("Uploaded resume:", response);
    } catch (err) {
      console.error(err);
      setError("Failed to upload resume. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };
  const renderEducation = (education) => {
    if (!education || education.length === 0) return null;
    
    return education.map((edu, index) => {
      // Handle different possible data structures
     
      
      return (
        <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-3">
      <h3 className="dark:text-gray-200">{edu}</h3>
        </div>
      );
    });
  };

  const renderProjects = (projects) => {
    if (!projects || projects.length === 0) return null;
    
    return projects.map((project, index) => (
      <div key={index} className="p-4 rounded-lg mb-3">
        <h4 className="font-semibold text-gray-800 dark:text-gray-100">{project.name || "Project Name"}</h4>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{project.description || "No description available"}</p>
        {project.technology && (
          <div className="flex flex-wrap gap-2">
            {project.technology.split(',').map((tech, techIndex) => (
              <span key={techIndex} className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
                {tech.trim()}
              </span>
            ))}
          </div>
        )}
      </div>
    ));
  };

  const renderSkills = (skills) => {
    if (!skills || skills.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span key={index} className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm">
            {skill}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full py-2 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto dark:text-gray-100 py-12 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">Resume Manager</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Upload your resume to get personalized interview questions and feedback, 
          or view your previously uploaded resume details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Upload Resume</h2>
          </div>

          <form onSubmit={handleSubmit(uploadResume)} className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
              <Input
                label="Choose Resume File"
                placeholder="Select your resume file"
                type="file"
                accept=".pdf,.doc,.docx"
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300 dark:hover:file:bg-blue-800"
                {...register("file", { required: true })}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Supported formats: PDF, DOC, DOCX (Max size: 10MB)
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-green-700 dark:text-green-300">{successMessage}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isUploading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isUploading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </div>
              ) : (
                "Upload Resume"
              )}
            </button>
          </form>
        </div>

        {/* Resume Display Section */}
        <div className="rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-6">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full mr-4">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Your Resume</h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-300">Loading resume...</span>
            </div>
          ) : resumeData ? (
            <div className="space-y-6 max-h-96 overflow-y-auto">
              {/* Personal Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{resumeData.fname || "User"}</h3>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  {resumeData.email && <p>📧 {resumeData.email}</p>}
                  {resumeData.linkedin_url && (
                    <p>💼 <a href={resumeData.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">LinkedIn Profile</a></p>
                  )}
                  {resumeData.github_url && (
                    <p>🔗 <a href={resumeData.github_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">GitHub Profile</a></p>
                  )}
                </div>
              </div>

              {/* Skills */}
              {resumeData.skills && resumeData.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center">
                    <span className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full mr-2">⚡</span>
                    Skills
                  </h3>
                  {renderSkills(resumeData.skills)}
                </div>
              )}

              {/* Education */}
              {resumeData.education && resumeData.education.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center">
                    <span className="p-2 rounded-full mr-2">🎓</span>
                    Education
                  </h3>
                  {renderEducation(resumeData.education)}
                </div>
              )}

              {/* Projects */}
              {resumeData.projects && resumeData.projects.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center">
                    <span className="p-2 rounded-full mr-2">🚀</span>
                    Projects
                  </h3>
                  {renderProjects(resumeData.projects)}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">No Resume Found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Upload your resume to see your profile information and get personalized interview questions.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
          <div className="rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">AI-Powered Questions</h3>
          <p className="text-gray-600 dark:text-gray-300">Get personalized interview questions based on your resume content</p>
        </div>
        
        <div className="text-center p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
          <div className="rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Performance Analytics</h3>
          <p className="text-gray-600 dark:text-gray-300">Track your interview performance and get detailed feedback</p>
        </div>
        
        <div className="text-center p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
          <div className="rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-600 dark:text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Skill Improvement</h3>
          <p className="text-gray-600 dark:text-gray-300">Identify areas for improvement and enhance your interview skills</p>
        </div>
      </div>
    </div>
    </div>
  );
}

export default UploadResume;