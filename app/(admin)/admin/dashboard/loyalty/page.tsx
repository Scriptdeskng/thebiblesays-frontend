'use client';

import { useState } from 'react';
import { Search, Edit, Trash2, Calendar, DollarSign, Gift, TrendingUp, ArrowLeft, ChevronLeft } from 'lucide-react';
import { Button, Modal, Input, Badge, StatsCard, StatsCard2 } from '@/components/admin/ui';

type LoyaltyTab = 'discount' | 'analytics';

interface DiscountCode {
  id: string;
  codeName: string;
  mode: 'Discount' | 'Promotion';
  type: 'Percentage' | 'Fixed Amount';
  value: number;
  usage: number;
  usageLimit: number;
  expiryDate: string;
  status: 'active' | 'expired';
}

interface Campaign {
  id: string;
  name: string;
  redemptions: number;
  amountSaved: number;
}

export default function LoyaltyPage() {
  const [activeTab, setActiveTab] = useState<LoyaltyTab>('discount');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetailsPage, setShowDetailsPage] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCode, setSelectedCode] = useState<DiscountCode | null>(null);
  const [dateFilter, setDateFilter] = useState('monthly');
  const [customDateRange, setCustomDateRange] = useState('Jan 2026 - Dec 2026');

  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([
    { id: '1', codeName: 'NEWYEAR2025', mode: 'Discount', type: 'Percentage', value: 20, usage: 150, usageLimit: 250, expiryDate: '2025-12-31', status: 'active' },
    { id: '2', codeName: 'WELCOME10', mode: 'Discount', type: 'Percentage', value: 10, usage: 89, usageLimit: 100, expiryDate: '2025-06-30', status: 'active' },
    { id: '3', codeName: 'FLASH500', mode: 'Promotion', type: 'Fixed Amount', value: 500, usage: 45, usageLimit: 50, expiryDate: '2025-03-15', status: 'active' },
    { id: '4', codeName: 'SUMMER25', mode: 'Discount', type: 'Percentage', value: 25, usage: 200, usageLimit: 200, expiryDate: '2024-08-31', status: 'expired' },
  ]);

  const [campaigns, setcampaigns] = useState<Campaign[]>([
    { id: '1', name: 'New Year Sale - NEWYEAR2025', redemptions: 1245, amountSaved: 1200000 },
    { id: '2', name: 'Welcome Discount - WELCOME10', redemptions: 856, amountSaved: 450000 },
    { id: '3', name: 'Flash Sale - FLASH500', redemptions: 423, amountSaved: 211500 },
    { id: '4', name: 'Summer Promo - SUMMER25', redemptions: 1089, amountSaved: 980000 },
    { id: '5', name: 'Easter Special - EASTER15', redemptions: 567, amountSaved: 340000 },
  ]);

  const [formData, setFormData] = useState({
    codeName: '',
    mode: 'Discount',
    type: 'Percentage',
    value: '',
    usageLimit: '',
    expiryDate: '',
    status: 'active',
  });

  const handleAddNew = () => {
    setSelectedCode(null);
    setIsEditMode(false);
    setFormData({
      codeName: '',
      mode: 'Discount',
      type: 'Percentage',
      value: '',
      usageLimit: '',
      expiryDate: '',
      status: 'active',
    });
    setShowDetailsPage(true);
  };

  const handleEdit = (code: DiscountCode) => {
    setSelectedCode(code);
    setIsEditMode(true);
    setFormData({
      codeName: code.codeName,
      mode: code.mode,
      type: code.type,
      value: code.value.toString(),
      usageLimit: code.usageLimit.toString(),
      expiryDate: code.expiryDate,
      status: code.status,
    });
    setShowDetailsPage(true);
  };

  const handleSave = () => {
    if (isEditMode && selectedCode) {
      setDiscountCodes(discountCodes.map(c =>
        c.id === selectedCode.id
          ? {
            ...c,
            codeName: formData.codeName,
            mode: formData.mode as any,
            type: formData.type as any,
            value: Number(formData.value),
            usageLimit: Number(formData.usageLimit),
            expiryDate: formData.expiryDate,
            status: formData.status as any,
          }
          : c
      ));
    } else {
      const newCode: DiscountCode = {
        id: String(discountCodes.length + 1),
        codeName: formData.codeName,
        mode: formData.mode as any,
        type: formData.type as any,
        value: Number(formData.value),
        usage: 0,
        usageLimit: Number(formData.usageLimit),
        expiryDate: formData.expiryDate,
        status: formData.status as any,
      };
      setDiscountCodes([...discountCodes, newCode]);
    }
    setShowDetailsPage(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this discount code?')) {
      setDiscountCodes(discountCodes.filter(c => c.id !== id));
    }
  };

  const filteredCodes = discountCodes.filter(code =>
    code.codeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getUsagePercentage = (usage: number, limit: number) => {
    return (usage / limit) * 100;
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <div>
      {showDetailsPage ? (
        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center gap-5 mb-6">
            <button
              onClick={() => setShowDetailsPage(false)}
              className="flex items-center space-x-2 text-admin-primary hover:text-admin-primary/80 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex-1">
              <h2 className="text-xl font-medium text-admin-primary">
                {isEditMode ? 'Edit Discount Code' : 'Create Discount Code'}
              </h2>
              <p className="text-sm text-grey">
                {isEditMode ? 'Update discount code details' : 'Create a new discount code'}
              </p>
            </div>
          </div>

          <div className="space-y-6 bg-admin-primary/4 p-6">
            <div className='flex items-center justify-end'>
              {isEditMode && (
                <div className='flex items-center gap-2'>
                  <p>status:</p>
                  <Badge variant={formData.status === 'active' ? 'success' : formData.status === 'expired' ? 'warning' : 'danger'}>
                    {formData.status}
                  </Badge>
                </div>
              )}
            </div>


            <Input
              label="Discount Code Name"
              value={formData.codeName}
              onChange={(e) => setFormData({ ...formData, codeName: e.target.value.toUpperCase() })}
              placeholder="e.g., NEWYEAR2025"
            />

            <div>
              <label className="block text-admin-primary font-medium mb-2">Mode</label>
              <select
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                className="w-full px-4 py-2 border border-admin-primary/35 rounded-lg focus:outline-none"
              >
                <option>Discount</option>
                <option>Promotion</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-admin-primary font-medium mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-admin-primary/35 rounded-lg focus:outline-none"
                >
                  <option>Percentage</option>
                  <option>Fixed Amount</option>
                </select>
              </div>
              <Input
                label="Value"
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder={formData.type === 'Percentage' ? 'e.g., 20' : 'e.g., 5000'}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Set Usage"
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                placeholder="e.g., 100"
              />
              <div>
                <label className="block text-admin-primary font-medium mb-2">Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-4 py-2 border border-admin-primary/35 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div>
                <label className="block text-admin-primary font-medium mb-3">Status</label>
                <div className="flex flex-wrap gap-3">
                  {['expired', 'active'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFormData({ ...formData, status })}
                      className={`px-6 py-2 rounded-md border transition-all capitalize ${formData.status === status
                        ? 'border-[#A1CBFF] text-[#3291FF] bg-secondary'
                        : 'border-admin-primary/35 text-admin-primary'
                        }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-5 pt-5">
              <Button type="button" variant="secondary" onClick={() => setShowDetailsPage(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-6'>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-admin-primary mb-2">Loyalty Program</h1>
              <p className="text-sm text-admin-primary">Manage discount codes and track campaign performance</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 justify-end mb-6">
              <div className="flex items-center space-x-2 px-4 py-2 bg-white border border-accent-2 rounded-lg">
                <Calendar size={16} className="text-grey" />
                <input
                  type="text"
                  value={customDateRange}
                  onChange={(e) => setCustomDateRange(e.target.value)}
                  className="text-sm text-admin-primary focus:outline-none bg-transparent w-48"
                  placeholder="Select date range"
                />
              </div>
              <button
                onClick={() => setDateFilter('today')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${dateFilter === 'today' ? 'bg-admin-primary text-white' : 'bg-accent-1 text-grey hover:bg-accent-2'
                  }`}
              >
                Today
              </button>
              <button
                onClick={() => setDateFilter('weekly')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${dateFilter === 'weekly' ? 'bg-admin-primary text-white' : 'bg-accent-1 text-grey hover:bg-accent-2'
                  }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setDateFilter('monthly')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${dateFilter === 'monthly' ? 'bg-admin-primary text-white' : 'bg-accent-1 text-grey hover:bg-accent-2'
                  }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setDateFilter('yearly')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${dateFilter === 'yearly' ? 'bg-admin-primary text-white' : 'bg-accent-1 text-grey hover:bg-accent-2'
                  }`}
              >
                Yearly
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatsCard icon={Gift} title="Active Campaigns" value="12" change={15} iconBgColor="bg-white" iconColor="text-[#626262]" />
            <StatsCard icon={TrendingUp} title="Total Redemptions" value="1,458" change={22.5} iconBgColor="bg-white" iconColor="text-[#626262]" />
            <StatsCard2 icon={DollarSign} title="Revenue Generated" value="₦2.8M" change={18.3} iconBgColor="bg-white" iconColor="text-[#626262]" />
            <StatsCard icon={Gift} title="Loyalty Members" value="3,240" change={12.7} iconBgColor="bg-white" iconColor="text-[#626262]" />
          </div>


          <div className="bg-admin-primary/4 rounded-t-xl p-4">
            <div className="flex flex-wrap gap-2 bg-white w-fit p-1">
              {[
                { key: 'discount', label: 'Discount' },
                { key: 'analytics', label: 'Analytics' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as LoyaltyTab)}
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

          {activeTab === 'discount' && (
            <>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between bg-admin-primary/4 p-6 gap-4'>
                <h2 className="text-lg font-semibold text-admin-primary">Discount Code</h2>
                <div className="flex gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-grey" size={20} />
                    <input
                      type="text"
                      placeholder="Search codes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white rounded-lg focus:outline-none sm:w-96"
                    />
                  </div>
                  <Button onClick={handleAddNew}>
                    Create Discount Code
                  </Button>
                </div>
              </div>

              <div className="bg-admin-primary/4 rounded-b-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-accent-1 shadow-md shadow-black">
                      <tr>
                        <th className="text-left font-medium text-admin-primary px-6 py-4">Code</th>
                        <th className="text-left font-medium text-admin-primary px-6 py-4">Code Type</th>
                        <th className="text-left font-medium text-admin-primary px-6 py-4">Mode</th>
                        <th className="text-left font-medium text-admin-primary px-6 py-4">Value</th>
                        <th className="text-left font-medium text-admin-primary px-6 py-4">Usage</th>
                        <th className="text-left font-medium text-admin-primary px-6 py-4">Expiry Date</th>
                        <th className="text-left font-medium text-admin-primary px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCodes.map((code) => (
                        <tr
                          key={code.id}
                          className="border-b border-accent-2 bg-white cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(code);
                          }}
                        >
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleEdit(code)}
                              className="text-admin-primary"
                            >
                              {code.codeName}
                            </button>
                          </td>
                          <td className="px-6 py-4"><p className='text-[#626262]'>{code.type}</p></td>
                          <td className="px-6 py-4 text-admin-primary">{code.mode}</td>
                          <td className="px-6 py-4 text-admin-primary">
                            {code.type === 'Percentage' ? `${code.value}%` : formatCurrency(code.value)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <p className="text-sm text-admin-primary">
                                {code.usage}/{code.usageLimit}
                              </p>
                              <div className="w-14 bg-[#626262]/16 rounded-full h-2">
                                <div
                                  className="bg-[#3291FF] h-2 rounded-full transition-all"
                                  style={{ width: `${getUsagePercentage(code.usage, code.usageLimit)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-admin-primary">{code.expiryDate}</td>
                          <td className="px-6 py-4">
                            <Badge variant={code.status === 'active' ? 'success' : code.status === 'expired' ? 'warning' : 'danger'}>
                              {code.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-admin-primary/4 rounded-b-xl p-6">
              <h2 className="text-lg font-semibold text-admin-primary mb-4">Top Performing Campaigns</h2>
              <div className="bg-white">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="bg-white p-6 border-b border-accent-2 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className=" text-admin-primary mb-1">{campaign.name}</p>
                      <div className="flex items-center gap-1 text-sm text-admin-primary">
                        <p>{campaign.redemptions.toLocaleString()}</p>
                        <p>Redemptions</p>
                      </div>
                    </div>

                    <div className="">
                      <p className="font-bold text-[#2AA31F]">{formatCurrency(campaign.amountSaved)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}