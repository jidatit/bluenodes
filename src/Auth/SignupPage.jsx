import { useState } from 'react'
import { TextInput } from "flowbite-react";
import { FcGoogle } from "react-icons/fc";
import authImage from '../assets/images/auth-image.png'
import BlueNodeLogo from '../assets/logos/BlueNodes.png'

const Signuppage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <>
            <div className='w-full h-screen flex flex-row justify-center items-center'>

                <div className='w-[50%] h-full flex flex-col justify-center items-center gap-5 px-24 bg-[#F1F1F1]'>
                    <img src={BlueNodeLogo} alt="Blue Node Logo" className='w-[35%] h-auto' />
                    <h1 className='font-semibold text-4xl mt-3' > Sign up </h1>
                    <h3 className='text-lg text-gray-700' > Welcome! Please enter your details. </h3>
                    <div className='w-full flex gap-2 flex-col justify-start items-start'>
                        <label htmlFor="name" className='font-medium pl-2'> Name </label>
                        <TextInput value={name} id='name' onChange={(e) => setName(e.target.value)} placeholder='Enter your name' className='w-full outline-none shadow-2xl' type='text' />
                        <label htmlFor="email" className='font-medium pl-2'> Email </label>
                        <TextInput value={email} id='email' onChange={(e) => setEmail(e.target.value)} placeholder='Enter your email' className='w-full outline-none shadow-2xl' type='email' />
                        <label htmlFor="password" className='font-medium pl-2' > Password </label>
                        <TextInput value={password} id='password' onChange={(e) => setPassword(e.target.value)} placeholder='Enter your password' className='w-full outline-none shadow-2xl' type='password' />
                    </div>
                    <button className='w-full py-2 rounded-[10px] bg-[#0BAAC9] text-base font-semibold text-white'>
                        Get started
                    </button>
                    <button className='w-full flex flex-row justify-center items-center gap-2 py-2 rounded-[10px] bg-[white] border-2 border-[#0BAAC9] text-base font-medium text-black'>
                        <FcGoogle className='text-3xl' />
                        <p>Sign up with Google</p>
                    </button>
                    <div className='w-full flex flex-row justify-center items-start gap-1' >
                        <p className='text-base text-gray-700' > Already have an account? </p>
                        <h2 className='text-[#0DC8ED] text-base cursor-pointer font-semibold'> Login </h2>
                    </div>
                </div>

                <div className='w-[50%] h-full flex flex-col justify-center items-center overflow-hidden'>
                    <img
                        src={authImage}
                        alt="Signup Route Image"
                        className='w-full h-full object-cover'
                    />
                </div>

            </div>

        </>
    )
}

export default Signuppage;