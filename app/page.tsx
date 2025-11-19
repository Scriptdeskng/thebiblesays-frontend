"use client"

import Hero from "@/components/home/Hero";
import { Product } from '@/types/product.types';
import { ProductSection } from '@/components/product/ProductSection';
import { productService } from '@/services/product.service';
import { useEffect, useState } from "react";
import Banner from "@/components/home/Banner";
import Explore from "@/components/home/Explore";

export default function Home() {
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      const featured = await productService.getFeaturedProducts();
      const best = await productService.getBestsellers();
      setFeaturedProducts(featured);
      setBestsellers(best);
    };

    loadProducts();
  }, []);

  return (
    <>
      <Hero />

      <ProductSection
        title="Featured Drops"
        subtitle="SHOP NOW"
        products={featuredProducts}
        bg="white"
      />

      <Banner />

      <ProductSection
        title="Bestsellers"
        subtitle="COMMUNITY FAVORITES"
        products={bestsellers}
        bg="white"
      />

      <Explore />
    </>
  );
}
