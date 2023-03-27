import { IProduct } from "@/components/contexts/CartContext"
import { useCart } from "@/hooks/useCart"
import { stripe } from "@/lib/stripe"
import axios from "axios"
import { GetStaticPaths, GetStaticProps } from "next"
import Head from "next/head"
import Image from "next/image"
import { useRouter } from "next/router"
import { useState } from "react"
import Stripe from "stripe"
import { ImageContainer, ProductContainer, ProductDetails } from "../../styles/pages/product"

interface ProductProps {
    product: IProduct;
  };

export default function Product({ product } : ProductProps) {
    const [isCreatingCheckoutSession, setIsCreatingCheckoutSession] = useState(false);
    const {isFallback } = useRouter()

    const { checkIfItemAlreadyExists, addToCart } = useCart();

    const itemAlreadyInCart = checkIfItemAlreadyExists(product.id);

  if(isFallback)
  {
    return <h1>Loading...</h1>
  }

  const title = `${product.name} | Ignite Shop`;
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
    <ProductContainer>
      <ImageContainer>
        <Image src={product.imageUrl} width={520} height={480} alt=""/>
      </ImageContainer>

      <ProductDetails>
        <h1>{product.name}</h1>
        <span>{product.price}</span>

        <p>{product.description}</p>

        <button disabled={itemAlreadyInCart} onClick={() => addToCart(product)}>
          {itemAlreadyInCart ? 
          "Produto já está no carrinho" :
          "Colocar na sacola"}
        </button>
      </ProductDetails>
    </ProductContainer>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: [
            { params: {id:'prod_NaIuVyvIorjgth'} }
        ],
        fallback: true,
    }
}

export const getStaticProps: GetStaticProps<any, { id: string }> = async ({ params }) => {
    const productId = params.id;

    const product = await stripe.products.retrieve(productId, {
        expand:['default_price']
    })

    const price = product.default_price as Stripe.Price;

    return {
        props:{
            product: {
                id: product.id,
                name: product.name,
                imageUrl: product.images[0],
                price: new Intl.NumberFormat('pt-BR', {
                    style:'currency',
                    currency:'BRL'
                }).format(price.unit_amount ? price.unit_amount/100 : 0),
                description: product.description,
                numberPrice: price.unit_amount / 100,
                defaultPriceId: price.id
            }
        },
        revalidate:60 * 60 * 1, // 1h
    }
}