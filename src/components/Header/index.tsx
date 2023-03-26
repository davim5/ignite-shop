import Image from "next/image";
import { HeaderContainer } from "./styles";
import logoImg from "../../assets/logo.svg";
import Link from "next/link";
import Cart from "../Cart";
export default function Header()
{
    return (
        <HeaderContainer>
            <Link href='/' legacyBehavior>
                <a>
                    <Image src={logoImg} alt="" />
                </a>
            </Link>
            <Cart/>
        </HeaderContainer>
    )
};