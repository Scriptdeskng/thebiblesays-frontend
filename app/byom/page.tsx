'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { MerchType } from '@/types/byom.types';

const merchTypes: { type: MerchType; label: string; image: string }[] = [
  { type: 'tshirt', label: 'T-Shirt', image: '/byom/tshirt.png' },
  { type: 'longsleeve', label: 'Long Sleeve', image: '/byom/longsleeve.png' },
  { type: 'hoodie', label: 'Hoodie', image: '/byom/hoodie.png' },
  { type: 'trouser', label: 'Trouser', image: '/byom/pants.png' },
  { type: 'short', label: 'Short', image: '/byom/short.png' },
  { type: 'hat', label: 'Hat', image: '/byom/hat.png' },
];

export default function BYOMPage() {
  return (
    <div className="max-w-[1536px] mx-auto px-5 sm:px-10 xl:px-20 py-10">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-primary mb-2 lg:text-4xl lg:mb-4">Build Your Own Merch</h1>
        <p className="text-lg text-grey max-w-2xl">
          Design your own merch that reflects your story and beliefs. Add your favorite verse, phrase, or artwork - and make it yours
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {merchTypes.map((merch) => (
          <Link
            key={merch.type}
            href={`/byom/customize/${merch.type}`}
            className="group"
          >
            <div className="bg-white border-2 border-accent-2 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="relative aspect-square bg-accent-1 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="relative w-full h-full">
                    <Image
                      src={merch.image}
                      alt={merch.label}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-primary mb-1">{merch.label}</h3>
                <p className="text-grey text-sm mb-4">Customize your {merch.label.toLowerCase()}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}