'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Eye, Download, CheckCircle, XCircle, ArrowLeft, ChevronLeft } from 'lucide-react';
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
  const [selectedSide, setSelectedSide] = useState<'front' | 'back' | 'side'>('front');
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [expandedMerchImage, setExpandedMerchImage] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalInfo, setApprovalInfo] = useState('');
  const merchImageRef = useRef<HTMLDivElement>(null);

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
    setSelectedSide('front');
    setShowMerchDetails(true);
  };

  const handleBackToList = () => {
    setShowMerchDetails(false);
    setSelectedMerch(null);
    setSelectedSide('front');
    setRejectionReason('');
    setApprovalInfo('');
  };

  const merchSideData = {
    front: {
      baseImage: '/byom/hoodie-black.png',
      customText: 'Faith Over Fear',
      textColor: '#FFFFFF',
      textSize: '20px',
      textPosition: { top: '45%', left: '50%' },
      customImage: '/stickers/sticker-1.png',
      customImagePosition: { top: '30%', left: '35%', width: '30px', height: '30px' },
      uploadedImage: '/assets/image.avif',
      uploadedImagePosition: { top: '60%', left: '50%', width: '100px', height: '100px' },
    },
    back: {
      baseImage: '/byom/hoodie-black.png',
      customText: 'John 3:16',
      textColor: '#ffffff',
      textSize: '20px',
      textPosition: { top: '40%', left: '50%' },
      customImage: '',
      customImagePosition: null,
      uploadedImage: '/assets/image2.avif',
      uploadedImagePosition: { top: '55%', left: '50%', width: '120px', height: '80px' },
    },
    side: {
      baseImage: '/byom/hoodie-black.png',
      customText: '',
      textColor: '',
      textSize: '',
      textPosition: null,
      customImage: '',
      customImagePosition: null,
      uploadedImage: '',
      uploadedImagePosition: null,
    },
  };

  const currentSideData = merchSideData[selectedSide];

  const handleDownloadImage = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${selectedSide}-design.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadMerchImage = async () => {
    if (!merchImageRef.current) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(merchImageRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const link = document.createElement('a');
      link.download = `${selectedMerch?.designName}-${selectedSide}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading merch image:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  const handleRejectDesign = () => {
    setShowRejectModal(true);
  };

  const handleApproveDesign = () => {
    setShowApproveModal(true);
  };

  const confirmReject = async () => {
    if (!selectedMerch) return;
    
    try {
      await apiService.updateCustomMerchStatus(selectedMerch.id, 'rejected');
      setCustomMerch(customMerch.map(m => m.id === selectedMerch.id ? { ...m, status: 'rejected' } : m));
      alert(`Design rejected successfully!`);
      setShowRejectModal(false);
      setRejectionReason('');
      handleBackToList();
    } catch (error) {
      console.error('Error rejecting design:', error);
    }
  };

  const confirmApprove = async () => {
    if (!selectedMerch) return;
    
    try {
      await apiService.updateCustomMerchStatus(selectedMerch.id, 'approved');
      setCustomMerch(customMerch.map(m => m.id === selectedMerch.id ? { ...m, status: 'approved' } : m));
      alert(`Design approved successfully!`);
      setShowApproveModal(false);
      setApprovalInfo('');
      handleBackToList();
    } catch (error) {
      console.error('Error approving design:', error);
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
      {showMerchDetails && selectedMerch ? (
        <div className="">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={handleBackToList}
              className=" text-admin-primary hover:text-admin-primary/80 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-admin-primary">Merch Details</h2>
          </div>

          <div className="bg-white">
            <div className="relative bg-admin-primary/4 rounded-t-lg p-6 pb-10">
              <div className="absolute top-4 right-4">
                <Badge variant={selectedMerch.status === 'approved' ? 'success' : selectedMerch.status === 'rejected' ? 'danger' : 'warning'}>
                  {selectedMerch.status}
                </Badge>
              </div>

              <div className="flex justify-center gap-3 mb-8">
                {(['front', 'back', 'side'] as const).map((side) => (
                  <button
                    key={side}
                    onClick={() => setSelectedSide(side)}
                    className={`px-8 py-1.5 rounded-md border capitalize transition-all ${selectedSide === side
                      ? 'border-admin-primary/67 text-admin-primary'
                      : ' text-admin-primary/50 border border-admin-primary/13'
                      }`}
                  >
                    {side}
                  </button>
                ))}
              </div>

              <div 
                ref={merchImageRef}
                className="aspect-square max-w-sm mx-auto bg-admin-primary/7 rounded-3xl overflow-hidden relative flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setExpandedMerchImage(true)}
              >
                {currentSideData.baseImage ? (
                  <img
                    src={currentSideData.baseImage}
                    alt={`${selectedSide} view`}
                    className="w-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-grey">No Image</div>
                )}

                {currentSideData.customImage && currentSideData.customImagePosition && (
                  <img
                    src={currentSideData.customImage}
                    alt="Custom icon"
                    className="absolute"
                    style={{
                      top: currentSideData.customImagePosition.top,
                      left: currentSideData.customImagePosition.left,
                      width: currentSideData.customImagePosition.width,
                      height: currentSideData.customImagePosition.height,
                      transform: 'translate(-50%, -50%)',
                      objectFit: 'contain',
                    }}
                  />
                )}

                {currentSideData.customText && currentSideData.textPosition && (
                  <div
                    className="absolute font-bold"
                    style={{
                      top: currentSideData.textPosition.top,
                      left: currentSideData.textPosition.left,
                      transform: 'translate(-50%, -50%)',
                      color: currentSideData.textColor,
                      fontSize: currentSideData.textSize,
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                    }}
                  >
                    {currentSideData.customText}
                  </div>
                )}

                {currentSideData.uploadedImage && currentSideData.uploadedImagePosition && (
                  <img
                    src={currentSideData.uploadedImage}
                    alt="Uploaded design"
                    className="absolute"
                    style={{
                      top: currentSideData.uploadedImagePosition.top,
                      left: currentSideData.uploadedImagePosition.left,
                      width: currentSideData.uploadedImagePosition.width,
                      height: currentSideData.uploadedImagePosition.height,
                      transform: 'translate(-50%, -50%)',
                      objectFit: 'contain',
                    }}
                  />
                )}
              </div>
            </div>

            <div className='bg-admin-primary/4 p-6'>
            <div className='bg-admin-primary/10 pt-6 p-6 rounded-xl'>
              <h3 className="font-semibold text-admin-primary mb-4">Merch Details</h3>
              <div className="space-y-4 text-sm">
                <div className='flex items-center justify-between'>
                  <p className="text-grey mb-1">Design Name</p>
                  <p className="text-admin-primary font-medium">{selectedMerch.designName}</p>
                </div>

                <div className='flex items-center justify-between'>
                  <p className="text-grey mb-1">Merch Color</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full border border-accent-2 bg-black"></div>
                    <p className="text-admin-primary font-medium">Black</p>
                  </div>
                </div>

                <div className='flex items-center justify-between'>
                  <p className="text-grey mb-1">Amount</p>
                  <p className="text-admin-primary font-medium">{formatCurrency(selectedMerch.amount)}</p>
                </div>

                <div className='flex items-center justify-between'>
                  <p className="text-grey mb-1">Merch Size</p>
                  <p className="text-admin-primary font-medium">Large</p>
                </div>

                <div className='flex items-center justify-between'>
                  <p className="text-grey mb-1">Merch Type</p>
                  <p className="text-admin-primary font-medium">{selectedMerch.productType}</p>
                </div>

                <div className='flex items-center justify-between'>
                  <p className="text-grey mb-1">Quantity</p>
                  <p className="text-admin-primary font-medium">{selectedMerch.quantity} units</p>
                </div>

                <div className='flex items-center justify-between'>
                  <p className="text-grey mb-1">Date Created</p>
                  <p className="text-admin-primary font-medium">{formatDate(selectedMerch.dateCreated)}</p>
                </div>

                {/* Design details */}
                <h3 className="font-semibold text-admin-primary mb-4 mt-10">Design Details</h3>

                <div className='flex items-center justify-between'>
                  <p className="text-grey mb-1">Creator</p>
                  <p className="text-admin-primary font-medium">{selectedMerch.creator}</p>
                </div>

                {currentSideData.textColor && (
                  <div className='flex items-center justify-between'>
                    <p className="text-grey mb-1">Text Color</p>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full border border-accent-2"
                        style={{ backgroundColor: currentSideData.textColor }}
                      ></div>
                      <p className="text-admin-primary font-medium">{currentSideData.textColor}</p>
                    </div>
                  </div>
                )}

                {currentSideData.customText && (
                  <div className="flex items-center justify-between">
                    <p className="text-grey mb-1">Custom Text ({selectedSide})</p>
                    <p className="text-admin-primary font-medium">{currentSideData.customText}</p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-grey mb-1">Text Size</p>
                  <p className="text-admin-primary font-medium">24px</p>
                </div>

                <div className='space-y-6'>
                  {currentSideData.customImage && (
                    <div className="mt-6">
                      <p className="text-admin-primary font-bold mb-1">Custom Image</p>
                      <div className="w-16 h-16 bg-accent-1 rounded-lg overflow-hidden border border-accent-2">
                        <img src={currentSideData.customImage} alt="Custom" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}

                  {currentSideData.uploadedImage && (
                    <div>
                      <h3 className="font-semibold text-admin-primary mb-3">Uploaded Image ({selectedSide})</h3>
                      <div className="bg-accent-1 p-4 rounded-lg w-60 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className="w-48 h-48 bg-white rounded-lg overflow-hidden border border-accent-2 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setExpandedImage(currentSideData.uploadedImage)}
                          >
                            <img
                              src={currentSideData.uploadedImage}
                              alt={`Uploaded ${selectedSide}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            variant='ghost'
                            size="sm"
                            onClick={() => handleDownloadImage(currentSideData.uploadedImage)}
                            className='flex items-center'
                          >
                            <Download size={16} className="mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            </div>

            {selectedMerch.status === 'pending' && (
              <div className="flex justify-center space-x-5 pt-7">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleRejectDesign}
                >
                  Reject Design
                </Button>
                <Button
                  type="button"
                  onClick={handleApproveDesign}
                >
                  Approve Design
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className='mb-6'>
            <h1 className="text-xl lg:text-2xl font-medium text-admin-primary">Custom Merch</h1>
            <p className="text-sm text-admin-primary">Review and manage custom merchandise designs</p>
          </div>

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
                  className="w-full pl-10 pr-4 py-2 bg-white rounded-lg focus:outline-none sm:w-96"
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
                        className="border-b border-accent-2 bg-white cursor-pointer"
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
                          <p className=" text-admin-primary">{merch.designName}</p>
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

      {expandedImage && (
        <Modal
          isOpen={!!expandedImage}
          onClose={() => setExpandedImage(null)}
          title="Image Preview"
          size="sm"
        >
          <div className="flex flex-col items-center gap-4">
            <img
              src={expandedImage}
              alt="Expanded view"
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
            <Button
              onClick={() => handleDownloadImage(expandedImage)}
              className="flex items-center gap-2"
            >
              <Download size={16} />
              Download Image
            </Button>
          </div>
        </Modal>
      )}

      {expandedMerchImage && (
        <Modal
          isOpen={expandedMerchImage}
          onClose={() => setExpandedMerchImage(false)}
          title="Merch Design Preview"
          size="md"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="aspect-square max-w-lg mx-auto bg-admin-primary/7 rounded-3xl overflow-hidden relative flex items-center justify-center">
              {currentSideData.baseImage ? (
                <img
                  src={currentSideData.baseImage}
                  alt={`${selectedSide} view`}
                  className="w-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-grey">No Image</div>
              )}

              {currentSideData.customImage && currentSideData.customImagePosition && (
                <img
                  src={currentSideData.customImage}
                  alt="Custom icon"
                  className="absolute"
                  style={{
                    top: currentSideData.customImagePosition.top,
                    left: currentSideData.customImagePosition.left,
                    width: currentSideData.customImagePosition.width,
                    height: currentSideData.customImagePosition.height,
                    transform: 'translate(-50%, -50%)',
                    objectFit: 'contain',
                  }}
                />
              )}

              {currentSideData.customText && currentSideData.textPosition && (
                <div
                  className="absolute font-bold"
                  style={{
                    top: currentSideData.textPosition.top,
                    left: currentSideData.textPosition.left,
                    transform: 'translate(-50%, -50%)',
                    color: currentSideData.textColor,
                    fontSize: currentSideData.textSize,
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                  }}
                >
                  {currentSideData.customText}
                </div>
              )}

              {currentSideData.uploadedImage && currentSideData.uploadedImagePosition && (
                <img
                  src={currentSideData.uploadedImage}
                  alt="Uploaded design"
                  className="absolute"
                  style={{
                    top: currentSideData.uploadedImagePosition.top,
                    left: currentSideData.uploadedImagePosition.left,
                    width: currentSideData.uploadedImagePosition.width,
                    height: currentSideData.uploadedImagePosition.height,
                    transform: 'translate(-50%, -50%)',
                    objectFit: 'contain',
                  }}
                />
              )}
            </div>
            <Button
              onClick={downloadMerchImage}
              className="flex items-center gap-2"
            >
              <Download size={16} />
              Download Merch Design
            </Button>
          </div>
        </Modal>
      )}

      {showRejectModal && (
        <Modal
          isOpen={showRejectModal}
          onClose={() => {
            setShowRejectModal(false);
            setRejectionReason('');
          }}
          title="Reject"
          size="sm"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-admin-primary mb-2">
                Reason for rejection
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-4 py-3 border border-accent-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20 resize-none"
                rows={4}
                placeholder="Enter reason for rejecting this design..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmReject}
                variant="secondary"
              >
                Reject Design
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {showApproveModal && (
        <Modal
          isOpen={showApproveModal}
          onClose={() => {
            setShowApproveModal(false);
            setApprovalInfo('');
          }}
          title="Approve"
          size="sm"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-admin-primary mb-2">
                Additional Information
              </label>
              <textarea
                value={approvalInfo}
                onChange={(e) => setApprovalInfo(e.target.value)}
                className="w-full px-4 py-3 border border-accent-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20 resize-none"
                rows={4}
                placeholder="Enter any additional information (optional)..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowApproveModal(false);
                  setApprovalInfo('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmApprove}
              >
                Approve Design
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}