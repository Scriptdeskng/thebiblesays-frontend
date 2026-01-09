'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, Download, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Button, Modal, Badge, LoadingSpinner, EmptyState } from '@/components/admin/ui';
import { CustomMerch, CustomMerchStatus } from '@/types/admin.types';
import { mockCustomMerch, apiService } from '@/services/mock.service';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function CustomMerchPage() {
  const [customMerch, setCustomMerch] = useState<CustomMerch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [durationFilter, setDurationFilter] = useState<string>('monthly');
  const [selectedMerch, setSelectedMerch] = useState<CustomMerch | null>(null);
  const [showMerchDetails, setShowMerchDetails] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await apiService.getCustomMerch();
      setCustomMerch(data);
    } catch (error) {
      console.error('Error loading custom merch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMerch = (merch: CustomMerch) => {
    setSelectedMerch(merch);
    setShowMerchDetails(true);
  };

  const handleBackToList = () => {
    setShowMerchDetails(false);
    setSelectedMerch(null);
  };

  const handleStatusUpdate = async (id: string, newStatus: CustomMerchStatus) => {
    try {
      await apiService.updateCustomMerchStatus(id, newStatus);
      setCustomMerch(customMerch.map(m => m.id === id ? { ...m, status: newStatus } : m));
      alert(`Design ${newStatus} successfully!`);
      handleBackToList();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredMerch = customMerch.filter(merch => {
    const matchesSearch = merch.designName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      merch.designId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      merch.creator.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || merch.status === activeTab;
    const matchesStatus = statusFilter === 'all' || merch.status === statusFilter;
    const matchesType = typeFilter === 'all' || merch.productType === typeFilter;
    return matchesSearch && matchesTab && matchesStatus && matchesType;
  });

  const allCount = customMerch.length;
  const pendingCount = customMerch.filter(m => m.status === 'pending').length;
  const approvedCount = customMerch.filter(m => m.status === 'approved').length;
  const rejectedCount = customMerch.filter(m => m.status === 'rejected').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className='mb-6'>
        <h1 className="text-xl lg:text-2xl font-bold text-admin-primary">Custom Merch</h1>
        <p className="text-sm text-admin-primary">Review and manage custom merchandise designs</p>
      </div>

      {showMerchDetails && selectedMerch ? (
        <div className="bg-white rounded-xl">
          <div className="flex items-center gap-5 mb-6">
            <button
              onClick={handleBackToList}
              className="flex items-center space-x-2 text-admin-primary hover:text-admin-primary/80 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="font-medium text-admin-primary">View Merch Details</h2>
          </div>

          <div className="space-y-6">
            <div className="relative bg-accent-1 rounded-lg p-6">
              <div className="absolute top-4 right-4">
                <Badge variant={selectedMerch.status === 'approved' ? 'success' : selectedMerch.status === 'rejected' ? 'danger' : 'warning'}>
                  {selectedMerch.status}
                </Badge>
              </div>

              <div className="aspect-square max-w-md mx-auto bg-white rounded-lg overflow-hidden border border-accent-2 relative">
                {selectedMerch.image ? (
                  <img src={selectedMerch.image} alt="Design" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-grey">No Image</div>
                )}

                <div className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg border border-accent-2">
                  <p className="text-sm text-grey">Amount</p>
                  <p className="text-lg font-bold text-admin-primary">{formatCurrency(selectedMerch.amount)}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-admin-primary mb-4">Design Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-grey mb-1">Design Name</p>
                  <p className="text-admin-primary font-medium">{selectedMerch.designName}</p>
                </div>
                <div>
                  <p className="text-grey mb-1">Design ID</p>
                  <p className="text-admin-primary font-medium">{selectedMerch.designId}</p>
                </div>
                <div>
                  <p className="text-grey mb-1">Creator</p>
                  <p className="text-admin-primary font-medium">{selectedMerch.creator}</p>
                </div>
                <div>
                  <p className="text-grey mb-1">Product Type</p>
                  <p className="text-admin-primary font-medium">{selectedMerch.productType}</p>
                </div>
                <div>
                  <p className="text-grey mb-1">Date Created</p>
                  <p className="text-admin-primary font-medium">{formatDate(selectedMerch.dateCreated)}</p>
                </div>
                <div>
                  <p className="text-grey mb-1">Quantity</p>
                  <p className="text-admin-primary font-medium">{selectedMerch.quantity} units</p>
                </div>
              </div>
            </div>

            {selectedMerch.customText && (
              <div>
                <h3 className="font-semibold text-admin-primary mb-2">Custom Text</h3>
                <div className="bg-accent-1 p-4 rounded-lg">
                  <p className="text-admin-primary">{selectedMerch.customText}</p>
                </div>
              </div>
            )}

            {selectedMerch.status === 'pending' && (
              <div className="flex justify-center space-x-5 pt-5">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleStatusUpdate(selectedMerch.id, 'rejected')}
                >
                  <XCircle size={16} className="mr-2" />
                  Reject Design
                </Button>
                <Button
                  type="button"
                  onClick={() => handleStatusUpdate(selectedMerch.id, 'approved')}
                >
                  <CheckCircle size={16} className="mr-2" />
                  Approve Design
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="bg-admin-primary/4 rounded-t-xl p-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2 bg-white p-1">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-sm text-sm transition-all flex items-center ${activeTab === 'all'
                    ? 'bg-admin-primary text-white'
                    : 'bg-admin-primary/5 text-admin-primary'
                    }`}
                >
                  <span>All Merch</span>
                  <span className="ml-1">({allCount})</span>
                </button>
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-4 py-2 rounded-sm text-sm transition-all flex items-center ${activeTab === 'pending'
                    ? 'bg-admin-primary text-white'
                    : 'bg-admin-primary/5 text-admin-primary'
                    }`}
                >
                  <span>Pending Review</span>
                  <span className="ml-1">({pendingCount})</span>
                </button>
                <button
                  onClick={() => setActiveTab('approved')}
                  className={`px-4 py-2 rounded-sm text-sm transition-all flex items-center ${activeTab === 'approved'
                    ? 'bg-admin-primary text-white'
                    : 'bg-admin-primary/5 text-admin-primary'
                    }`}
                >
                  <span>Approved</span>
                  <span className="ml-1">({approvedCount})</span>
                </button>
                <button
                  onClick={() => setActiveTab('rejected')}
                  className={`px-4 py-2 rounded-sm text-sm transition-all flex items-center ${activeTab === 'rejected'
                    ? 'bg-admin-primary text-white'
                    : 'bg-admin-primary/5 text-admin-primary'
                    }`}
                >
                  <span>Rejected</span>
                  <span className="ml-1">({rejectedCount})</span>
                </button>
              </div>
              <Button>
                Export
              </Button>
            </div>
          </div>

          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between bg-admin-primary/4 p-6 gap-4'>
            <div>
              <h2 className="text-sm text-admin-primary/60 mb-1">All Merch Design</h2>
              <p className="text-2xl font-bold text-admin-primary">{filteredMerch.length}</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-grey" size={20} />
                <input
                  type="text"
                  placeholder="Search designs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white rounded-lg focus:outline-none sm:w-100 lg:w-150"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-white rounded-lg focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 bg-white rounded-lg focus:outline-none"
              >
                <option value="all">Type</option>
                <option value="Shirts">T-Shirt</option>
                <option value="Hoodie">Hoodie</option>
                <option value="Caps">Caps</option>
                <option value="Jackets">Jackets</option>
              </select>
              <select
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
                className="px-4 py-2 bg-white rounded-lg focus:outline-none"
              >
                <option value="today">Today</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="bg-admin-primary/4 rounded-b-xl overflow-hidden">
            {filteredMerch.length === 0 ? (
              <EmptyState
                title="No custom merch found"
                description="Try adjusting your filters or search criteria"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-accent-1 shadow-md shadow-black">
                    <tr>
                      <th className="text-left font-medium text-admin-primary px-6 py-4">Image</th>
                      <th className="text-left font-medium text-admin-primary px-6 py-4">Design Name</th>
                      <th className="text-left font-medium text-admin-primary px-6 py-4">Design ID</th>
                      <th className="text-left font-medium text-admin-primary px-6 py-4">Product Type</th>
                      <th className="text-left font-medium text-admin-primary px-6 py-4">Date Created</th>
                      <th className="text-left font-medium text-admin-primary px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMerch.map((merch) => (
                      <tr
                        key={merch.id}
                        onClick={() => handleViewMerch(merch)}
                        className="border-b border-accent-2 transition-colors bg-white cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="w-12 h-12 bg-accent-1 rounded-lg overflow-hidden">
                            {merch.image ? (
                              <img src={merch.image} alt={merch.designName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-grey text-xs">No Image</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-admin-primary">{merch.designName}</p>
                        </td>
                        <td className="px-6 py-4 text-admin-primary">{merch.designId}</td>
                        <td className="px-6 py-4 text-admin-primary">
                          {merch.productType}
                        </td>
                        <td className="px-6 py-4 text-admin-primary">{formatDate(merch.dateCreated)}</td>
                        <td className="px-6 py-4">
                          <Badge variant={merch.status === 'approved' ? 'success' : merch.status === 'rejected' ? 'danger' : 'warning'}>
                            {merch.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}