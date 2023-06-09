import { HomeContainer, Product } from "@/styles/pages/home";
import CartButton from '../components/CartButton'
import { GetStaticProps } from "next";
import Head from 'next/head';
import 'keen-slider/keen-slider.min.css';
import Image from "next/image";
import { useKeenSlider } from 'keen-slider/react';
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { IProduct } from "@/components/contexts/CartContext";
import { MouseEvent } from "react";

interface HomeProps {
  products: IProduct[]
};

export default function Home({ products }:HomeProps) {
  const [sliderRef] = useKeenSlider({
    slides:{
      perView: 3,
      spacing: 48,
    }
  })

  const { addToCart, checkIfItemAlreadyExists } = useCart();

  function handleAddToCart(e: MouseEvent<HTMLButtonElement>, product: IProduct)
  {
    e.preventDefault();
    addToCart(product);
  }

  return (
    <>
    <Head>
        <title>Home | Ignite Shop</title>
    </Head>
    <HomeContainer ref={sliderRef} className="keen-slider">
      {products.map(product => {
        return (
          <Link key={product.id} href={`/product/${product.id}`} legacyBehavior prefetch={false}>
            <Product className="keen-slider__slide">
              <Image src={product.imageUrl} width={520} height={480} alt="" />
              <footer>
                <div>
                  <strong>{product.name}</strong>
                  <span>{product.price}</span>
                </div>
                <CartButton 
                  onClick={(e) => handleAddToCart(e,product)}
                  // disabled={checkIfItemAlreadyExists} 
                  disabled={checkIfItemAlreadyExists(product.id)}  
                  color={'green'}
                  size={'large'}
                  />
              </footer>
            </Product>
          </Link>
        )
      })}
    </HomeContainer>
    </>
  )
}

// Executa somente no lado do Server
// Não visível para o usuário final
// Pode colocar "código sensível"
export const getStaticProps: GetStaticProps = async () => {
  const response = await stripe.products.list({
    expand: ['data.default_price']
  });

  const products = response.data.map(product => {
    const price = product.default_price as Stripe.Price;

    return {
      id: product.id,
      name: product.name,
      imageUrl: product.images[0],
      price: new Intl.NumberFormat('pt-BR', {
        style:'currency',
        currency:'BRL'
      }).format(price.unit_amount ? price.unit_amount/100 : 0),
      numberPrice: price.unit_amount / 100,
      defaultPriceId: price.id, 
    }
  })
  
  return { 
    props: {
      products,
    },
    revalidate: 60 * 60 * 2 // 2 hours
  }
}
