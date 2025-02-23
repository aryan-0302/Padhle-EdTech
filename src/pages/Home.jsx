import React, { act } from 'react'
import { FaArrowRightLong } from "react-icons/fa6";
import { Link } from 'react-router-dom';
import HighlightText from '../components/core/Homepage/HighlightText.jsx';
import CTAButton from '../components/core/Homepage/Button';
// import Banner from "../assets/images/banner.mp4"
import CodeBlocks from '../components/core/Homepage/CodeBlocks';
import { FaArrowRight } from 'react-icons/fa6';
import TimelineSection from '../components/core/Homepage/TimelineSection.jsx';
import LearningLanguageSection from '../components/core/Homepage/LearningLanguageSection.jsx';
// import InstructorSection from "../components/core/Homepage/InstructorSection.jsx"
import Footer from "../components/core/Homepage/common/Footer.jsx"
import ExploreMore from "../components/core/Homepage/ExploreMore.jsx"
import homepic from "../assets/images/homepic.webp"
import { FaRobot } from "react-icons/fa6";
import { FaTimes } from "react-icons/fa";
import Chatbot from "../components/Chatbot"; // Import chatbot component
import { useState } from 'react';

function Home() {
  const [showChatbot, setShowChatbot] = useState(false);

  return (
    <div>
      
    {/* Section-1 */}
    <div className='relative mx-auto flex flex-col w-11/12 items-center text-white justify-between max-w-maxContent'>
      <Link to={"/signup"}>
      <div className='group mt-16 p-1 mx-auto rounded-full bg-richblack-800 font-bold text-richblack-200 transition-all duration-200 hover:scale-95 w-fit'>
        <div className='flex flex-row items-center gap-2 rounded-full px-10 py-[5px] transition-all duration-200 group-hover:bg-richblack-900'>
          <p>Become an Instructor</p>
          <FaArrowRightLong/>
        </div>
      </div>
      </Link>

      <div className='flex flex-row gap-7 mt-8'>
        <CTAButton active={true} linkto={"/signup"}>
          Learn More
        </CTAButton>

        <CTAButton active={false} linkto={"/login"}>
          Book a Demo
        </CTAButton>
      </div>



      <div className='relative mx-3 my-12 w-[50%]'>
  <div className='grad2 -top-10 w-[600px]'></div>
  <div className="shadow-[0_10px_30px_rgba(59,130,246,0.6)]">
    <img src={homepic} className='shadow-white object-cover h-[300px] w-auto'></img>
  </div>
</div>





    {/* code-section-1 */}
      <div>
        <CodeBlocks
        position={"lg:flex-row"}
        heading={
          <div className='text-4xl font-semibold'>
            Unlock Your
            <HighlightText text={" coding potential "}></HighlightText>
            with our online courses
          </div>
        }

        subheading={
          "Our courses are designed and taught by industry experts who have years of experience in coding and passionate about sharing their knowledge with you. "
        }

        ctabtn1={
          {
            btnText:"try it yourself",
            linkto:"/signup",
            active:true,
          }
        }

        ctabtn2={
          {
            btnText:"learn more",
            linkto:"/login",
            active:false,
          }
        }

        codeblock={`<<!DOCTYPE html>\n<html>\n<head><title>Example</title>\n</head>\n<body>\n<h1><ahref="/">Header</a>\n</h1>\n<nav><ahref="one/">One</a><ahref="two/">Two</a><ahref="three/">Three</a>\n</nav>`}       
        codecolor={"text-yellow-25"}   
         ></CodeBlocks>
      </div>



      {/* code-section-2 */}
      <div>
        <CodeBlocks
        position={"lg:flex-row-reverse"}
        heading={
          <div className='text-4xl font-semibold'>
            Start
            <HighlightText text={" coding in seconds "}></HighlightText>
          </div>
        }

        subheading={
          "Our courses are designed and taught by industry experts who have years of experience in coding and passionate about sharing their knowledge with you. "
        }

        ctabtn1={
          {
            btnText:"try it yourself",
            linkto:"/signup",
            active:true,
          }
        }

        ctabtn2={
          {
            btnText:"learn more",
            linkto:"/login",
            active:false,
          }
        }

        codeblock={`import React from "react";\n import CTAButton from "./Button";\n import TypeAnimation from "react-type"\n import {FaArrowRight} from  "react-icons/fa"; \n \n const Home=()=>{\n return (\n <div>Home</div>\n)\n}\n export default Home;\n `}        
        codecolor={"text-blue-25"}
        backgroundgradient={{
          backgroundImage: "linear-gradient(to right, #34d399, #3b82f6)",
          padding: "1rem",
          borderRadius: "0.5rem",
        }}
        ></CodeBlocks>
      </div>

      <ExploreMore></ExploreMore>
    </div>








    {/* Section-2 */}
<div className='bg-pure-greys-5 text-richblack-700'>
<div className='homepage_bg h-[310px]'>

<div className='w-11/12 max-w-maxContent flex flex-col items-center justify-between gap-5 mx-auto'>
    <div className='h-[150px]'></div>
    <div className='flex flex-row gap-7 text-white '>
        <CTAButton active={true} linkto={"/catalog/Web Developement"}>
            <div className='flex items-center gap-3'>
                Explore Full Catalog
                <FaArrowRight />
            </div>
        </CTAButton>
        <CTAButton active={false} linkto={"/signup"}>
            <div>
                Learn more
            </div>
        </CTAButton>
    </div>
</div>
</div>



      <div className='mx-auto w-11/12 max-w-maxContent flex flex-col items-center justify-between gap-7'>
      
      <div className='flex flex-row gap-5'>
        <div className='text-4xl font-semibold w-[45%]'>
          Give the Skills you need for a
          <HighlightText text={" Job that is in demand"}></HighlightText>
        </div>

        <div className='flex flex-col gap-10 w-[40%] items-start'>
                    <div className='text-[16px]'>
                    The modern Padhle is the dictates its own terms. Today, to be a competitive specialist requires more than professional skills.
                    </div>
                    <CTAButton active={true} linkto={"/signup"}>
                        <div>
                            Learn more
                        </div>
                    </CTAButton>
                    </div>
                    </div>

                    <TimelineSection></TimelineSection>
                    <LearningLanguageSection></LearningLanguageSection>
          </div>
    </div>






 {/* AI Assistant Button - Fixed at Bottom Right */}
 <div className="fixed bottom-20 right-20 z-50">
        <button
          onClick={() => setShowChatbot(!showChatbot)}
          className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition-all"
        >
          {showChatbot ? <FaTimes size={25} /> : <FaRobot size={40} />}
        </button>
      </div>

      {/* Chatbot UI (Opens when clicked) */}
      {showChatbot && (
        <div className="fixed bottom-32 right-20 bg-white shadow-lg border border-gray-300 rounded-lg w-80 h-[700px] p-4">
          <Chatbot setShowChatbot={setShowChatbot} />
        </div>
      )}




    {/* Footer */}
    <Footer></Footer>
    </div>
  )
}

export default Home


// 1.Agar group ki property lagani hia to parent ko group banao aur child pe property lagao:yaha necessary nhi tha.