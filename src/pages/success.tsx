import { stripe } from "@/lib/stripe";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Stripe from "stripe";
import { ImageContainer, ImagesContainer, SuccessContainer } from "../styles/pages/success";

interface SuccessProps{
    customerName:string;
    productsImage:string[];
}
 
export default function Success({ customerName, productsImage }:SuccessProps) {
  return (
    <>
        <Head>
            <title>Compra efetuada | Ignite Shop</title>
            <meta name="robots" content="noindex" />
        </Head>
        <SuccessContainer>
        <ImagesContainer>
            {productsImage.map((image, i) => (
            <ImageContainer key={i}>
                <Image src={image} width={120} height={110} alt="" />
            </ImageContainer>
            ))}
        </ImagesContainer>

        <h1>Compra Efetuada</h1>

        <p>
            Uhuul <strong>{customerName}</strong>, sua compra de {" "}
            {productsImage.length} camisetas já está a caminho da sua casa!
        </p>

        <Link href="/">
            Voltar ao catálogo
        </Link>
        </SuccessContainer>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({query, params}) => {
    if(!query.session_id)
    {
        return {
            redirect: {
                destination:'/',
                permanent:false,
            }
        }
    }

    const sessionId = String(query.session_id);


    const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items','line_items.data.price.product'],
    })

    const customerName = session.customer_details.name;
    const productsImage = session.line_items.data.map((item)=> {
        const product = item.price.product as Stripe.Product;
        return product.images[0];
    })

        return {
            props: {
                customerName,
                productsImage,
            }
        }
    }