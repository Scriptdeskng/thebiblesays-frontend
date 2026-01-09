'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button, Modal, Input, Textarea, Badge } from '@/components/admin/ui';

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState<'homepage' | 'banners' | 'blogs' | 'faqs' | 'categories' | 'testimonials'>('homepage');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary mb-1">Content Management</h1>
        <p className="text-sm text-grey">Manage homepage, banners, blogs, FAQs and testimonials</p>
      </div>

      <div className="bg-white rounded-xl border border-accent-2 overflow-hidden">
        <div className="flex border-b border-accent-2 overflow-x-auto">
          {['homepage', 'banners', 'blogs', 'faqs', 'categories', 'testimonials'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-4 text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                activeTab === tab ? 'text-primary border-b-2 border-primary bg-accent-1/50' : 'text-grey hover:bg-accent-1'
              }`}
            >
              {tab === 'banners' ? 'Banner & Hero' : tab === 'blogs' ? 'Blogs & Devotional' : tab === 'faqs' ? 'FAQs & Help' : tab}
            </button>
          ))}
        </div>

        {activeTab === 'homepage' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Homepage Content</h3>
            <div className="space-y-4">
              <div className="p-4 border border-accent-2 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-primary">Hero Section</p>
                  <button className="p-2 hover:bg-accent-1 rounded-lg"><Edit size={16} className="text-grey" /></button>
                </div>
                <p className="text-sm text-grey">Main headline and call-to-action button</p>
              </div>
              <div className="p-4 border border-accent-2 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-primary">Featured Products</p>
                  <button className="p-2 hover:bg-accent-1 rounded-lg"><Edit size={16} className="text-grey" /></button>
                </div>
                <p className="text-sm text-grey">Select products to display on homepage</p>
              </div>
              <div className="p-4 border border-accent-2 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-primary">About Section</p>
                  <button className="p-2 hover:bg-accent-1 rounded-lg"><Edit size={16} className="text-grey" /></button>
                </div>
                <p className="text-sm text-grey">About your church merch store</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'banners' && (
          <div className="p-6">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">Banners & Hero Images</h3>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus size={16} className="mr-2" />
                Add Banner
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="border border-accent-2 rounded-lg overflow-hidden">
                  <div className="aspect-video bg-accent-1 flex items-center justify-center">
                    <p className="text-grey">Banner {i}</p>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-primary">New Year Sale</p>
                        <Badge variant="success">Active</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-accent-1 rounded-lg"><Edit size={16} className="text-grey" /></button>
                        <button className="p-2 hover:bg-red-50 rounded-lg"><Trash2 size={16} className="text-red-600" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'blogs' && (
          <div className="p-6">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">Blogs & Devotionals</h3>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus size={16} className="mr-2" />
                Create Post
              </Button>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-accent-2 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-accent-1 rounded-lg"></div>
                    <div>
                      <p className="font-medium text-primary">Faith in Times of Uncertainty</p>
                      <p className="text-sm text-grey">By Pastor John • Dec 15, 2024</p>
                      <Badge variant="success">Published</Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-accent-1 rounded-lg"><Edit size={16} className="text-grey" /></button>
                    <button className="p-2 hover:bg-red-50 rounded-lg"><Trash2 size={16} className="text-red-600" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'faqs' && (
          <div className="p-6">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">FAQs & Help Center</h3>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus size={16} className="mr-2" />
                Add FAQ
              </Button>
            </div>
            <div className="space-y-3">
              {['How do I track my order?', 'What is your return policy?', 'How long does shipping take?'].map((q, i) => (
                <div key={i} className="p-4 border border-accent-2 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-primary mb-2">{q}</p>
                      <p className="text-sm text-grey">Answer details go here...</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 hover:bg-accent-1 rounded-lg"><Edit size={16} className="text-grey" /></button>
                      <button className="p-2 hover:bg-red-50 rounded-lg"><Trash2 size={16} className="text-red-600" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="p-6">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">Product Categories</h3>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus size={16} className="mr-2" />
                Add Category
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Shirts', 'Caps', 'Hoodie', 'Jackets', 'Headband', 'Hat'].map((cat) => (
                <div key={cat} className="p-4 border border-accent-2 rounded-lg text-center">
                  <div className="w-full aspect-square bg-accent-1 rounded-lg mb-3"></div>
                  <p className="font-medium text-primary mb-2">{cat}</p>
                  <div className="flex justify-center space-x-2">
                    <button className="p-1 hover:bg-accent-1 rounded"><Edit size={14} className="text-grey" /></button>
                    <button className="p-1 hover:bg-red-50 rounded"><Trash2 size={14} className="text-red-600" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'testimonials' && (
          <div className="p-6">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">Testimonials & Reviews</h3>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus size={16} className="mr-2" />
                Add Testimonial
              </Button>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border border-accent-2 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">JD</span>
                      </div>
                      <div>
                        <p className="font-medium text-primary">John Doe</p>
                        <div className="flex text-yellow-500">★★★★★</div>
                      </div>
                    </div>
                    <Badge variant="success">Approved</Badge>
                  </div>
                  <p className="text-sm text-grey">Great quality products! Love my new hoodie.</p>
                  <div className="flex items-center space-x-2 mt-3">
                    <button className="p-2 hover:bg-accent-1 rounded-lg"><Edit size={16} className="text-grey" /></button>
                    <button className="p-2 hover:bg-red-50 rounded-lg"><Trash2 size={16} className="text-red-600" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Add ${activeTab}`}>
        <div className="space-y-4">
          <Input label="Title" placeholder="Enter title" />
          <Textarea label="Content" placeholder="Enter content" rows={4} />
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}