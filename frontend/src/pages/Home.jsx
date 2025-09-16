import { useState, useEffect } from 'react';
import { ChevronRight, Star, Users, Award, ArrowRight, Sparkles } from 'lucide-react';
import GuideCard from '../components/GuideCard';
import PracticeButton from '../components/PracticeButton';

function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen">

      {/* Hero Section */}

<section className="relative px-6 pt-20 pb-32 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
  <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
  <div className="relative max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center gap-12">
    
    {/* Left Content: Text + Buttons */}
    <div className="text-center md:text-left flex-1">
      <div className="flex items-center justify-center md:justify-start mb-6">
        <Sparkles className="w-8 h-8 text-blue-500 mr-2" />
        <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
          AI-Powered Interview Practice
        </span>
      </div>

      <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
        Master Your Next
        <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Interview
        </span>
      </h1>

      <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-xl leading-relaxed">
        Personalized AI-driven practice and mock interviews to boost your confidence and skills.
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
        <PracticeButton 
          path="/test_setup" 
          description="Start Practice" 
        />
        <PracticeButton 
          path="/mock_setup" 
          description="Start Mock Interview" 
        />
      </div>
    </div>

    {/* Right Content: Hero Image */}
    <div className="flex-1">
      <img
        src="https://www.getmagicbox.com/wp-content/uploads/2023/05/2.jpg"
        alt="Interview Illustration"
        className="w-full rounded-2xl shadow-xl hover:scale-105 transform transition-all duration-500"
      />
    </div>
  </div>
</section>


      {/* How It Works Section */}
      <section className="py-24 px-6 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            Three simple steps to improve your interview readiness
          </p>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-40 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800"></div>

            <GuideCard 
              name="Upload Resume" 
              description="Securely upload your resume and let AI analyze your background to generate personalized questions." 
              index="1"
              image="https://cdn.pixabay.com/photo/2018/08/13/22/53/resume-3604240_1280.jpg"
            />
            <GuideCard 
              name="Practice Interviews" 
              description="Engage in realistic mock interviews with AI-generated questions tailored to your profile." 
              index="2"
              image="https://cdn.pixabay.com/photo/2015/07/17/22/43/student-849825_1280.jpg"
            />
            <GuideCard 
              name="Get Expert Feedback" 
              description="Receive detailed insights on your answers and areas for improvement." 
              index="3" 
              arrow={false}
              image="https://www.talentsapphire.com/uploads/1213/1694621053.jpg"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Why Choose InterviewBot?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
            Key features designed to maximize your interview preparation
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Star className="w-8 h-8" />, title: "AI-Powered Questions", description: "Dynamic questions based on your resume" },
              { icon: <Users className="w-8 h-8" />, title: "Real Interview Experience", description: "Practice in a realistic environment" },
              { icon: <Award className="w-8 h-8" />, title: "Detailed Analytics", description: "Track your progress and improvement" },
              { icon: <Sparkles className="w-8 h-8" />, title: "Instant Feedback", description: "Immediate insights on your answers" },
              { icon: <ChevronRight className="w-8 h-8" />, title: "Multiple Formats", description: "Technical, behavioral, and industry-specific interviews" },
              { icon: <ArrowRight className="w-8 h-8" />, title: "Career Guidance", description: "Personalized tips for your field" }
            ].map((feature, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
