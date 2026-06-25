import Image from "next/image"
import logo from "../images/logo.png"


export function Logo(props) {
  return <Image height={100} width={100} src={logo} alt="logo"/>
}
