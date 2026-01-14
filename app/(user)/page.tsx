"use client"

import Hero from "@/components/home/Hero";
import { Product } from '@/types/product.types';
import { ProductSection } from '@/components/product/ProductSection';
import { productService } from '@/services/product.service';
import { useEffect, useState } from "react";
import Banner from "@/components/home/Banner";
import Explore from "@/components/home/Explore";
import { useCurrencyStore } from "@/store/useCurrencyStore";


export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const { currency, getCurrencyParam } = useCurrencyStore();

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true); 

      const currencyParam = getCurrencyParam();

      try {
        const [featured, best] = await Promise.all([
          productService.getFeaturedProducts(currencyParam),
          productService.getBestsellers(currencyParam)
        ]);

        setFeaturedProducts(featured);
        setBestsellers(best);
      } catch (error) {
        console.error("Failed to load products", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [currency]);

  return (
    <>
      <Hero />

      <ProductSection
        title="Featured Drops"
        subtitle="SHOP NOW"
        products={featuredProducts}
        bg="white"
        loading={loading}
      />

      <Banner />

      <ProductSection
        title="Bestsellers"
        subtitle="COMMUNITY FAVORITES"
        products={bestsellers}
        bg="white"
        loading={loading}
      />

      <Explore />
    </>
  );
}