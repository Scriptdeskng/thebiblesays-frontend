'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Eye, Trash2, EyeOff, Filter, ChevronDown, Tag, X } from 'lucide-react';
import { Button, Modal, Input, Select, Textarea, Badge, LoadingSpinner, EmptyState } from '@/components/admin/ui';
import { Product, ProductCategory, ProductColor, ProductSize, ProductStatus } from '@/types/admin.types';
import { mockProducts, AVAILABLE_COLORS, apiService } from '@/services/mock.service';
import { formatCurrency, getStatusColor } from '@/lib/utils';
import CategoryDropdown from '@/components/admin/products/CategoryDropdown';
import { PiEyeLight, PiEyeSlash, PiPencilSimpleLineLight } from 'react-icons/pi';
import { LuUpload } from 'react-icons/lu';

const categories: ProductCategory[] = ['Shirts', 'Caps', 'Hoodie', 'Headband', 'Hat', 'Jackets'];
const sizes: ProductSize[] = ['S', 'M', 'L', 'XL', 'XXL'];
const additionalSizes: ProductSize[] = ['XS', '3XL', '4XL', '5XL'];
const additionalColors: ProductColor[] = [
    { name: 'Orange', hex: '#FF851B' },
    { name: 'Purple', hex: '#B10DC9' },
    { name: 'Pink', hex: '#F012BE' },
    { name: 'Teal', hex: '#39CCCC' },
    { name: 'Maroon', hex: '#85144B' },
    { name: 'Brown', hex: '#8B4513' },
    { name: 'Beige', hex: '#F5F5DC' },
    { name: 'Olive', hex: '#808000' },
    { name: 'Cyan', hex: '#00FFFF' },
    { name: 'Magenta', hex: '#FF00FF' },
    { name: 'Lime', hex: '#00FF00' },
    { name: 'Indigo', hex: '#4B0082' },
];
const predefinedTags = ['Faith', 'Hoodie', 'Christian'];

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('All category');
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdProductName, setCreatedProductName] = useState('');

    const itemsPerPage = 10;

    const [formData, setFormData] = useState({
        name: '',
        category: 'Shirts' as ProductCategory,
        price: '',
        stock: '',
        description: '',
        sizes: sizes,
        colors: AVAILABLE_COLORS,
        image: '',
        status: 'Active' as ProductStatus,
        tags: [] as string[],
    });
    const [customTag, setCustomTag] = useState('');

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await apiService.getProducts();
            setProducts(data);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenForm = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                category: product.category,
                price: product.price.toString(),
                stock: product.stock.toString(),
                description: product.description,
                sizes: product.sizes,
                colors: product.colors,
                image: product.image,
                status: product.status,
                tags: product.tags || [],
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                category: 'Shirts',
                price: '',
                stock: '',
                description: '',
                sizes: sizes,
                colors: AVAILABLE_COLORS,
                image: '',
                status: 'Active',
                tags: [],
            });
        }
        setCustomTag('');
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingProduct(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const productData = {
            ...formData,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock),
            sales: editingProduct?.sales || 0,
            revenue: editingProduct?.revenue || 0,
            createdAt: editingProduct?.createdAt || new Date().toISOString(),
        };

        try {
            if (editingProduct) {
                await apiService.updateProduct(editingProduct.id, productData);
                setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...productData } : p));
                handleCloseForm();
            } else {
                const newProduct = await apiService.createProduct(productData);
                setProducts([...products, newProduct]);
                setCreatedProductName(formData.name);
                handleCloseForm();
                setShowSuccessModal(true);
            }
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                await apiService.deleteProduct(id);
                setProducts(products.filter(p => p.id !== id));
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    const toggleSize = (size: ProductSize) => {
        setFormData({
            ...formData,
            sizes: formData.sizes.includes(size)
                ? formData.sizes.filter(s => s !== size)
                : [...formData.sizes, size],
        });
    };

    const toggleColor = (color: typeof AVAILABLE_COLORS[0]) => {
        setFormData({
            ...formData,
            colors: formData.colors.find(c => c.hex === color.hex)
                ? formData.colors.filter(c => c.hex !== color.hex)
                : [...formData.colors, color],
        });
    };

    const addSizeFromSelect = (size: ProductSize) => {
        if (!formData.sizes.includes(size)) {
            setFormData({
                ...formData,
                sizes: [...formData.sizes, size],
            });
        }
    };

    const addColorFromSelect = (color: ProductColor) => {
        if (!formData.colors.find(c => c.hex === color.hex)) {
            setFormData({
                ...formData,
                colors: [...formData.colors, color],
            });
        }
    };

    const toggleTag = (tag: string) => {
        setFormData({
            ...formData,
            tags: formData.tags.includes(tag)
                ? formData.tags.filter(t => t !== tag)
                : [...formData.tags, tag],
        });
    };

    const addCustomTag = () => {
        if (customTag.trim() && !formData.tags.includes(customTag.trim())) {
            setFormData({
                ...formData,
                tags: [...formData.tags, customTag.trim()],
            });
            setCustomTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(t => t !== tagToRemove),
        });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, image: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'All category' || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-xl font-medium text-admin-primary lg:text-2xl">Product Management</h1>
                    <p className="text-sm text-admin-primary">Manage your product inventory and listings</p>
                </div>
                {!showForm && (
                    <Button onClick={() => handleOpenForm()}>
                        Create New Product
                    </Button>
                )}
            </div>

            {showForm ? (
                <div className="bg-admin-primary/4 rounded-xl p-6 shadow-sm">
                    <h2 className="text-xl font-medium text-admin-primary mb-6">
                        {editingProduct ? 'Edit Product' : 'Create New Product'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-3 sm:p-6">
                        <Input
                            label="Product Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder="Enter product name"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Select
                                label="Category"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                                options={categories.map(cat => ({ value: cat, label: cat }))}
                                required
                            />

                            <Input
                                label="Price"
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                required
                                placeholder="0.00"
                            />
                        </div>

                        <Input
                            label="Stock Level"
                            type="number"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            required
                            placeholder="0"
                        />

                        <Textarea
                            label="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            placeholder="Product description"
                            rows={3}
                        />

                        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
                            <div>
                                <label className="block text-admin-primary mb-1">Available Sizes</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {sizes.map((size) => (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => toggleSize(size)}
                                            className={`px-4 py-2 rounded-md border transition-all ${formData.sizes.includes(size)
                                                ? 'border-[#A1CBFF] text-[#3291FF] bg-secondary'
                                                : 'border-admin-primary/35 text-admin-primary'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-admin-primary mb-1">Available Colors</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {AVAILABLE_COLORS.map((color) => (
                                        <button
                                            key={color.hex}
                                            type="button"
                                            onClick={() => toggleColor(color)}
                                            className={`flex items-center space-x-2 px-3 py-2 rounded-md border transition-all ${formData.colors.find(c => c.hex === color.hex)
                                                ? 'border-[#A1CBFF] bg-secondary'
                                                : 'border-admin-primary/35 text-admin-primary'
                                                }`}
                                        >
                                            <div
                                                className="w-2.5 h-2.5 rounded-full border border-accent-2"
                                                style={{ backgroundColor: color.hex }}
                                            />
                                            <span className="text-sm ">{color.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col lg:flex-row gap-6 lg:gap-12">
                            <div className="flex flex-col w-full">
                                <div>
                                    <label className="block text-admin-primary mb-1">Add Additional Size</label>
                                    <select
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                addSizeFromSelect(e.target.value as ProductSize);
                                                e.target.value = '';
                                            }
                                        }}
                                        className="w-full px-4 py-2 border border-admin-primary/35 rounded-lg focus:outline-none"
                                    >
                                        <option value="">Add a size</option>
                                        {additionalSizes.filter(size => !formData.sizes.includes(size)).map((size) => (
                                            <option key={size} value={size}>{size}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <div className="flex flex-wrap gap-2 min-h-[42px] items-center">
                                        {formData.sizes.filter(size => additionalSizes.includes(size)).length > 0 && (
                                            formData.sizes.filter(size => additionalSizes.includes(size)).map((size) => (
                                                <div
                                                    key={size}
                                                    className="flex items-center space-x-1 px-3 py-1 rounded-md bg-[#A1CBFF]/20 border border-[#A1CBFF]"
                                                >
                                                    <span className="text-sm text-[#3291FF]">{size}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleSize(size)}
                                                        className="ml-1 hover:text-red-600"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col w-full">
                                <div>
                                    <label className="block text-admin-primary mb-1">Add Additional Color</label>
                                    <select
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                const selectedColor = additionalColors.find(c => c.hex === e.target.value);
                                                if (selectedColor) {
                                                    addColorFromSelect(selectedColor);
                                                }
                                                e.target.value = '';
                                            }
                                        }}
                                        className="w-full px-4 py-2 border border-admin-primary/35 rounded-lg focus:outline-none"
                                    >
                                        <option value="">Add a color</option>
                                        {additionalColors.filter(color => !formData.colors.find(c => c.hex === color.hex)).map((color) => (
                                            <option key={color.hex} value={color.hex}>
                                                {color.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <div className="flex flex-wrap gap-2 min-h-[42px] items-center">
                                        {formData.colors.filter(color => additionalColors.find(c => c.hex === color.hex)).length > 0 && (
                                            formData.colors.filter(color => additionalColors.find(c => c.hex === color.hex)).map((color) => (
                                                <div
                                                    key={color.hex}
                                                    className="flex items-center space-x-2 px-3 py-1 rounded-md bg-[#A1CBFF]/20 border border-[#A1CBFF]"
                                                >
                                                    <div
                                                        className="w-2.5 h-2.5 rounded-full border border-accent-2"
                                                        style={{ backgroundColor: color.hex }}
                                                    />
                                                    <span className="text-sm text-[#3291FF]">{color.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleColor(color)}
                                                        className="ml-1 hover:text-red-600"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-admin-primary mb-1">Product Image</label>
                            {formData.image ? (
                                <div className="relative flex items-center justify-center">
                                    <img src={formData.image} alt="Preview" className="w-48 h-48 object-cover rounded-lg" />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, image: '' })}
                                        className="absolute top-2 right-2 p-2 bg-red-600/30 text-red-600 rounded-md"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-accent-2 rounded-lg p-8 text-center flex flex-col items-center justify-center">
                                    <LuUpload size={30} className="text-admin-primary" />
                                    <p className=" text-admin-primary mt-3">Click to upload or drag and drop</p>
                                    <p className="text-sm text-admin-primary/69 mb-4">PNG, JPG up to 10MB</p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="image-upload"
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className="inline-block px-4 py-2 bg-admin-primary text-white rounded-lg cursor-pointer hover:bg-opacity-90"
                                    >
                                        Upload Image
                                    </label>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-admin-primary mb-1">Product Status</label>
                            <div className="flex gap-4">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        value="Active"
                                        checked={formData.status === 'Active'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductStatus })}
                                        className="mr-2 ring-admin-primary"
                                    />
                                    <span className="text-sm text-grey">Active</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        value="Inactive"
                                        checked={formData.status === 'Inactive'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductStatus })}
                                        className="mr-2"
                                    />
                                    <span className="text-sm text-grey">Inactive</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-admin-primary mb-1">Tags</label>
                                    <div className="flex flex-wrap gap-2">
                                        {predefinedTags.map((tag) => (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => toggleTag(tag)}
                                                className={`flex items-center space-x-2 px-3 py-2 rounded-md border transition-all ${formData.tags.includes(tag)
                                                    ? 'border-[#A1CBFF] bg-secondary text-[#3291FF]'
                                                    : 'border-admin-primary/35 text-admin-primary'
                                                    }`}
                                            >
                                                <Tag size={14} />
                                                <span className="text-sm">{tag}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-admin-primary mb-1">Add Tags</label>
                                    <input
                                        type="text"
                                        value={customTag}
                                        onChange={(e) => setCustomTag(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addCustomTag();
                                            }
                                        }}
                                        placeholder="Enter tag name and press Enter"
                                        className="w-full px-4 py-2 border border-admin-primary/35 rounded-lg focus:outline-none"
                                    />
                                </div>
                            </div>

                            {formData.tags.filter(tag => !predefinedTags.includes(tag)).length > 0 && (
                                <div className="mt-4">
                                    <label className="block text-sm text-grey mb-2">Custom tags added</label>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.tags.filter(tag => !predefinedTags.includes(tag)).map((tag) => (
                                            <div
                                                key={tag}
                                                className="flex items-center space-x-2 px-3 py-2 rounded-md bg-[#A1CBFF]/20 border border-[#A1CBFF]"
                                            >
                                                <Tag size={14} className="text-[#3291FF]" />
                                                <span className="text-sm text-[#3291FF]">{tag}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeTag(tag)}
                                                    className="ml-1 hover:text-red-600"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-center space-x-5 pt-5">
                            <Button type="button" variant="secondary" onClick={handleCloseForm}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editingProduct ? 'Update Product' : 'Add Product'}
                            </Button>
                        </div>
                    </form>
                </div>
            ) : (
                <>
                    <div className="bg-admin-primary/4 rounded-t-xl p-4">
                        <div className="flex flex-col md:items-center md:flex-row md:justify-between w-full gap-4">
                            <h3 className='font-bold text-admin-primary'>All products</h3>

                            <div className="flex-1 flex flex-col md:flex-row gap-5 md:justify-end md:items-center">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-grey" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search products by name"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-white rounded-lg focus:outline-none sm:w-96 lg:w-200"
                                    />
                                </div>
                                <CategoryDropdown
                                    categories={categories}
                                    categoryFilter={categoryFilter}
                                    setCategoryFilter={setCategoryFilter}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-admin-primary/4 rounded-b-xl overflow-hidden">
                        {paginatedProducts.length === 0 ? (
                            <EmptyState
                                title="No products found"
                                description="Get started by creating your first product"
                                action={
                                    <Button onClick={() => handleOpenForm()} size='sm'>
                                        Create Product
                                    </Button>
                                }
                            />
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-accent-1 shadow-md shadow-black">
                                            <tr>
                                                <th className="text-left font-medium text-admin-primary px-6 py-4">Image</th>
                                                <th className="text-left font-medium text-admin-primary px-6 py-4">Product</th>
                                                <th className="text-left font-medium text-admin-primary px-6 py-4">Category</th>
                                                <th className="text-left font-medium text-admin-primary px-6 py-4">Amount</th>
                                                <th className="text-left font-medium text-admin-primary px-6 py-4">Stock</th>
                                                <th className="text-left font-medium text-admin-primary px-6 py-4">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedProducts.map((product) => (
                                                <tr key={product.id} onClick={() => handleOpenForm(product)} className="border-b border-accent-2 transition-colors bg-white cursor-pointer">
                                                    <td className="px-6 py-4">
                                                        <div className="w-12 h-12 bg-accent-1 rounded-lg flex items-center justify-center">
                                                            {product.image ? (
                                                                <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                                                            ) : (
                                                                <span className="text-grey text-xs">No Image</span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <p className="text-admin-primary">{product.name}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className='text-admin-primary'>{product.category}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-admin-primary">
                                                        {formatCurrency(product.price)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-admin-primary">
                                                            {product.stock}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant={product.status === 'Active' ? 'success' : 'default'}>
                                                            {product.status}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between px-6 py-4 border-t border-accent-2">
                                        <p className="text-sm text-grey">
                                            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of{' '}
                                            {filteredProducts.length} results
                                        </p>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                                disabled={currentPage === 1}
                                            >
                                                Previous
                                            </Button>
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`w-8 h-8 rounded-lg text-sm transition-all ${currentPage === page
                                                        ? 'bg-admin-primary text-white'
                                                        : 'bg-accent-1 text-grey hover:bg-accent-2'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                                disabled={currentPage === totalPages}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </>
            )}

            <Modal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title=""
                size="md"
            >
                <div className="text-center py-6">
                    <div className="mb-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-admin-primary mb-2">
                            Product uploaded successfully and is now available
                        </h3>
                        <p className="text-grey">
                            {createdProductName} has been successfully created
                        </p>
                    </div>
                    <Button onClick={() => setShowSuccessModal(false)} className="mt-4">
                        Go to product table
                    </Button>
                </div>
            </Modal>
        </div>
    );
}