import React from 'react'
import Image from 'next/image'

const page = () => {
    return (
        <div className="max-w-[1536px] mx-auto px-5 sm:px-10 xl:px-20 pt-8">
            <div className='space-y-2'>
                <h1 className='text-xl font-semibold text-admin-primary'>Build Your Own Merch</h1>
                <p className='text-sm'>Design your own merch that reflects your story and beliefs. Add your favorite verse, phrase, or artwork — and make it yours</p>
            </div>

            <main className='bg-admin-primary/4 h-[70vh] flex items-center justify-center mt-5 rounded-lg'>
                <div className='text-center mx-auto flex flex-col justify-center items-center gap-3'>
                    <Image
                        src="/assets/coming-soon.png"
                        alt='coming soon'
                        width={150}
                        height={150}
                    ></Image>
                    <h2 className='text-xl font-semibold text-admin-primary text-center'>Coming soon</h2>
                    <p>BYOM is getting an update. We’re making improvements and <br className='hidden sm:flex' /> things will be changing. Please check back soon</p>
                </div>
            </main>
        </div>
    )
}

export default page