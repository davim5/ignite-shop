import CartButton from "../CartButton";
import * as Dialog from "@radix-ui/react-dialog";
import { CartClose, CartContent, CartFinalization, CartProduct, CartProductDetails, CartProductImage, FinalizationDetails } from "./styles";
import { X } from "phosphor-react";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";
import axios from "axios";

export default function Cart(){
    const { cartItems, removeCartItem, cartTotal } = useCart();
    const [ isCreatingCheckoutSession,setIsCreatingCheckoutSession] = useState(false);
    const cartQuantity = cartItems.length;

    const formattedCartTotal = new Intl.NumberFormat('pt-Br',{
        style:'currency',
        currency: 'BRL',
    }).format(cartTotal);

    async function handleCheckout() {
    try {
        setIsCreatingCheckoutSession(true);
        const response = await axios.post('/api/checkout', {
            products: cartItems,
        })
    
        const { checkoutUrl } = response.data;

        window.location.href = checkoutUrl;
    } catch(err)
    {
        //Conectar com alguma ferramenta de observabilidade
        setIsCreatingCheckoutSession(false);
        alert('Falha ao redirecionar checkout!');
    }
}

    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                <CartButton />
            </Dialog.Trigger>
            <Dialog.Portal>
                <CartContent>
                    <CartClose>
                        <X size={24} weight='bold'/>
                    </CartClose>
                    <h2>Sacola de compras</h2>
                    <section>
                        {cartQuantity <= 0 && <p>Parece que o seu carrinho está vazio :(</p>}

                        {cartItems.map((cartItem => (
                            <CartProduct key={cartItem.id}>
                                <CartProductImage>
                                    <Image 
                                    width={100}
                                    height={93}
                                    alt=""
                                    src={cartItem.imageUrl}
                                    />
                                </CartProductImage>
                                <CartProductDetails>
                                    <p>{cartItem.name}</p>
                                    <strong>{cartItem.price}</strong>
                                    <button onClick={() => removeCartItem(cartItem.id)}>Remover</button>
                                </CartProductDetails>
                            </CartProduct>
                        )))}
                    </section>
                    <CartFinalization>
                        <FinalizationDetails>
                            <div>
                                <span>Quantidade</span>
                                <p>{cartQuantity} {cartQuantity === 1 ? 'items' : 'itens'}</p>
                            </div>
                            <div>
                                <span>Valor total</span>
                                <p>{formattedCartTotal}</p>
                            </div>
                        </FinalizationDetails>
                        <button 
                            onClick={handleCheckout}
                            disabled={isCreatingCheckoutSession || cartQuantity <= 0}>
                            Finalizar Compra
                        </button>
                    </CartFinalization>
                </CartContent>
            </Dialog.Portal>
        </Dialog.Root>
    );
}