import React, {useState} from 'react'
import AuthServices from '../services/auth'
import {Link ,useNavigate} from 'react-router-dom'
import {login} from '../features/authSlice'
import {Button, Input} from './index.js'
import {useDispatch,useSelector} from 'react-redux'
import {useForm} from 'react-hook-form'
import TestServices from '../services/resume'
import {setResume} from '../features/resumeSlice'


function Signup() {
    const navigate = useNavigate()
    const [error, setError] = useState("")
    const dispatch = useDispatch()
    const {register, handleSubmit} = useForm()
    const resumeData = useSelector((state) => state.resume.data);

    const create = async(data) => {
        setError("")
        try {
            console.log(data)
            const userData = await AuthServices.register(data)
            if (userData) {
                const userData = await AuthServices.getCurrentUser()
                if(userData) dispatch(login(userData));
                navigate("/")

                if(resumeData.length ) {
                    const resume = await TestServices.get_resume()
                    if (resume) {
                        dispatch(setResume(resume));
                    }
              }
            }
        } catch (error) {
            setError(error.message)
        }
    }

  return (
    <div className="flex items-center justify-center">
            <div className={`mx-auto w-full max-w-lg bg-gray-100 rounded-xl p-10 border border-black/10`}>
            <div className="mb-2 flex justify-center">
                    {/* <span className="inline-block w-full max-w-[100px]">
                        <Logo width="100%" />
                    </span> */}
                </div>
                <h2 className="text-center text-2xl font-bold leading-tight">Sign up to create account</h2>
                <p className="mt-2 text-center text-base text-black/60">
                    Already have an account?&nbsp;
                    <Link
                        to="/login"
                        className="font-medium text-primary transition-all duration-200 hover:underline"
                    >
                        Sign In
                    </Link>
                </p>
                {error && <p className="text-red-600 mt-8 text-center">{error}</p>}

                <form onSubmit={handleSubmit(create)}>
                    <div className='space-y-5'>
                        <Input
                        label="Username : "
                        placeholder="Enter your username"
                        {...register("username", {
                            required: true,
                        })}
                        />
                         <Input
                        label="full_name : "
                        placeholder="Enter your Full Name"
                        {...register("full_name", {
                            required: true,
                        })}
                        />

                        <Input
                        label="Email: "
                        placeholder="Enter your email"
                        type="email"
                        {...register("email", {
                            required: true,
                            validate: {
                                matchPatern: (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                                "Email address must be a valid address",
                            }
                        })}
                        />
                        <Input
                        label="Password: "
                        type="password"
                        placeholder="Enter your password"
                        {...register("password", {
                            required: true,})}
                        />
                        <Button type="submit" 
                       className="w-full hover:bg-blue-700  py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow-md"
                        >
                            Create Account
                        </Button>
                    </div>
                </form>
            </div>

    </div>
  )
}

export default Signup
