import signupImg from "../assets/images/signup.webp"
import Template from "../components/core/Auth/Template"
import { useSelector } from "react-redux";

function Signup() {
  const {loading} = useSelector((state)=>state.auth);
  return (
    loading?(<div className=" h-[100vh] flex justify-center items-center"><div class="custom-loader"></div></div>):(
    <Template
      title="Join to learn, grow, and achieve your goals with us for free!"
      description1="Build skills for today, tomorrow, and Future."
      description2="Education to future-proof your career."
      image={signupImg}
      formType="signup"
    />
    )
  )
}

export default Signup