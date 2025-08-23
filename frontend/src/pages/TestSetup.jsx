import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form' // Fixed import
import Input from '../components/Input'

function TestSetup() {
  const { register, handleSubmit } = useForm({ // Fixed destructuring
    defaultValues: {
      numQuestions: 5,
      difficulty: "easy"
    }
  })
  const navigate = useNavigate()

  const onSubmit = (data) => {
    // Convert numQuestions to number since form inputs return strings
    const formData = {
      numQuestions: parseInt(data.numQuestions, 10),
      difficulty: data.difficulty
    }
    navigate("/test", { state: formData })
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded-xl mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Setup Your Test</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Number of Questions"
          type="number"
          {...register("numQuestions", { 
            required: "Number of questions is required",
            min: { value: 1, message: "Minimum 1 question required" },
            max: { value: 50, message: "Maximum 50 questions allowed" }
          })}
          min="1"
          max="50"
          className="mt-1 w-full border p-2 rounded-lg"
        />

        {/* For select, use a regular select element or modify your Input component */}
        <div className="w-full">
          <label className="inline-block mb-1 pl-1 font-semibold">
            Difficulty Level
          </label>
          <select
            {...register("difficulty", { required: "Difficulty level is required" })}
            className="px-3 py-2 rounded-lg bg-white text-black outline-none focus:bg-gray-50 duration-200 border border-gray-200 w-full"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <button
          type="submit" // Changed to type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start Test
        </button>
      </form>
    </div>
  )
}

export default TestSetup