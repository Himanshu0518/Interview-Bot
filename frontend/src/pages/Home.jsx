import GuideCard from '../components/GuideCard'
import PracticeButton from '../components/PracticeButton'
function Home() {
  return (
    <div className="p-4">

           <div className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How InterviewBot Works</h2>
            <p className="text-xl text-gray-600">Three simple steps to better interview preparation</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
          
            <GuideCard name = "UploadResume" description = "Login/Signup and then upload your resume if not done already or if you want to change your resume." index = "1"/>
            <GuideCard name = "Practice Interviews" description = "Answer personalized questions generated specifically for your background and target roles" index = "2"/>
            <GuideCard name = "Get Feedback" description = "Receive detailed feedback and improvement suggestions to enhance your interview performance" index = "3" arrow={false}/>
          </div>
        </div>
      </div>

         <div className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-gray-900">Ready to Boost Your Interview Confidence?</h2>
          <p className="text-xl text-gray-600 mb-10">
            Start practicing now and increase your chances of landing your dream job
          </p>
           <PracticeButton path={"/test_setup"}/>
           <div className="mt-4">
             <PracticeButton description={"Start Your Mock Interview"} path={"/mock_setup"}/>
           </div>
          
        </div>
      </div>
  
        
    </div>
  )
}

export default Home
