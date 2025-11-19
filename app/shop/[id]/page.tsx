import { productService } from '@/services/product.service';
import ProductPageClient from './ProductPage';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const product = await productService.getProductById(id);
  const reviews = await productService.getReviews(id);
  const relatedProducts = await productService.getRelatedProducts(id, 4);

  return (
    <ProductPageClient
      product={product}
      reviews={reviews}
      relatedProducts={relatedProducts}
    />
  );
}
