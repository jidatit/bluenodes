import { useState } from 'react'
import { TextInput } from 'flowbite-react';

const Loginpage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        fetch('https://api-dev.blue-nodes.app/dev/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email , password: password })
        })
        .then(response => response.json())
        .then(data => {
            const token = data.access_token;
            // Save the token (e.g., local storage)
            localStorage.setItem('token', token);
            console.log("success")
        })
        .catch(error => console.error('Error:', error));
    };

    return (
        <>
            <div className='min-h-screen flex flex-col justify-center items-center w-full'>

                <div className='w-[90%] relative md:w-[70%] bg-[#F1F1F1] pt-[30px] pb-[30px] rounded-[20px] flex flex-col justify-center items-center gap-5'>
                    <h2 className='text-center mt-[50px] font-bold lg:text-[30px] md:text-[25px] text-[20px]'>Login To Your Account</h2>
                    <div className='w-[90%] md:w-[60%] flex gap-2 flex-col justify-center items-center'>
                        <TextInput value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Email' className='w-full outline-none shadow-2xl' type='email' />
                        <TextInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Password' className='w-full outline-none shadow-2xl' type='password' />
                    </div>

                    <button onClick={handleLogin} className='w-[90%] md:w-[60%] py-3 rounded-[10px] bg-[#ffe001] text-lg font-semibold text-white'>
                        Login
                    </button>

                    {/* <Link to="/auth/signup">
                        <p className='text-center text-md font-light underline'>Want to Signup? Click Here</p>
                    </Link> */}

                </div>

            </div>
        </>
    )
}

export default Loginpage