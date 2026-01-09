'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Calendar, DollarSign, Gift, TrendingUp } from 'lucide-react';
import { Button, Modal, Input, Badge, StatsCard } from '@/components/admin/ui';
import { mockDiscountCodes, mockLoyaltyPoints, mockPromotions } from '@/services/mock.service';

export default function LoyaltyPage() {
  const [activeTab, setActiveTab] = useState<'discounts' | 'points' | 'promotions' | 'analytics'>('discounts');
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary mb-1">Loyalty Program</h1>
        <p className="text-sm text-grey">Manage discount codes, loyalty points, and promotions</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 justify-end">
        <button className="flex items-center space-x-2 px-4 py-2 border border-accent-2 rounded-lg text-sm hover:bg-accent-1 transition-all">
          <Calendar size={16} className="text-grey" />
          <span>Jan 2025 - Dec 2025</span>
        </button>
        <button className="px-4 py-2 bg-accent-1 text-grey rounded-lg text-sm hover:bg-accent-2">Today</button>
        <button className="px-4 py-2 bg-accent-1 text-grey rounded-lg text-sm hover:bg-accent-2">Weekly</button>
        <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm">Monthly</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard icon={Gift} title="Active Campaigns" value="12" change={15} iconBgColor="bg-blue-50" iconColor="text-blue-600" />
        <StatsCard icon={TrendingUp} title="Total Redemptions" value="1,458" change={22.5} iconBgColor="bg-green-50" iconColor="text-green-600" />
        <StatsCard icon={DollarSign} title="Revenue Generated" value="₦2.8M" change={18.3} iconBgColor="bg-purple-50" iconColor="text-purple-600" />
        <StatsCard icon={Gift} title="Loyalty Members" value="3,240" change={12.7} iconBgColor="bg-orange-50" iconColor="text-orange-600" />
      </div>

      <div className="bg-white rounded-xl border border-accent-2 overflow-hidden">
        <div className="flex border-b border-accent-2">
          {['discounts', 'points', 'promotions', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 px-6 py-4 text-sm font-medium capitalize transition-colors ${
                activeTab === tab ? 'text-primary border-b-2 border-primary bg-accent-1/50' : 'text-grey hover:bg-accent-1'
              }`}
            >
              {tab === 'discounts' ? 'Discount Codes' : tab === 'points' ? 'Loyalty Points' : tab}
            </button>
          ))}
        </div>

        {activeTab === 'discounts' && (
          <div className="p-6">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">Discount Codes</h3>
              <Button onClick={() => setIsDiscountModalOpen(true)}>
                <Plus size={16} className="mr-2" />
                Create Discount Code
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-accent-1">
                  <tr>
                    <th className="text-left text-sm font-semibold text-grey px-4 py-3">Code</th>
                    <th className="text-left text-sm font-semibold text-grey px-4 py-3">Type</th>
                    <th className="text-left text-sm font-semibold text-grey px-4 py-3">Discount Value</th>
                    <th className="text-left text-sm font-semibold text-grey px-4 py-3">Usage</th>
                    <th className="text-left text-sm font-semibold text-grey px-4 py-3">Expiry Date</th>
                    <th className="text-left text-sm font-semibold text-grey px-4 py-3">Status</th>
                    <th className="text-left text-sm font-semibold text-grey px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mockDiscountCodes.map((code) => (
                    <tr key={code.id} className="border-t border-accent-2">
                      <td className="px-4 py-3 font-medium text-primary">{code.code}</td>
                      <td className="px-4 py-3 capitalize">{code.type}</td>
                      <td className="px-4 py-3">{code.type === 'percentage' ? `${code.value}%` : `₦${code.value}`}</td>
                      <td className="px-4 py-3">{code.usage}/{code.usageLimit}</td>
                      <td className="px-4 py-3 text-sm text-grey">{code.expiryDate}</td>
                      <td className="px-4 py-3"><Badge variant={code.status === 'active' ? 'success' : 'default'}>{code.status}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button className="p-1 hover:bg-accent-1 rounded"><Edit size={14} className="text-grey" /></button>
                          <button className="p-1 hover:bg-red-50 rounded"><Trash2 size={14} className="text-red-600" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'points' && (
          <div className="p-6">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">Points Allocation</h3>
              <Button onClick={() => setIsPointsModalOpen(true)}>
                <Plus size={16} className="mr-2" />
                Create Loyalty Point
              </Button>
            </div>
            <div className="space-y-4">
              {mockLoyaltyPoints.map((point) => (
                <div key={point.id} className="flex items-center justify-between p-4 bg-accent-1 rounded-lg">
                  <div>
                    <p className="font-medium text-primary">Purchase Amount ₦{point.purchaseAmount} = {point.pointsPerPurchase} points</p>
                    <p className="text-sm text-grey">Referral Bonus: {point.referralBonus} points | Birthday Bonus: {point.birthdayBonus} points</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-accent-2 rounded-lg"><Edit size={16} className="text-grey" /></button>
                    <button className="p-2 hover:bg-red-50 rounded-lg"><Trash2 size={16} className="text-red-600" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'promotions' && (
          <div className="p-6">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">Promotions</h3>
              <Button onClick={() => setIsPromoModalOpen(true)}>
                <Plus size={16} className="mr-2" />
                Create Promotion
              </Button>
            </div>
            <div className="space-y-3">
              {mockPromotions.map((promo) => (
                <div key={promo.id} className="flex items-center justify-between p-4 border border-accent-2 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <p className="font-medium text-primary">{promo.name}</p>
                      <Badge variant={promo.status === 'active' ? 'success' : promo.status === 'scheduled' ? 'info' : 'default'}>
                        {promo.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-grey">{promo.startDate} - {promo.endDate} | {promo.discount}% Discount</p>
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

        {activeTab === 'analytics' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Top Performing Campaigns</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div>
                  <p className="font-medium text-green-900">New Year Sale</p>
                  <p className="text-sm text-green-700">Discount Code Campaign</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-900">1,245</p>
                  <p className="text-xs text-green-700">Redemptions</p>
                </div>
                <p className="text-xl font-bold text-green-900">₦1.2M</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isDiscountModalOpen} onClose={() => setIsDiscountModalOpen(false)} title="Create Discount Code">
        <div className="space-y-4">
          <Input label="Discount Code Name" placeholder="e.g., NEWYEAR2025" />
          <Input label="Discount Value" type="number" placeholder="Enter value" />
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="secondary" onClick={() => setIsDiscountModalOpen(false)}>Cancel</Button>
            <Button>Create Code</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}