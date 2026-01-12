'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, ArrowLeft, X } from 'lucide-react';
import { Button, Modal, Input, Textarea, Badge } from '@/components/admin/ui';
import { PiDotsSixVertical } from 'react-icons/pi';
import { mockProducts } from '@/services/mock.service';
import { Product } from '@/types/admin.types';

type ContentTab = 'homepage' | 'about' | 'byom' | 'faqs' | 'testimonials';
type SectionType = 'hero' | 'featured' | 'banner' | 'bestsellers' | 'explore' | 'about' | 'story' | 'movement' | 'byom-section' | 'custom-images' | 'custom-price' | 'custom-text' | 'uploaded-image';

interface Section {
  id: string;
  name: string;
  type: SectionType;
  enabled: boolean;
}

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState<ContentTab>('homepage');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<Section | null>(null);
  const [showSubPage, setShowSubPage] = useState(false);
  const [subPageType, setSubPageType] = useState<'custom-images' | 'custom-price' | null>(null);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [sections, setSections] = useState({
    homepage: [
      { id: '1', name: 'Hero Section', type: 'hero' as SectionType, enabled: true },
      { id: '2', name: 'Featured Drops', type: 'featured' as SectionType, enabled: true },
      { id: '3', name: 'Banner Section', type: 'banner' as SectionType, enabled: true },
      { id: '4', name: 'Bestsellers', type: 'bestsellers' as SectionType, enabled: true },
      { id: '5', name: 'Explore Section', type: 'explore' as SectionType, enabled: true },
    ],
    about: [
      { id: '1', name: 'About Section', type: 'about' as SectionType, enabled: true },
      { id: '2', name: 'Our Story', type: 'story' as SectionType, enabled: true },
      { id: '3', name: 'The Movement', type: 'movement' as SectionType, enabled: true },
      { id: '4', name: 'BYOM', type: 'byom-section' as SectionType, enabled: true },
    ],
    byom: [
      { id: '1', name: 'Custom Images', type: 'custom-images' as SectionType, enabled: true },
      { id: '2', name: 'Custom Price', type: 'custom-price' as SectionType, enabled: true },
      { id: '3', name: 'Custom Text', type: 'custom-text' as SectionType, enabled: true },
      { id: '4', name: 'Uploaded Image', type: 'uploaded-image' as SectionType, enabled: true },
    ],
  });

  const [formData, setFormData] = useState({
    heading: '',
    description: '',
    image: '',
    status: 'Active',
    productNumber: '4',
    selectedProducts: [] as Product[],
    image1: '',
    description1: '',
    image2: '',
    description2: '',
    price: '',
    type: 'All',
    question: '',
    answer: '',
    customerImage: '',
    customerName: '',
    review: '',
    rating: 5,
    date: '',
    merchName: '',
    amount: '',
  });

  const handleToggleSection = (tabKey: 'homepage' | 'about' | 'byom', sectionId: string) => {
    setSections(prev => ({
      ...prev,
      [tabKey]: prev[tabKey].map(section =>
        section.id === sectionId
          ? { ...section, enabled: !section.enabled }
          : section
      )
    }));
  };

  const handleEditSection = (section: Section) => {
    setCurrentSection(section);
    setFormData(prev => ({
      ...prev,
      status: section.enabled ? 'Active' : 'Inactive'
    }));
    resetForm();
    
    if (section.type === 'custom-images' || section.type === 'custom-price') {
      setSubPageType(section.type);
      setShowSubPage(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleSaveSection = () => {
    if (currentSection) {
      const tabKey = activeTab === 'homepage' ? 'homepage' : activeTab === 'about' ? 'about' : 'byom';
      setSections(prev => ({
        ...prev,
        [tabKey]: prev[tabKey].map(section =>
          section.id === currentSection.id
            ? { ...section, enabled: formData.status === 'Active' }
            : section
        )
      }));
    }
    setIsModalOpen(false);
  };

  const [faqs, setFaqs] = useState([
    { id: '1', type: 'Orders & Shipping', question: 'How do I track my order?', answer: 'You can track your order using the tracking link sent to your email.' },
    { id: '2', type: 'Products', question: 'What materials are used?', answer: 'We use premium quality cotton and polyester blends.' },
  ]);

  const [testimonials, setTestimonials] = useState([
    { id: '1', image: '', name: 'John Doe', review: 'Great quality products! Love my new hoodie.', rating: 5, date: '2024-12-15' },
    { id: '2', image: '', name: 'Jane Smith', review: 'Fast shipping and amazing designs!', rating: 5, date: '2024-12-10' },
  ]);

  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);

  const [customImages, setCustomImages] = useState([
    { id: '1', image: '', amount: '5000', status: 'Active' },
  ]);

  const [customPrices, setCustomPrices] = useState([
    { id: '1', name: 'T-shirt', amount: '8000', status: 'Active' },
  ]);

  const resetForm = () => {
    setFormData({
      heading: '',
      description: '',
      image: '',
      status: 'Active',
      productNumber: '4',
      selectedProducts: [],
      image1: '',
      description1: '',
      image2: '',
      description2: '',
      price: '',
      type: 'All',
      question: '',
      answer: '',
      customerImage: '',
      customerName: '',
      review: '',
      rating: 5,
      date: '',
      merchName: '',
      amount: '',
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductSelect = (product: Product) => {
    if (formData.selectedProducts.find(p => p.id === product.id)) {
      setFormData({
        ...formData,
        selectedProducts: formData.selectedProducts.filter(p => p.id !== product.id)
      });
    } else if (formData.selectedProducts.length < 4) {
      setFormData({
        ...formData,
        selectedProducts: [...formData.selectedProducts, product]
      });
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setFormData({
      ...formData,
      selectedProducts: formData.selectedProducts.filter(p => p.id !== productId)
    });
  };

  const handleEditFaq = (faq: typeof faqs[0]) => {
    setEditingFaqId(faq.id);
    setFormData({
      ...formData,
      type: faq.type,
      question: faq.question,
      answer: faq.answer,
    });
    setIsModalOpen(true);
  };

  const handleDeleteFaq = (id: string) => {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      setFaqs(faqs.filter(f => f.id !== id));
    }
  };

  const handleSaveFaq = () => {
    if (editingFaqId) {
      setFaqs(faqs.map(f => f.id === editingFaqId ? {
        ...f,
        type: formData.type,
        question: formData.question,
        answer: formData.answer,
      } : f));
    } else {
      const newFaq = {
        id: String(faqs.length + 1),
        type: formData.type,
        question: formData.question,
        answer: formData.answer,
      };
      setFaqs([...faqs, newFaq]);
    }
    setEditingFaqId(null);
    setIsModalOpen(false);
    resetForm();
  };

  const handleEditTestimonial = (testimonial: typeof testimonials[0]) => {
    setEditingTestimonialId(testimonial.id);
    setFormData({
      ...formData,
      customerImage: testimonial.image,
      customerName: testimonial.name,
      review: testimonial.review,
      rating: testimonial.rating,
      date: testimonial.date,
    });
    setIsModalOpen(true);
  };

  const handleDeleteTestimonial = (id: string) => {
    if (confirm('Are you sure you want to delete this testimonial?')) {
      setTestimonials(testimonials.filter(t => t.id !== id));
    }
  };

  const handleSaveTestimonial = () => {
    if (editingTestimonialId) {
      setTestimonials(testimonials.map(t => t.id === editingTestimonialId ? {
        ...t,
        image: formData.customerImage,
        name: formData.customerName,
        review: formData.review,
        rating: formData.rating,
        date: formData.date,
      } : t));
    } else {
      const newTestimonial = {
        id: String(testimonials.length + 1),
        image: formData.customerImage,
        name: formData.customerName,
        review: formData.review,
        rating: formData.rating,
        date: formData.date,
      };
      setTestimonials([...testimonials, newTestimonial]);
    }
    setEditingTestimonialId(null);
    setIsModalOpen(false);
    resetForm();
  };

  const renderSections = (sectionsList: Section[], tabKey: 'homepage' | 'byom') => (
    <div className="space-y-4">
      {sectionsList.map((section) => (
        <div key={section.id} className="bg-white p-4 rounded-lg border border-accent-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <PiDotsSixVertical size={24} className="text-grey cursor-move" />
            <span className="font-medium text-admin-primary">{section.name}</span>
          </div>
          <div className="flex items-center space-x-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={section.enabled} 
                className="sr-only peer" 
                onChange={() => handleToggleSection(tabKey, section.id)} 
              />
              <div className="w-9 h-5 bg-grey/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-accent-2 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
            </label>
            <button
              onClick={() => handleEditSection(section)}
              className="px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary/90 transition-colors"
            >
              Edit
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderModal = () => {
    if (!currentSection) return null;

    const getModalTitle = () => {
      switch (currentSection.type) {
        case 'hero': return 'Hero Section';
        case 'featured': return 'Featured Products';
        case 'banner': return 'Banner Section';
        case 'bestsellers': return 'Bestsellers';
        case 'explore': return 'Explore';
        case 'story': return 'Our Story';
        case 'movement': return 'The Movement';
        case 'byom-section': return 'BYOM';
        case 'custom-text': return 'Custom Text';
        case 'uploaded-image': return 'Uploaded Image';
        default: return '';
      }
    };

    return (
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={getModalTitle()} size="lg">
        <div className="space-y-4">
          {(currentSection.type === 'featured' || currentSection.type === 'bestsellers') ? (
            <>
              <Input
                label={currentSection.type === 'featured' ? 'Number' : 'Product Number'}
                value={formData.productNumber}
                readOnly
                disabled
              />
              <div>
                <label className="block text-admin-primary font-medium mb-2">Select Products</label>
                <select
                  className="w-full px-4 py-2 border border-admin-primary/35 rounded-lg focus:outline-none focus:border-[#A1CBFF]"
                  onChange={(e) => {
                    const product = mockProducts.find(p => p.id === e.target.value);
                    if (product) handleProductSelect(product);
                    e.target.value = '';
                  }}
                >
                  <option value="">Select a product</option>
                  {mockProducts.map((product) => (
                    <option key={product.id} value={product.id} disabled={formData.selectedProducts.some(p => p.id === product.id)}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              {formData.selectedProducts.length > 0 && (
                <div>
                  <label className="block text-admin-primary font-medium mb-2">Selected Products ({formData.selectedProducts.length}/4)</label>
                  <div className="space-y-2">
                    {formData.selectedProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-accent-1 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded" />
                          <span className="text-admin-primary">{product.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(product.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-admin-primary font-medium mb-2">Status</label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="Active"
                      checked={formData.status === 'Active'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="mr-2"
                    />
                    <span className="text-sm text-grey">Active</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="Inactive"
                      checked={formData.status === 'Inactive'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="mr-2"
                    />
                    <span className="text-sm text-grey">Inactive</span>
                  </label>
                </div>
              </div>
            </>
          ) : currentSection.type === 'explore' ? (
            <>
              <div>
                <label className="block text-admin-primary font-medium mb-2">Image 1</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'image1')}
                  className="w-full"
                />
                {formData.image1 && (
                  <img src={formData.image1} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />
                )}
              </div>
              <Textarea
                label="Description 1"
                value={formData.description1}
                onChange={(e) => setFormData({ ...formData, description1: e.target.value })}
                rows={3}
              />
              <div>
                <label className="block text-admin-primary font-medium mb-2">Image 2</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'image2')}
                  className="w-full"
                />
                {formData.image2 && (
                  <img src={formData.image2} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />
                )}
              </div>
              <Textarea
                label="Description 2"
                value={formData.description2}
                onChange={(e) => setFormData({ ...formData, description2: e.target.value })}
                rows={3}
              />
            </>
          ) : (currentSection.type === 'custom-text' || currentSection.type === 'uploaded-image') ? (
            <>
              <Input
                label="Price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Enter price"
              />
              <div>
                <label className="block text-admin-primary font-medium mb-2">Status</label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="Active"
                      checked={formData.status === 'Active'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="mr-2"
                    />
                    <span className="text-sm text-grey">Active</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="Inactive"
                      checked={formData.status === 'Inactive'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="mr-2"
                    />
                    <span className="text-sm text-grey">Inactive</span>
                  </label>
                </div>
              </div>
            </>
          ) : (
            <>
              <Input
                label="Heading"
                value={formData.heading}
                onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                placeholder="Enter heading"
              />
              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description"
                rows={4}
              />
              <div>
                <label className="block text-admin-primary font-medium mb-2">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'image')}
                  className="w-full"
                />
                {formData.image && (
                  <img src={formData.image} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />
                )}
              </div>
              <div>
                <label className="block text-admin-primary font-medium mb-2">Status</label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="Active"
                      checked={formData.status === 'Active'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="mr-2"
                    />
                    <span className="text-sm text-grey">Active</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="Inactive"
                      checked={formData.status === 'Inactive'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="mr-2"
                    />
                    <span className="text-sm text-grey">Inactive</span>
                  </label>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-center space-x-5 pt-5">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveSection}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div>
      <div className='mb-6'>
        <h1 className="text-xl lg:text-2xl font-bold text-admin-primary">Content Management</h1>
        <p className="text-sm text-admin-primary">Manage Homepage, BYOM, FAQs and Testimonials</p>
      </div>

      {showSubPage ? (
        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center gap-5 mb-6">
            <button
              onClick={() => {
                setShowSubPage(false);
                setSubPageType(null);
              }}
              className="flex items-center space-x-2 text-admin-primary hover:text-admin-primary/80 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back</span>
            </button>
            <h2 className="text-xl font-medium text-admin-primary">
              {subPageType === 'custom-images' ? 'Custom Images' : 'Custom Price'}
            </h2>
          </div>

          <div className="mb-4 flex justify-end">
            <Button onClick={() => setIsSubModalOpen(true)}>
              Add New
            </Button>
          </div>

          {subPageType === 'custom-images' ? (
            customImages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-grey mb-4">No custom image uploaded</p>
                <Button onClick={() => setIsSubModalOpen(true)}>Add New</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {customImages.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-accent-1 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-grey/20 rounded" />
                      <div>
                        <p className="font-medium text-admin-primary">₦{item.amount}</p>
                        <Badge variant={item.status === 'Active' ? 'success' : 'default'}>{item.status}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 hover:bg-white rounded-lg"><Edit size={16} className="text-admin-primary" /></button>
                      <button className="p-2 hover:bg-red-50 rounded-lg"><Trash2 size={16} className="text-red-600" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            customPrices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-grey mb-4">No merch added</p>
                <Button onClick={() => setIsSubModalOpen(true)}>Add New</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {customPrices.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-accent-1 rounded-lg">
                    <div>
                      <p className="font-medium text-admin-primary">{item.name}</p>
                      <p className="text-grey">₦{item.amount}</p>
                      <Badge variant={item.status === 'Active' ? 'success' : 'default'}>{item.status}</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 hover:bg-white rounded-lg"><Edit size={16} className="text-admin-primary" /></button>
                      <button className="p-2 hover:bg-red-50 rounded-lg"><Trash2 size={16} className="text-red-600" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          <Modal isOpen={isSubModalOpen} onClose={() => setIsSubModalOpen(false)} title={subPageType === 'custom-images' ? 'Upload Image' : 'Add Merch'} size="md">
            <div className="space-y-4">
              {subPageType === 'custom-images' ? (
                <>
                  <div>
                    <label className="block text-admin-primary font-medium mb-2">Upload Image</label>
                    <input type="file" accept="image/*" className="w-full" />
                  </div>
                  <Input label="Amount" placeholder="Enter amount" />
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-admin-primary font-medium mb-2">Name</label>
                    <select className="w-full px-4 py-2 border border-admin-primary/35 rounded-lg focus:outline-none">
                      <option>T-shirt</option>
                      <option>Long Sleeve</option>
                      <option>Hoodie</option>
                      <option>Trouser</option>
                      <option>Short</option>
                      <option>Hat</option>
                    </select>
                  </div>
                  <Input label="Amount" placeholder="Enter amount" />
                </>
              )}

              <div>
                <label className="block text-admin-primary font-medium mb-2">Status</label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input type="radio" name="status" value="Active" defaultChecked className="mr-2" />
                    <span className="text-sm text-grey">Active</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input type="radio" name="status" value="Inactive" className="mr-2" />
                    <span className="text-sm text-grey">Inactive</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-center space-x-5 pt-5">
                <Button type="button" variant="secondary" onClick={() => setIsSubModalOpen(false)}>Cancel</Button>
                <Button type="button" onClick={() => setIsSubModalOpen(false)}>Save Changes</Button>
              </div>
            </div>
          </Modal>
        </div>
      ) : (
        <>
          <div className="bg-admin-primary/4 rounded-t-xl p-4">
            <div className="flex flex-wrap gap-2 w-fit bg-white p-1">
              {[
                { key: 'homepage', label: 'Homepage' },
                { key: 'byom', label: 'BYOM' },
                { key: 'faqs', label: 'FAQs & Help Center' },
                { key: 'testimonials', label: 'Testimonials & Reviews' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as ContentTab)}
                  className={`px-4 py-2 rounded-sm text-sm transition-all ${activeTab === tab.key
                    ? 'bg-admin-primary text-white'
                    : 'bg-admin-primary/5 text-admin-primary'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-admin-primary/4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-admin-primary">
                {activeTab === 'homepage' ? 'Homepage' :
                 activeTab === 'byom' ? 'BYOM' :
                 activeTab === 'faqs' ? 'FAQs' :
                 'Testimonials'}
              </h2>
              {(activeTab === 'faqs' || activeTab === 'testimonials') && (
                <Button onClick={() => {
                  resetForm();
                  setCurrentSection(null);
                  setIsModalOpen(true);
                }}>
                  Add New
                </Button>
              )}
            </div>

            {activeTab === 'homepage' && renderSections(sections.homepage, 'homepage')}
            {activeTab === 'byom' && renderSections(sections.byom, 'byom')}

            {activeTab === 'faqs' && (
              <div className="space-y-3">
                {faqs.map((faq) => (
                  <div key={faq.id} className="bg-white p-4 rounded-lg border border-accent-2">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium text-admin-primary">{faq.question}</p>
                          <Badge variant="info">{faq.type}</Badge>
                        </div>
                        <p className="text-grey">{faq.answer}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleEditFaq(faq)}
                          className="p-2 hover:bg-accent-1 rounded-lg"
                        >
                          <Edit size={16} className="text-admin-primary" />
                        </button>
                        <button 
                          onClick={() => handleDeleteFaq(faq.id)}
                          className="p-2 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'testimonials' && (
              <div className="space-y-3">
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="bg-white p-4 rounded-lg border border-accent-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-admin-primary rounded-full flex items-center justify-center">
                          {testimonial.image ? (
                            <img src={testimonial.image} alt={testimonial.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-white font-medium">{testimonial.name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-admin-primary">{testimonial.name}</p>
                          <div className="flex text-yellow-500">
                            {'★'.repeat(testimonial.rating)}{'☆'.repeat(5 - testimonial.rating)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleEditTestimonial(testimonial)}
                          className="p-2 hover:bg-accent-1 rounded-lg"
                        >
                          <Edit size={16} className="text-admin-primary" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTestimonial(testimonial.id)}
                          className="p-2 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                    <p className="text-grey">{testimonial.review}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {renderModal()}

          {(activeTab === 'faqs' || activeTab === 'testimonials') && (
            <Modal isOpen={isModalOpen && !currentSection} onClose={() => {
              setIsModalOpen(false);
              setEditingFaqId(null);
              setEditingTestimonialId(null);
              resetForm();
            }} title={activeTab === 'faqs' ? (editingFaqId ? 'Edit FAQ' : 'Add FAQ') : (editingTestimonialId ? 'Edit Testimonial' : 'Add Testimonial')} size="md">
              <div className="space-y-4">
                {activeTab === 'faqs' ? (
                  <>
                    <div>
                      <label className="block text-admin-primary font-medium mb-2">Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-4 py-2 border border-admin-primary/35 rounded-lg focus:outline-none focus:border-[#A1CBFF]"
                      >
                        <option>All</option>
                        <option>Orders & Shipping</option>
                        <option>Products</option>
                        <option>BYOM</option>
                        <option>Returns & Exchanges</option>
                        <option>Payment</option>
                        <option>Account</option>
                      </select>
                    </div>
                    <Input
                      label="Question"
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      placeholder="Enter question"
                    />
                    <Input
                      label="Answer"
                      value={formData.answer}
                      onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                      placeholder="Enter answer"
                    />
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-admin-primary font-medium mb-2">Customer Image</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleImageUpload(e, 'customerImage')} 
                        className="w-full px-4 py-2 border border-admin-primary/35 rounded-lg"
                      />
                      {formData.customerImage && (
                        <img src={formData.customerImage} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded-full" />
                      )}
                    </div>
                    <Input
                      label="Customer Name"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder="Enter customer name"
                    />
                    <Textarea
                      label="Review"
                      value={formData.review}
                      onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                      placeholder="Enter review"
                      rows={3}
                    />
                    <div>
                      <label className="block text-admin-primary font-medium mb-2">Rating</label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFormData({ ...formData, rating: star })}
                            className={`text-2xl ${star <= formData.rating ? 'text-yellow-500' : 'text-grey/30'} hover:scale-110 transition-transform`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      <p className="text-sm text-grey mt-1">{formData.rating} star{formData.rating !== 1 ? 's' : ''} selected</p>
                    </div>
                    <Input
                      label="Date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </>
                )}

                <div className="flex justify-center space-x-5 pt-5">
                  <Button type="button" variant="secondary" onClick={() => {
                    setIsModalOpen(false);
                    setEditingFaqId(null);
                    setEditingTestimonialId(null);
                    resetForm();
                  }}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={activeTab === 'faqs' ? handleSaveFaq : handleSaveTestimonial}>
                    Done
                  </Button>
                </div>
              </div>
            </Modal>
          )}
        </>
      )}
    </div>
  );
}